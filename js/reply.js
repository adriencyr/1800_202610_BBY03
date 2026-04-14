// DANIEL UCHECHUKWU-MOSES
// reply.js — Handles reply form submission and saves replies to Firestore as a subcollection.
// Gets post ID from URL parameter (?postID=), reads reply text from textarea,
// saves to 'posts/{postId}/replies' subcollection, then redirects back to post-details.html.

import '../css/reply.css';
import { db, auth } from "./firebaseConfig.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

// ── Element references ──────────────────────────────────────────────────────
const formEl = document.getElementById("replyForm");
const textareaEl = document.getElementById("replyTextarea");
const submitBtn = document.getElementById("submitReplyBtn");
const successBannerEl = document.getElementById("replySuccessBanner");
const formSectionEl = document.getElementById("replyFormSection");
const postedReplyBlockEl = document.getElementById("postedReplyBlock");
const postedReplyTextEl = document.getElementById("postedReplyText");
const postSubmitActionsEl = document.getElementById("postSubmitActions");
const backToPostBtn = document.getElementById("btn-back-to-post");
const backToPostSubmitBtn = document.getElementById("btn-back-to-post-submit");

// ── Helper: get URL query parameters ────────────────────────────────────────
function getUrlParam(paramName) {
  const params = new URLSearchParams(window.location.search);
  return params.get(paramName);
}

// ── Initialize: set back button hrefs with postID parameter ──────────────────
const postId = getUrlParam("postID");
if (postId) {
  const backLink = `/pages/post-details.html?docID=${postId}`;
  if (backToPostBtn) backToPostBtn.href = backLink;
  if (backToPostSubmitBtn) backToPostSubmitBtn.href = backLink;
}

// ── Main: handle form submission ────────────────────────────────────────────
submitBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  // Get the current user's username from Firestore
  const currentUser = auth.currentUser;

  if (!currentUser) {
    alert("You must be logged in to reply");
    return;
  }

  let authorName = "Anonymous"; // fallback
  try {
    const userRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      authorName = userSnap.data().username;
    }
  } catch (err) {
    console.error("Error fetching user:", err);
  }

  const replyText = textareaEl.value.trim();
  const postId = getUrlParam("postID");

  // Validate inputs
  if (!replyText) {
    alert("Please write a reply");
    return;
  }

  if (!postId) {
    alert("Error: Post ID not found");
    return;
  }

  // Disable submit button and show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2"></span>Posting...';

  try {
    // Create reply document
    const replyData = {
      author: authorName,
      authorId: currentUser.uid, // ADD THIS LINE
      body: replyText,
      replyCreated: serverTimestamp(),
      likes: 0,
    };

    // Add document to Firestore 'posts/{postId}/replies' subcollection
    const repliesCollection = collection(db, "posts", postId, "replies");
    await addDoc(repliesCollection, replyData);

    // Show success message and posted reply preview
    successBannerEl.style.display = "block";
    formSectionEl.style.display = "none";
    postedReplyTextEl.textContent = replyText;
    postedReplyBlockEl.style.display = "block";
    postSubmitActionsEl.style.display = "flex";

    // Redirect back to post-details.html after 2 seconds
    setTimeout(() => {
      window.location.href = `/pages/post-details.html?docID=${postId}`;
    }, 2000);
  } catch (err) {
    // Firestore error — show alert and reset form
    console.error("Error saving reply:", err);
    alert("Failed to post reply. Please try again.");

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i> Submit Reply';
  }
});
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
