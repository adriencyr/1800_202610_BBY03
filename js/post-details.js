// DANIEL UCHECHUKWU-MOSES
// post-details.js — Reads ?docID= from the URL, fetches the matching post
// document from Firestore, and injects all fields into the page's HTML elements.
// Shows a loading spinner while fetching and an error state if the ID is
// missing or the document does not exist.

import { db }           from './firebaseConfig.js';
import { doc, getDoc }  from 'firebase/firestore';

// ── Element references ──────────────────────────────────────────────────────
const postCard    = document.getElementById('post-detail-1');
const loadingEl   = document.getElementById('post-loading');
const errorEl     = document.getElementById('post-error');

const titleEl     = document.getElementById('post-title');
const authorEl    = document.getElementById('post-author');
const bodyEl      = document.getElementById('post-body');
const upvoteEl    = document.getElementById('upvote-count');
const dateEl      = document.getElementById('post-date');
const categoryEl  = document.getElementById('post-category');

// ── Helper: format a Firestore Timestamp into a readable date string ─────────
function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return date.toLocaleDateString('en-CA', {
    year:  'numeric',
    month: 'long',
    day:   'numeric'
  });
}

// ── Helper: toggle visibility ────────────────────────────────────────────────
function show(el) { el.classList.remove('d-none'); }
function hide(el) { el.classList.add('d-none');    }

// ── Main: load the post ──────────────────────────────────────────────────────
async function loadPost() {
  // 1. Read docID from URL — e.g. post-details.html?docID=abc123
  const params = new URLSearchParams(window.location.search);
  const docID  = params.get('docID');

  // 2. No docID → show error immediately, nothing else to do
  if (!docID) {
    hide(loadingEl);
    show(errorEl);
    return;
  }

  // 3. Show spinner while fetching
  show(loadingEl);
  hide(postCard);
  hide(errorEl);

  try {
    // 4. Fetch the post document from the 'posts' collection
    const docRef  = doc(db, 'posts', docID);
    const docSnap = await getDoc(docRef);

    // 5. Document not found → show error
    if (!docSnap.exists()) {
      hide(loadingEl);
      show(errorEl);
      return;
    }

    // 6. Inject all fields into their HTML containers
    const data = docSnap.data();

    titleEl.textContent    = data.title    || 'Untitled';
    authorEl.textContent   = '@' + (data.author || 'unknown');
    bodyEl.textContent     = data.body     || '';
    upvoteEl.textContent   = data.favorites ?? 0;
    dateEl.textContent     = formatDate(data.postCreated);
    categoryEl.textContent = (data.tags && data.tags.length > 0)
                               ? data.tags[0]
                               : 'General';

    // 7. Reveal the post card, hide the spinner
    hide(loadingEl);
    show(postCard);

  } catch (err) {
    // Firestore error (e.g. network issue, permission denied)
    console.error('Error loading post:', err);
    hide(loadingEl);
    show(errorEl);
  }
}

// Run once the DOM is ready
document.addEventListener('DOMContentLoaded', loadPost);
