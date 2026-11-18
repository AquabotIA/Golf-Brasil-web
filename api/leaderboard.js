import { database } from "../lib/firebase-admin.js";

function normalizeCourse(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const course = normalizeCourse(req.query.course);
    if (!course) {
      return res.status(400).json({ error: "Query parameter course is required" });
    }

    const requestedLimit = Number(req.query.limit || 20);
    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 50)
      : 20;

    const scoresQuery = database
      .ref(`leaderboard/${course}`)
      .orderByChild("strokes")
      .limitToFirst(limit);

    const snapshot = await scoresQuery.get();
    const entries = [];

    snapshot.forEach((child) => {
      entries.push({ ...child.val(), uid: child.key });
    });

    return res.status(200).json({
      ok: true,
      course,
      count: entries.length,
      entries
    });
  } catch (error) {
    console.error("Leaderboard query failed:", error);
    return res.status(500).json({ error: "Could not load leaderboard" });
  }
}
