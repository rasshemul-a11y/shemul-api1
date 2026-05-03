import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Use environment variables for Vercel/Production
// Use fallback for local development if needed
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

// Check if we are in AI Studio environment or if env vars are missing
const isEnvMissing = !firebaseConfig.apiKey;

let finalConfig = firebaseConfig;

if (isEnvMissing) {
  try {
    // In AI Studio, we might have the config file
    // @ts-ignore
    import('../../firebase-applet-config.json').then(config => {
       // This is async, so we might need a different approach for initialization
       // But for now, let's assume the user will set env vars in Vercel.
    });
  } catch (e) {}
}

// Actually, to comply with AI Studio guidelines and make it work everywhere easily:
import studioConfig from '../../firebase-applet-config.json';

finalConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || studioConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || studioConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || studioConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || studioConfig.authDomain,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || studioConfig.firestoreDatabaseId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || studioConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || studioConfig.messagingSenderId,
};

const app = initializeApp(finalConfig);
export const db = getFirestore(app, finalConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Simple connectivity check
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.error("Firebase connection issue.");
    }
  }
}

testConnection();
