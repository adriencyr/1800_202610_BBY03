import { auth, db } from "/js/firebaseConfig.js";
import { doc, setDoc } from "firebase/firestore";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  signOut,
} from "firebase/auth";

import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

export async function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signupUser(name, email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  try {
    // Create a Firestore document for the new user with default values
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      country: "Canada", // Default value
      school: "BCIT",    // Default value
      userId: user.uid,
      dateJoined: serverTimestamp()
    });
    console.log("Firestore user document created successfully!");
} catch (error) {
  // Information for debugging: show the error code  
  // In a real app, you might want to show a user-friendly message instead of the raw error.
  // console.error("Error creating user document in Firestore:", error);
  // console output may not be seen if redirection to main.html happens
  // Therefore, we can try "alert".  
  alert(`Error creating user document:\n${error.code || ""}\n${error.message || error}`);
}
  await updateProfile(userCredential.user, { displayName: name });

  // NEW CODE: Create Firestore user document
  const userId = userCredential.user.uid;
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, {
    username: name,
    userId: userId,
    timeCreated: new Date(),
    bookmarks: [],
    avatar: null,
  });

  return userCredential.user;
}

export async function logoutUser() {
  await signOut(auth);
  window.location.href = "../index.html";
}

export function checkAuthState() {
  onAuthStateChanged(auth, (user) => {
    const path = window.location.pathname;

    const protectedPages = ["main.html", "bookmarks.html", "settings.html"];

    if (protectedPages.some((page) => path.endsWith(page))) {
      if (!user) {
        window.location.href = "../index.html";
      }
    }
  });
}

export function onAuthReady(callback) {
  return onAuthStateChanged(auth, callback);
}

export function authErrorMessage(error) {
  const code = (error?.code || "").toLowerCase();

  const map = {
    "auth/invalid-credential": "Wrong email or password.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/email-already-in-use": "Email is already in use.",
    "auth/weak-password": "Password too weak (min 6 characters).",
    "auth/missing-password": "Password cannot be empty.",
    "auth/network-request-failed": "Network error. Try again.",
  };

  return map[code] || "Something went wrong. Please try again.";
}
