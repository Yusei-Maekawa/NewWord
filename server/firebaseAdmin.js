const admin = require('firebase-admin');
const path = require('path');

// Expect service account JSON at ./secrets/serviceAccountKey.json (gitignored)
const keyPath = path.join(__dirname, '..', 'secrets', 'serviceAccountKey.json');

let db = null;
let bucket = null;
let initialized = false;

try {
  const serviceAccount = require(keyPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.appspot.com`
  });
  // Only call service methods after successful initialization
  db = admin.firestore();
  if (admin.storage) {
    try {
      bucket = admin.storage().bucket();
    } catch (e) {
      // storage might not be available in some environments
      bucket = null;
    }
  }
  initialized = true;
} catch (err) {
  // Intentionally do not throw; script callers must ensure the service account exists
  console.warn('firebaseAdmin: service account not found or failed to initialize at', keyPath);
}

module.exports = { admin, db, bucket, initialized };
