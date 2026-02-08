import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSy_PLACEHOLDER",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "titan-os.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "titan-os",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "titan-os.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

let app = null;
let auth = null;
let db = null;
let isOffline = true;

try {
    // Check if we have a potentially valid key (not the placeholder)
    // Note: This is a basic check. Real validation happens when Firebase tries to connect.
    const apiKey = firebaseConfig.apiKey;
    if (apiKey && apiKey !== "AIzaSy_PLACEHOLDER" && !apiKey.startsWith("AIzaSy...")) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        isOffline = false;
        console.log("Titan OS: Online Mode Initialized");
    } else {
        console.warn("Titan OS: Invalid API Key. Running in Offline Demo Mode.");
    }
} catch (e) {
    console.error("Titan OS: Initialization Error. Defaulting to Offline Mode.", e);
    isOffline = true;
}

export { auth, db, isOffline };
export const APP_ID_DB = 'titan-net-db';