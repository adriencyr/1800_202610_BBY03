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
  apiKey: "AIzaSyBmQ5--MS-wMIIkjLTbSAex99xXpXbnpKM",
  authDomain: "bby03-61c23.firebaseapp.com",
  projectId: "bby03-61c23",
  storageBucket: "bby03-61c23.firebasestorage.app",
  messagingSenderId: "442471547969",
  appId: "1:442471547969:web:0782cb600b81c5257a32c0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
