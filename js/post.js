// DANIEL UCHECHUKWU-MOSES
// post.js — Loads all posts from Firestore and renders them dynamically to the post feed.
// Fetches posts from the 'posts' collection, displays them with title, category, excerpt,
// upvote count, and comment count. Shows loading spinner while fetching.

console.log("✅ post.js loading...");

import { db, auth } from "./firebaseConfig.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import {
  getUserBookmarks,
  getBookmarkUser,
  toggleBookmark,
} from "./bookmark.js";

console.log("✅ post.js imports complete");

// ── Element references ──────────────────────────────────────────────────────
const postsFeedEl = document.getElementById("postsFeed");
const loadingEl = document.getElementById("posts-loading");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageNumbersEl = document.getElementById("pageNumbers");

console.log("🔷 DOM Elements found:");
console.log("  postsFeedEl:", postsFeedEl);
console.log("  loadingEl:", loadingEl);
console.log("  prevPageBtn:", prevPageBtn);
console.log("  nextPageBtn:", nextPageBtn);
console.log("  pageNumbersEl:", pageNumbersEl);

// ── Pagination constants ────────────────────────────────────────────────────
const POSTS_PER_PAGE = 9;
let currentPage = 1;
let totalPages = 1;
let allSortedPosts = []; // Store all sorted posts for pagination

// ── Helper: sort posts array ────────────────────────────────────────────────
function sortPosts(postsArray, sortType) {
  // DANIEL UCHECHUKWU-MOSES
  const sorted = [...postsArray]; // Make a copy so we don't mutate the original

  if (sortType === "newest") {
    return sorted.sort((a, b) => b.postCreated - a.postCreated);
  } else if (sortType === "oldest") {
    return sorted.sort((a, b) => a.postCreated - b.postCreated);
  } else if (sortType === "alphabetical") {
    return sorted.sort((a, b) => a.title.localeCompare(b.title));
  }

  return sorted;
}

// ── Helper: truncate text to a certain length ──────────────────────────────
function truncateExcerpt(text, maxLength = 200) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
}

// ── Helper: update bookmark icon UI ────────────────────────────────────────
function updateSaveButtonUI(button, isSaved) {
  button.classList.remove("bi-star", "bi-star-fill");
  button.classList.add(isSaved ? "bi-star-fill" : "bi-star");
}

// ── Helper: update favorite button icon UI ────────────────────────────────────
function updateFavoriteButtonUI(button, isFavorited) {
  const icon = button.querySelector("i");
  if (icon) {
    icon.classList.remove("bi-star", "bi-star-fill");
    icon.classList.add(isFavorited ? "bi-star-fill" : "bi-star");
  }
}

// ── Helper: create a post card element (ASYNC) ────────────────────────────────
async function createPostCard(post, docId) {
  const excerpt = truncateExcerpt(post.body);
  const category = post.tags && post.tags.length > 0 ? post.tags[0] : "General";

  // Fetch reply count from subcollection
  let commentCount = 0;
  try {
    const repliesRef = collection(db, "posts", docId, "replies");
    const repliesSnap = await getDocs(repliesRef);
    commentCount = repliesSnap.size;
  } catch (err) {
    console.error("Error fetching reply count:", err);
  }

  // Fetch author's avatar AND name from Firestore
  let avatarHTML = '<i class="bi bi-person-circle" style="font-size: 2rem; color: #ccc;"></i>'; // Default avatar icon
  let authorName = post.author || "Anonymous";

  if (post.authorId) {
    try {
      const userRef = doc(db, "users", post.authorId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        // Get author name (from username field in user doc)
        if (userData.username) {
          authorName = userData.username;
        }
        // Get avatar if it exists
        if (userData.avatar) {
          const avatarUrl = userData.avatar;
          avatarHTML = `<img src="data:image/png;base64,${avatarUrl}" alt="User avatar" class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover;">`;
        }
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  }

  const postHTML = `
    <div id="post-${docId}" class="card mb-3 post-card">
      <div class="card-body">
        <div class="d-flex align-items-start gap-2">
          ${avatarHTML}
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <span class="post-author" style="font-size: 0.9rem; color: #666; display: block; margin-bottom: 0.25rem;"><strong>${authorName}</strong></span>
                <a href="post-details.html?docID=${docId}" class="post-title-link"><p class="post-title mb-1">${post.title}</p></a>
                <div class="d-flex align-items-center gap-1 mb-2">
                  <span class="post-category-badge">${category}</span>
                </div>
              </div>
              <span id="favorite-btn-${docId}" class="favorite-btn" style="cursor: pointer; font-size: 1.5rem;"><i class="bi bi-star-fill"></i></span>
            </div>
            <p class="post-excerpt">"${excerpt}"</p>
            <div class="d-flex gap-3 post-meta-counts">
              <span id="upvote-btn-${docId}" class="upvote-btn" style="cursor: default; color: #999;"><i class="bi bi-star me-1"></i><span class="upvote-count">${post.favorites || 0}</span></span>
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
  const saveButtons = document.querySelectorAll(".post-save-btn");
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
  document.querySelectorAll(".post-save-btn").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();

      const user = await getBookmarkUser();
      if (!user) {
        window.location.href = "/pages/login.html";
        return;
      }

      const postId = button.dataset.postId;
      const isNowSaved = await toggleBookmark(postId);
      updateSaveButtonUI(button, isNowSaved);
    });
  });
}

// ── Initialize favorite button states ─────────────────────────────────────
async function initializeFavoriteButtons() {
  const currentUser = auth.currentUser;
  if (!currentUser) return; // Not logged in, all will show empty star

  const favoriteButtons = document.querySelectorAll(".favorite-btn");

  for (const btn of favoriteButtons) {
    const postId = btn.id.replace("favorite-btn-", "");
    try {
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const postData = postSnap.data();
        const upvotedBy = postData.upvotedBy || [];
        const isFavorited = upvotedBy.includes(currentUser.uid);
        updateFavoriteButtonUI(btn, isFavorited);
      }
    } catch (err) {
      console.error("Error initializing favorite button:", err);
    }
  }
}

// ── Helper: render page numbers display ─────────────────────────────────────
function renderPageNumbers() {
  let pageHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      pageHTML += `<span style="font-weight: bold; font-size: 1.3rem; color: #000;">${i}</span>`;
    } else {
      pageHTML += `<span style="font-weight: normal; color: #666;">${i}</span>`;
    }
    if (i < totalPages) {
      pageHTML += " &nbsp; ";
    }
  }
  pageNumbersEl.innerHTML = pageHTML;
}

// ── Helper: disable/enable pagination buttons ────────────────────────────────────
function updatePaginationButtons() {
  // Disable prev button on page 1, enable otherwise
  prevPageBtn.disabled = currentPage === 1;
  prevPageBtn.style.opacity = currentPage === 1 ? "0.5" : "1";

  // Disable next button on last page, enable otherwise
  nextPageBtn.disabled = currentPage === totalPages;
  nextPageBtn.style.opacity = currentPage === totalPages ? "0.5" : "1";
}

// ── Helper: render posts for current page ───────────────────────────────────
async function renderCurrentPage() {
  try {
    postsFeedEl.innerHTML = "";

    // Calculate start and end indices for the current page
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const postsForPage = allSortedPosts.slice(startIndex, endIndex);

    let postsHTML = "";
    for (const post of postsForPage) {
      postsHTML += await createPostCard(post, post.docId);
    }

    postsFeedEl.innerHTML = postsHTML;

    // Re-attach event listeners (bookmarks and favorites)
    await initializePostBookmarkButtons();
    attachPostBookmarkListeners();
    await initializeFavoriteButtons();

    // ── Attach favorite button click listeners ──
    document.querySelectorAll(".favorite-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const postId = btn.id.replace("favorite-btn-", "");
        console.log("🔷 Favorite clicked for post:", postId);

        const currentUser = auth.currentUser;
        if (!currentUser) {
          alert("You must be logged in to favorite");
          return;
        }

        try {
          const postRef = doc(db, "posts", postId);
          const postSnap = await getDoc(postRef);

          if (!postSnap.exists()) {
            console.error("❌ Post not found");
            return;
          }

          const postData = postSnap.data();
          const upvotedBy = postData.upvotedBy || [];
          const currentFavorites = postData.favorites || 0;

          // Get the upvote counter display element for this post
          const upvoteCountEl = document.querySelector(`#upvote-btn-${postId} .upvote-count`);

          // Check if user already favorited (toggle behavior)
          if (upvotedBy.includes(currentUser.uid)) {
            // User is removing their favorite
            const newFavorites = currentFavorites - 1;

            // Update Firestore: decrement favorites and remove user from upvotedBy array
            await updateDoc(postRef, {
              favorites: newFavorites,
              upvotedBy: arrayRemove(currentUser.uid),
            });

            // Update upvote counter display
            if (upvoteCountEl) {
              upvoteCountEl.textContent = newFavorites;
            }
            // Toggle favorite button icon to empty star
            updateFavoriteButtonUI(btn, false);
            console.log("✅ Favorite removed! New count:", newFavorites);
          } else {
            // User is adding their favorite
            const newFavorites = currentFavorites + 1;

            // Update Firestore: increment favorites and add user to upvotedBy array
            await updateDoc(postRef, {
              favorites: newFavorites,
              upvotedBy: arrayUnion(currentUser.uid),
            });

            // Update upvote counter display
            if (upvoteCountEl) {
              upvoteCountEl.textContent = newFavorites;
            }
            // Toggle favorite button icon to filled star
            updateFavoriteButtonUI(btn, true);
            console.log("✅ Favorite added! New count:", newFavorites);
          }
        } catch (err) {
          console.error("❌ Error favoriting:", err);
        }
      });
    });
  } catch (err) {
    console.error("Error rendering current page:", err);
  }
}

async function loadPosts() {
  try {
    console.log("🔷 loadPosts() started");
    loadingEl.style.display = "block";
    postsFeedEl.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "posts"));
    console.log("🔷 Query snapshot received:", querySnapshot.size, "posts");

    if (querySnapshot.empty) {
      postsFeedEl.innerHTML =
        '<p class="text-muted text-center py-5">No posts yet. Be the first to create one!</p>';
      pageNumbersEl.innerHTML = "";
      // Arrows always show, but disabled
      prevPageBtn.disabled = true;
      nextPageBtn.disabled = true;
      prevPageBtn.style.opacity = "0.5";
      nextPageBtn.style.opacity = "0.5";
    } else {
      const postDocs = [];
      querySnapshot.forEach((doc) => {
        postDocs.push({ data: doc.data(), id: doc.id });
      });

      // Default sort to 'newest'
      let currentSort = "newest";
      allSortedPosts = sortPosts(
        postDocs.map((p) => ({ ...p.data, docId: p.id })),
        currentSort,
      );

      // Calculate total pages
      totalPages = Math.ceil(allSortedPosts.length / POSTS_PER_PAGE);
      currentPage = 1;

      // Render first page
      await renderCurrentPage();

      // Update pagination display
      renderPageNumbers();
      updatePaginationButtons();

      // Add sort select change listener
      const sortSelect = document.getElementById("sortSelect");
      console.log("🔷 Looking for sortSelect element:", sortSelect);

      if (sortSelect) {
        console.log("✅ sortSelect found! Attaching listener");
        sortSelect.addEventListener("change", async (e) => {
          const sortType = e.target.value;
          console.log("🔷 Sorting by:", sortType);

          // Re-sort all posts
          allSortedPosts = sortPosts(
            postDocs.map((p) => ({ ...p.data, docId: p.id })),
            sortType,
          );

          // Reset to page 1 after sorting
          currentPage = 1;
          totalPages = Math.ceil(allSortedPosts.length / POSTS_PER_PAGE);

          // Re-render
          await renderCurrentPage();
          renderPageNumbers();
          updatePaginationButtons();
          console.log("✅ Sort completed!");
        });
      } else {
        console.error("❌ sortSelect element NOT found!");
      }

      // Add pagination button listeners
      prevPageBtn.addEventListener("click", async () => {
        if (currentPage > 1) {
          currentPage--;
          await renderCurrentPage();
          renderPageNumbers();
          updatePaginationButtons();
          // Scroll to top of posts
          postsFeedEl.scrollIntoView({ behavior: "smooth" });
        }
      });

      nextPageBtn.addEventListener("click", async () => {
        if (currentPage < totalPages) {
          currentPage++;
          await renderCurrentPage();
          renderPageNumbers();
          updatePaginationButtons();
          // Scroll to top of posts
          postsFeedEl.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  } catch (err) {
    console.error("Error loading posts:", err);
    postsFeedEl.innerHTML =
      '<p class="text-danger text-center py-5">Failed to load posts. Please try again.</p>';
  } finally {
    loadingEl.style.display = "none";
  }
}

// ── Load posts when page is ready ───────────────────────────────────────────
console.log("🔷 Adding DOMContentLoaded listener");
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOMContentLoaded fired");
  loadPosts();
});
