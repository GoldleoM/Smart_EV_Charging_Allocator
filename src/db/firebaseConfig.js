require('dotenv').config();
const admin = require('firebase-admin');

let serviceAccount;
try {
  // We expect FIREBASE_SERVICE_ACCOUNT to be a JSON string
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
} catch (error) {
  console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT. Ensure it is a valid JSON string.");
}

if (serviceAccount && process.env.FIREBASE_DB_URL) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DB_URL
    });
    console.log("Firebase Admin SDK initialized.");
  } catch(e) {
    console.error("Firebase Admin SDK initialization error:", e.message);
  }
} else {
  console.warn("WARNING: Missing FIREBASE_SERVICE_ACCOUNT or FIREBASE_DB_URL in environment. Will simulate database offline.");
}

// We provide the admin object. If initializeApp wasn't called, any db() call will fail.
// So we conditionally export db or a mock db fallback.
const db = admin.apps.length > 0 ? admin.database() : null;

module.exports = { admin, db };
