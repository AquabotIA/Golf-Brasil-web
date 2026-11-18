import { adminAuth, database } from "../lib/firebase-admin.js";

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

function normalizeCourse(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: "Missing Firebase ID token" });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const body = req.body || {};
    const course = normalizeCourse(body.course);
    const holes = Number(body.holes);
    const strokes = Number(body.strokes);

    if (!course || ![9, 18].includes(holes) ||
        !Number.isInteger(strokes) || strokes < holes || strokes > 300) {
      return res.status(400).json({
        error: "Invalid score. Provide course, holes (9 or 18), and total strokes."
      });
    }

    const uid = decoded.uid;
    const displayName = String(
      decoded.name || decoded.email?.split("@")[0] || "Golfista"
    ).slice(0, 40);

    const scoreRef = database.ref(`scores/${course}/${uid}`).push();
    const record = {
      uid,
      displayName,
      course,
      holes,
      strokes,
      playedAt: Date.now()
    };

    await scoreRef.set(record);

    const bestRef = database.ref(`leaderboard/${course}/${uid}`);
    const transaction = await bestRef.transaction((current) => {
      if (!current || strokes < current.strokes) {
        return record;
      }
      return current;
    });

    return res.status(201).json({
      ok: true,
      scoreId: scoreRef.key,
      personalBestUpdated: transaction.committed,
      score: record
    });
  } catch (error) {
    console.error("Score submission failed:", error);
    const status = error?.code === "auth/id-token-expired" ||
      error?.code === "auth/argument-error" ||
      error?.code === "auth/invalid-id-token" ? 401 : 500;
    return res.status(status).json({
      error: status === 401 ? "Invalid or expired Firebase ID token" : "Could not save score"
    });
  }
}
