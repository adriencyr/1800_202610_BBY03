// DANIEL UCHECHUKWU-MOSES
// newpost.js — Handles post form submission and saves new posts to Firestore.
// Reads form inputs (title, category, body), creates a document with timestamp,
// saves to the 'posts' collection, then shows success message.

import { db, auth } from "./firebaseConfig.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

// ── Element references ──────────────────────────────────────────────────────
const formEl = document.getElementById("newpostForm");
const titleEl = document.getElementById("postTitle");
const categoryEl = document.getElementById("postCategory");
const bodyEl = document.getElementById("postBody");
const submitBtn = document.getElementById("btn-submit");

const formContainerEl = document.getElementById("newpost-form-container");
const loadingEl = document.getElementById("post-loading");
const successEl = document.getElementById("post-success");
const postedEl = document.getElementById("post-posted");
const postedTitleEl = document.getElementById("posted-title");
const postedBodyEl = document.getElementById("posted-body");

// Get all filter buttons
const filterButtons = document.querySelectorAll(".filter-btn");

// Create hidden file input for image uploads
const imageInput = document.createElement("input");
imageInput.type = "file";
imageInput.accept = "image/*";
imageInput.style.display = "none";
document.body.appendChild(imageInput);

// ── Helper: show/hide elements ──────────────────────────────────────────────
function show(el) {
  el.style.display = "block";
}
function hide(el) {
  el.style.display = "none";
}

// ── Insert text at cursor position ──────────────────────────────────────────
function insertTextAtCursor(text) {
  const start = bodyEl.selectionStart;
  const end = bodyEl.selectionEnd;
  const before = bodyEl.value.substring(0, start);
  const after = bodyEl.value.substring(end);
  bodyEl.value = before + text + after;
  bodyEl.selectionStart = bodyEl.selectionEnd = start + text.length;
  bodyEl.focus();
}

// ── Button click handlers ──────────────────────────────────────────────────
function setupMediaButtons() {
  filterButtons.forEach((btn, index) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      switch (index) {
        case 0: // Image
          imageInput.click();
          break;
        case 1: // GIF
          alert("GIF search feature coming soon!");
          break;
        case 2: // Poll
          alert("Poll feature coming soon!");
          break;
        case 3: // Mention (@)
          insertTextAtCursor("@");
          break;
        case 4: // Emoji
          insertTextAtCursor("😊");
          break;
        case 5: // Schedule
          alert("Schedule feature coming soon!");
          break;
        case 6: // Location
          alert("Location feature coming soon!");
          break;
        case 7: // Bookmark (save draft)
          alert("Draft saved!");
          break;
      }
    });
  });
}

// Handle image upload
imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageName = file.name;
      insertTextAtCursor(`[Image: ${imageName}]`);
    };
    reader.readAsDataURL(file);
  }
});

// Initialize media buttons on page load
setupMediaButtons();

// ── Main: handle form submission ────────────────────────────────────────────
formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  // Get the current user's username from Firestore
  const currentUser = auth.currentUser;

  if (!currentUser) {
    alert("You must be logged in to create a post");
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

  const title = titleEl.value.trim();
  const category = categoryEl.value.trim();
  const body = bodyEl.value.trim();

  // Validate all fields are filled
  if (!title || !category || !body) {
    alert("Please fill in all fields");
    return;
  }

  // Show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2"></span>Posting...';
  show(loadingEl);
  hide(formContainerEl);

  try {
    // Create new post document
    const newPostData = {
      title: title,
      body: body,
      author: authorName,
      authorId: currentUser.uid, // ADD THIS LINE
      postCreated: serverTimestamp(),
      tags: [category],
      favorites: 0,
      replies: [],
    };

    // Add document to Firestore 'posts' collection
    const docRef = await addDoc(collection(db, "posts"), newPostData);

    // Hide loading spinner and show success message and posted preview
    hide(loadingEl);
    show(successEl);
    postedTitleEl.textContent = title;
    postedBodyEl.textContent = body;
    show(postedEl);

    // Redirect to post.html after 2 seconds (let user see success)
    setTimeout(() => {
      window.location.href = "post.html";
    }, 2000);
  } catch (err) {
    // Firestore error — show alert and reset form
    console.error("Error saving post:", err);
    alert("Failed to create post. Please try again.");

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="bi bi-send me-1"></i> Post';
    hide(loadingEl);
    show(formContainerEl);
  }
});
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
