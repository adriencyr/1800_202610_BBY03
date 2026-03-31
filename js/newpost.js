// DANIEL UCHECHUKWU-MOSES
// newpost.js — Handles post form submission and saves new posts to Firestore.
// Reads form inputs (title, category, body), creates a document with timestamp,
// saves to the 'posts' collection, then shows success message.

import { db } from './firebaseConfig.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// ── Element references ──────────────────────────────────────────────────────
const formEl        = document.getElementById('newpostForm');
const titleEl       = document.getElementById('postTitle');
const categoryEl    = document.getElementById('postCategory');
const bodyEl        = document.getElementById('postBody');
const submitBtn     = document.getElementById('btn-submit');

const formContainerEl  = document.getElementById('newpost-form-container');
const loadingEl        = document.getElementById('post-loading');
const successEl        = document.getElementById('post-success');
const postedEl         = document.getElementById('post-posted');
const postedTitleEl    = document.getElementById('posted-title');
const postedBodyEl     = document.getElementById('posted-body');

// ── Helper: show/hide elements ──────────────────────────────────────────────
function show(el) { el.style.display = 'block'; }
function hide(el) { el.style.display = 'none';  }

// ── Main: handle form submission ────────────────────────────────────────────
formEl.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title    = titleEl.value.trim();
  const category = categoryEl.value.trim();
  const body     = bodyEl.value.trim();

  // Validate all fields are filled
  if (!title || !category || !body) {
    alert('Please fill in all fields');
    return;
  }

  // Show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Posting...';
  show(loadingEl);
  hide(formContainerEl);

  try {
    // Create new post document
    const newPostData = {
      title:       title,
      body:        body,
      author:      'Anonymous', // TODO: get from logged-in user context
      postCreated: serverTimestamp(),
      tags:        [category],
      favorites:   0,
      replies:     []
    };

    // Add document to Firestore 'posts' collection
    const docRef = await addDoc(collection(db, 'posts'), newPostData);

    // Show success message and posted preview
    show(successEl);
    postedTitleEl.textContent = title;
    postedBodyEl.textContent  = body;
    show(postedEl);

    // Redirect to post.html after 2 seconds (let user see success)
    setTimeout(() => {
      window.location.href = 'post.html';
    }, 2000);

  } catch (err) {
    // Firestore error — show alert and reset form
    console.error('Error saving post:', err);
    alert('Failed to create post. Please try again.');

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="bi bi-send me-1"></i> Post';
    hide(loadingEl);
    show(formContainerEl);
  }
});
