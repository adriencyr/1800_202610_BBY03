// DANIEL UCHECHUKWU-MOSES
// Firebase app initialisation — imported by all JS modules that need Firestore.
//
// HOW TO FILL THIS IN:
//   1. Go to https://console.firebase.google.com
//   2. Open project "1800-202610-BBY03"
//   3. Click the ⚙️ gear icon → Project Settings
//   4. Scroll to "Your apps" → click the </> (Web) app
//   5. Copy the firebaseConfig object values into the fields below

import { initializeApp } from 'firebase/app';
import { getFirestore }   from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            "REPLACE_WITH_YOUR_API_KEY",
  authDomain:        "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId:         "1800-202610-bby03",
  storageBucket:     "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId:             "REPLACE_WITH_YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
