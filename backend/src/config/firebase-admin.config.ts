// Firebase Admin SDK Configuration for Backend
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: 'almasar-callcenter',
      // سيتم إضافة Service Account Key من Environment Variables
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: `https://almasar-callcenter.firebaseio.com`,
  });
}

export const firestore = admin.firestore();
export const auth = admin.auth();

export default admin;
