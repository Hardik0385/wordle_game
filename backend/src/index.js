const admin = require('firebase-admin');

// Initialize Firebase Admin (optional: use serviceAccountKey.json if running custom backend server)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = {
  admin,
  db,
  auth
};
