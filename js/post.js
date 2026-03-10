// DANIEL UCHECHUKWU-MOSES
// post.js — Loads all posts from Firestore and renders them dynamically to the post feed.
// Fetches posts from the 'posts' collection, displays them with title, category, excerpt,
// upvote count, and comment count. Shows loading spinner while fetching.

import { db } from './firebaseConfig.js';
import { collection, getDocs } from 'firebase/firestore';

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

// ── Helper: create a post card element ──────────────────────────────────────
function createPostCard(post, docId) {
  const excerpt = truncateExcerpt(post.body);
  const category = post.tags && post.tags.length > 0 ? post.tags[0] : 'General';
  const commentCount = post.replies && Array.isArray(post.replies) ? post.replies.length : 0;

  const postHTML = `
    <div id="post-${docId}" class="card mb-3 post-card">
      <div class="card-body">
        <div class="d-flex align-items-start gap-2">
          <!-- User avatar -->
          <i class="bi bi-person-circle avatar-icon"></i>
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <!-- Clickable title — navigates to the post detail page with docID param -->
                <a href="post-details.html?docID=${docId}" class="post-title-link"><p class="post-title mb-1">${post.title}</p></a>
                <!-- Category pin and badge -->
                <div class="d-flex align-items-center gap-1 mb-2">
                  <i class="bi bi-pin-angle-fill small"></i>
                  <span class="post-category-badge">${category}</span>
                </div>
              </div>
              <!-- Bookmark/save button -->
              <i class="bi bi-star post-save-btn ms-2" style="cursor: pointer;"></i>
            </div>
            <!-- Short preview of the post body -->
            <p class="post-excerpt">"${excerpt}"</p>
            <!-- Upvote count and comment count -->
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

// ── Main: load posts from Firestore ────────────────────────────────────────
async function loadPosts() {
  try {
    // Show loading state
    loadingEl.style.display = 'block';
    postsFeedEl.innerHTML = '';

    // Fetch all documents from 'posts' collection
    const querySnapshot = await getDocs(collection(db, 'posts'));

    if (querySnapshot.empty) {
      postsFeedEl.innerHTML = '<p class="text-muted text-center py-5">No posts yet. Be the first to create one!</p>';
    } else {
      // Build HTML for all posts
      let postsHTML = '';
      querySnapshot.forEach((doc) => {
        const post = doc.data();
        postsHTML += createPostCard(post, doc.id);
      });

      postsFeedEl.innerHTML = postsHTML;

      // Add click listeners to all upvote buttons
      document.querySelectorAll('.upvote-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          console.log('Upvote clicked');
        });
      });
    }

  } catch (err) {
    console.error('Error loading posts:', err);
    postsFeedEl.innerHTML = '<p class="text-danger text-center py-5">Failed to load posts. Please try again.</p>';
  } finally {
    // Hide loading state
    loadingEl.style.display = 'none';
  }
}

// ── Load posts when page is ready ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', loadPosts);
