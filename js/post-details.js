// DANIEL UCHECHUKWU-MOSES
// post-details.js — Reads ?docID= from the URL, fetches the matching post
// document from Firestore, and injects all fields into the page's HTML elements.
// Shows a loading spinner while fetching and an error state if the ID is
// missing or the document does not exist.

import { db }                          from './firebaseConfig.js';
import { doc, getDoc, collection, getDocs }  from 'firebase/firestore';

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

const repliesLoadingEl = document.getElementById('replies-loading');
const repliesHeadingEl = document.getElementById('replies-heading');
const repliesCountEl   = document.getElementById('reply-count');
const repliesContainerEl = document.getElementById('repliesContainer');
const replyButtonEl    = document.getElementById('btn-reply');

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

// ── Helper: create a reply card HTML element ──────────────────────────────────
function createReplyCard(reply) {
  const replyDiv = document.createElement('div');
  replyDiv.className = 'reply-card p-3 mb-2';

  const replyHTML = `
    <div class="d-flex align-items-start gap-2">
      <div class="reply-avatar">
        <i class="bi bi-person-fill"></i>
      </div>
      <div class="flex-grow-1">
        <span class="reply-username">${reply.author || 'Anonymous'}</span>
        <p class="reply-text">
          ${reply.body || ''}
        </p>
        <div class="d-flex justify-content-end reply-likes">
          ${reply.likes || 0} <i class="bi bi-hand-thumbs-up-fill ms-1"></i>
        </div>
      </div>
    </div>
  `;

  replyDiv.innerHTML = replyHTML;
  return replyDiv;
}

// ── Load replies from Firestore subcollection ─────────────────────────────────
async function loadReplies(postId) {
  try {
    show(repliesLoadingEl);
    repliesContainerEl.innerHTML = '';

    const repliesRef = collection(db, 'posts', postId, 'replies');
    const querySnapshot = await getDocs(repliesRef);

    const replies = [];
    querySnapshot.forEach((doc) => {
      replies.push(doc.data());
    });

    // Update reply count
    repliesCountEl.textContent = replies.length;

    if (replies.length > 0) {
      show(repliesHeadingEl);
      // Render each reply
      replies.forEach((reply) => {
        const replyCard = createReplyCard(reply);
        repliesContainerEl.appendChild(replyCard);
      });
    } else {
      hide(repliesHeadingEl);
      repliesContainerEl.innerHTML = '<p class="text-muted text-center py-3">No replies yet. Be the first to reply!</p>';
    }

  } catch (err) {
    console.error('Error loading replies:', err);
    repliesContainerEl.innerHTML = '<p class="text-danger text-center py-3">Failed to load replies.</p>';
  } finally {
    hide(repliesLoadingEl);
  }
}

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

    // 8. Add click listener to upvote button
    upvoteEl.style.cursor = 'pointer';
    upvoteEl.addEventListener('click', () => {
      console.log('Upvote clicked');
    });

    // 9. Update reply button with post ID and load replies
    replyButtonEl.href = `reply.html?postID=${docID}`;
    await loadReplies(docID);

  } catch (err) {
    // Firestore error (e.g. network issue, permission denied)
    console.error('Error loading post:', err);
    hide(loadingEl);
    show(errorEl);
  }
}

// Run once the DOM is ready
document.addEventListener('DOMContentLoaded', loadPost);
