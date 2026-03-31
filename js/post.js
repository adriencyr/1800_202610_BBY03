// DANIEL UCHECHUKWU-MOSES
// post.js — Loads all posts from Firestore and renders them dynamically to the post feed.
// Fetches posts from the 'posts' collection, displays them with title, category, excerpt,
// upvote count, and comment count. Shows loading spinner while fetching.

import { db } from './firebaseConfig.js';
import { collection, getDocs } from 'firebase/firestore';
import { getUserBookmarks, getBookmarkUser, toggleBookmark } from './bookmark.js';

// ── Element references ──────────────────────────────────────────────────────
const postsFeedEl = document.getElementById('postsFeed');
const loadingEl = document.getElementById('posts-loading');

// ── Helper: truncate text to a certain length ──────────────────────────────
function truncateExcerpt(text, maxLength = 200) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
}

// ── Helper: update bookmark icon UI ────────────────────────────────────────
function updateSaveButtonUI(button, isSaved) {
  button.classList.remove('bi-star', 'bi-star-fill');
  button.classList.add(isSaved ? 'bi-star-fill' : 'bi-star');
}

// ── Helper: create a post card element ──────────────────────────────────────
function createPostCard(post, docId) {
  const excerpt = truncateExcerpt(post.body);
  const category = post.tags && post.tags.length > 0 ? post.tags[0] : 'General';
  const commentCount = post.replies && Array.isArray(post.replies) ? post.replies.length : 0;

  const postHTML = `
    <div id="post-${docId}" class="card mb-3 post-card">
      <div class="card-body">
        <div class="d-flex align-items-start gap-2">
          <i class="bi bi-person-circle avatar-icon"></i>
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <a href="post-details.html?docID=${docId}" class="post-title-link"><p class="post-title mb-1">${post.title}</p></a>
                <div class="d-flex align-items-center gap-1 mb-2">
                  <span class="post-category-badge">${category}</span>
                </div>
              </div>
              <i 
                class="bi bi-star post-save-btn ms-2" 
                data-post-id="${docId}" 
                style="cursor: pointer;"
                title="Save post"
              ></i>
            </div>
            <p class="post-excerpt">"${excerpt}"</p>
            <div class="d-flex gap-3 post-meta-counts">
              <span id="upvote-btn-${docId}" class="upvote-btn" style="cursor: pointer;"><i class="bi bi-arrow-up-circle me-1"></i>${post.favorites || 0}</span>
              <span><i class="bi bi-chat me-1"></i>${commentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return postHTML;
}

// ── Initialize bookmark states for rendered posts ──────────────────────────
async function initializePostBookmarkButtons() {
  const saveButtons = document.querySelectorAll('.post-save-btn');
  const user = await getBookmarkUser();

  if (!user) {
    saveButtons.forEach((button) => updateSaveButtonUI(button, false));
    return;
  }

  const bookmarks = await getUserBookmarks();

  saveButtons.forEach((button) => {
    const postId = button.dataset.postId;
    const isSaved = bookmarks.includes(postId);
    updateSaveButtonUI(button, isSaved);
  });
}

// ── Attach bookmark click listeners ────────────────────────────────────────
function attachPostBookmarkListeners() {
  document.querySelectorAll('.post-save-btn').forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.preventDefault();

      const user = await getBookmarkUser();
      if (!user) {
        window.location.href = '/pages/login.html';
        return;
      }

      const postId = button.dataset.postId;
      const isNowSaved = await toggleBookmark(postId);
      updateSaveButtonUI(button, isNowSaved);
    });
  });
}

// ── Main: load posts from Firestore ────────────────────────────────────────
async function loadPosts() {
  try {
    loadingEl.style.display = 'block';
    postsFeedEl.innerHTML = '';

    const querySnapshot = await getDocs(collection(db, 'posts'));

    if (querySnapshot.empty) {
      postsFeedEl.innerHTML = '<p class="text-muted text-center py-5">No posts yet. Be the first to create one!</p>';
    } else {
      let postsHTML = '';
      querySnapshot.forEach((doc) => {
        const post = doc.data();
        postsHTML += createPostCard(post, doc.id);
      });

      postsFeedEl.innerHTML = postsHTML;

      document.querySelectorAll('.upvote-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          console.log('Upvote clicked');
        });
      });

      await initializePostBookmarkButtons();
      attachPostBookmarkListeners();
    }

  } catch (err) {
    console.error('Error loading posts:', err);
    postsFeedEl.innerHTML = '<p class="text-danger text-center py-5">Failed to load posts. Please try again.</p>';
  } finally {
    loadingEl.style.display = 'none';
  }
}

// ── Load posts when page is ready ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', loadPosts);