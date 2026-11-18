import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";

const required = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_DATABASE_URL",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY"
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing Firebase environment variables: ${missing.join(", ")}`);
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });

export const adminAuth = getAuth(app);
export const database = getDatabase(app);
