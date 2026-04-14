// DANIEL UCHECHUKWU-MOSES
// post-details.js — Reads ?docID= from the URL, fetches the matching post
// document from Firestore, and injects all fields into the page's HTML elements.
// Shows a loading spinner while fetching and an error state if the ID is
// missing or the document does not exist.

import '../css/post-details.css';
import { db, auth } from "./firebaseConfig.js"; // DANIEL UCHECHUKWU-MOSES
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore"; //DANIEL UCHECHUKWU-MOSES
import {
  getBookmarkUser,
  isPostBookmarked,
  toggleBookmark,
} from "./bookmark.js"; // ADRIEN CYR

// ── Element references ──────────────────────────────────────────────────────
const postCard = document.getElementById("post-detail-1");
const loadingEl = document.getElementById("post-loading");
const errorEl = document.getElementById("post-error");

const titleEl = document.getElementById("post-title");
const authorEl = document.getElementById("post-author");
const bodyEl = document.getElementById("post-body");
const upvoteEl = document.getElementById("upvote-count");
const dateEl = document.getElementById("post-date");
const categoryEl = document.getElementById("post-category");
const detailSaveBtn = document.getElementById("detail-save-btn"); // ADRIEN CYR

const repliesLoadingEl = document.getElementById("replies-loading");
const repliesHeadingEl = document.getElementById("replies-heading");
const repliesCountEl = document.getElementById("reply-count");
const repliesContainerEl = document.getElementById("repliesContainer");
const replyButtonEl = document.getElementById("btn-reply");

// ── Helper: format a Firestore Timestamp into a readable date string ─────────
function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── Helper: toggle visibility ────────────────────────────────────────────────
function show(el) {
  el.classList.remove("d-none");
}
function hide(el) {
  el.classList.add("d-none");
}

// ── Helper: update bookmark icon UI ─────────────────────────────────────────
function updateDetailSaveButtonUI(isSaved) {
  // ADRIEN CYR
  detailSaveBtn.classList.remove("bi-star", "bi-star-fill"); // ADRIEN CYR
  detailSaveBtn.classList.add(isSaved ? "bi-star-fill" : "bi-star"); // ADRIEN CYR
} // ADRIEN CYR

// ── Helper: initialize detail bookmark button ───────────────────────────────
async function initializeDetailBookmark(postId) {
  // ADRIEN CYR
  const user = await getBookmarkUser(); // ADRIEN CYR

  if (!user) {
    // ADRIEN CYR
    updateDetailSaveButtonUI(false); // ADRIEN CYR
  } else {
    // ADRIEN CYR
    const isSaved = await isPostBookmarked(postId); // ADRIEN CYR
    updateDetailSaveButtonUI(isSaved); // ADRIEN CYR
  } // ADRIEN CYR

  detailSaveBtn.addEventListener("click", async () => {
    // ADRIEN CYR
    const currentUser = await getBookmarkUser(); // ADRIEN CYR

    if (!currentUser) {
      // ADRIEN CYR
      window.location.href = "/"; // ADRIEN CYR
      return; // ADRIEN CYR
    } // ADRIEN CYR

    const isNowSaved = await toggleBookmark(postId); // ADRIEN CYR
    updateDetailSaveButtonUI(isNowSaved); // ADRIEN CYR
  }); // ADRIEN CYR
} // ADRIEN CYR

// ── Helper: create a reply card HTML element (ASYNC) ──────────────────────────
async function createReplyCard(reply, replyId, postId) {
  const replyDiv = document.createElement("div");
  replyDiv.className = "reply-card p-3 mb-2";
  replyDiv.id = `reply-${replyId}`;

  // Fetch reply author's avatar
  let avatarHTML = '<i class="bi bi-person-fill"></i>'; // Default fallback
  if (reply.authorId) {
    try {
      const userRef = doc(db, "users", reply.authorId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().avatar) {
        const avatarUrl = userSnap.data().avatar;
        avatarHTML = `<img src="data:image/png;base64,${avatarUrl}" alt="User avatar" class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover;">`;
      }
    } catch (err) {
      console.error("Error fetching reply author avatar:", err);
    }
  }

  const replyHTML = `
    <div class="d-flex align-items-start gap-2">
      <div class="reply-avatar">
        ${avatarHTML}
      </div>
      <div class="flex-grow-1">
        <span class="reply-username">${reply.author || "Anonymous"}</span>
        <p class="reply-text">
          ${reply.body || ""}
        </p>
        <div class="d-flex justify-content-end reply-likes reply-like-btn" id="reply-like-${replyId}" data-reply-id="${replyId}" data-post-id="${postId}" style="cursor: pointer;">
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
    repliesContainerEl.innerHTML = "";

    const repliesRef = collection(db, "posts", postId, "replies");
    const querySnapshot = await getDocs(repliesRef);

    const replies = [];
    querySnapshot.forEach((doc) => {
      replies.push({ data: doc.data(), id: doc.id });
    });

    // Update reply count
    repliesCountEl.textContent = replies.length;

    if (replies.length > 0) {
      show(repliesHeadingEl);
      // Render each reply
      for (const reply of replies) {
        const replyCard = await createReplyCard(reply.data, reply.id, postId);
        repliesContainerEl.appendChild(replyCard);
      }

      // Attach like click listeners to replies
      document.querySelectorAll(".reply-like-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const replyId = btn.dataset.replyId;
          const postIdForReply = btn.dataset.postId;
          console.log(
            "🔷 Reply like clicked for reply:",
            replyId,
            "on post:",
            postIdForReply,
          );

          const currentUser = auth.currentUser;
          if (!currentUser) {
            alert("You must be logged in to like a reply");
            return;
          }

          try {
            const replyRef = doc(
              db,
              "posts",
              postIdForReply,
              "replies",
              replyId,
            );
            const replySnap = await getDoc(replyRef);

            if (!replySnap.exists()) {
              console.error("❌ Reply not found");
              return;
            }

            const replyData = replySnap.data();
            const upvotedBy = replyData.upvotedBy || [];
            const currentLikes = replyData.likes || 0;

            // Check if user already liked this reply (toggle behavior)
            if (upvotedBy.includes(currentUser.uid)) {
              // User is removing their like
              const newLikes = currentLikes - 1;

              // Update Firestore: decrement likes and remove user from upvotedBy array
              await updateDoc(replyRef, {
                likes: newLikes,
                upvotedBy: arrayRemove(currentUser.uid),
              });

              // Update button with new count
              btn.textContent = `${newLikes} `;
              btn.innerHTML = `${newLikes} <i class="bi bi-hand-thumbs-up-fill ms-1"></i>`;
              console.log("✅ Reply like removed! New count:", newLikes);
            } else {
              // User is adding their like
              const newLikes = currentLikes + 1;

              // Update Firestore: increment likes and add user to upvotedBy array
              await updateDoc(replyRef, {
                likes: newLikes,
                upvotedBy: arrayUnion(currentUser.uid),
              });

              // Update button with new count
              btn.textContent = `${newLikes} `;
              btn.innerHTML = `${newLikes} <i class="bi bi-hand-thumbs-up-fill ms-1"></i>`;
              console.log("✅ Reply like successful! New count:", newLikes);
            }
          } catch (err) {
            console.error("❌ Error liking reply:", err);
          }
        });
      });
    } else {
      hide(repliesHeadingEl);
      repliesContainerEl.innerHTML =
        '<p class="text-muted text-center py-3">No replies yet. Be the first to reply!</p>';
    }
  } catch (err) {
    console.error("Error loading replies:", err);
    repliesContainerEl.innerHTML =
      '<p class="text-danger text-center py-3">Failed to load replies.</p>';
  } finally {
    hide(repliesLoadingEl);
  }
}

// ── Main: load the post ──────────────────────────────────────────────────────
async function loadPost() {
  // 1. Read docID from URL — e.g. post-details.html?docID=abc123
  const params = new URLSearchParams(window.location.search);
  const docID = params.get("docID");

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
    const docRef = doc(db, "posts", docID);
    const docSnap = await getDoc(docRef);

    // 5. Document not found → show error
    if (!docSnap.exists()) {
      hide(loadingEl);
      show(errorEl);
      return;
    }

    // 6. Inject all fields into their HTML containers
    const data = docSnap.data();

    titleEl.textContent = data.title || "Untitled";
    authorEl.textContent = "@" + (data.author || "unknown");
    bodyEl.textContent = data.body || "";
    upvoteEl.textContent = data.favorites ?? 0;
    dateEl.textContent = formatDate(data.postCreated);
    categoryEl.textContent =
      data.tags && data.tags.length > 0 ? data.tags[0] : "General";

    // Fetch and display post author's avatar
    if (data.authorId) {
      try {
        const authorRef = doc(db, "users", data.authorId);
        const authorSnap = await getDoc(authorRef);
        if (authorSnap.exists() && authorSnap.data().avatar) {
          const avatarUrl = authorSnap.data().avatar;
          // Create an avatar element to replace the generic icon
          const avatarImg = document.createElement("img");
          avatarImg.src = `data:image/png;base64,${avatarUrl}`;
          avatarImg.alt = "Author avatar";
          avatarImg.className = "rounded-circle me-2";
          avatarImg.style.width = "40px";
          avatarImg.style.height = "40px";
          avatarImg.style.objectFit = "cover";
          // Find and replace the fallback avatar icon with the real avatar
          const fallbackAvatar = document.querySelector(".avatar-icon");
          if (fallbackAvatar) {
            fallbackAvatar.replaceWith(avatarImg);
          }
        }
      } catch (err) {
        console.error("Error fetching author avatar:", err);
      }
    }

    // 7. Reveal the post card, hide the spinner
    hide(loadingEl);
    show(postCard);

    // 8. Add click listener to upvote button
    upvoteEl.style.cursor = "pointer";
    upvoteEl.addEventListener("click", async () => {
      console.log("🔷 Post upvote clicked for post:", docID);

      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert("You must be logged in to upvote");
        return;
      }

      try {
        const postRef = doc(db, "posts", docID);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
          console.error("❌ Post not found");
          return;
        }

        const postData = postSnap.data();
        const upvotedBy = postData.upvotedBy || [];
        const currentFavorites = postData.favorites || 0;

        // Check if user already upvoted (toggle behavior)
        if (upvotedBy.includes(currentUser.uid)) {
          // User is removing their upvote
          const newFavorites = currentFavorites - 1;

          // Update Firestore: decrement favorites and remove user from upvotedBy array
          await updateDoc(postRef, {
            favorites: newFavorites,
            upvotedBy: arrayRemove(currentUser.uid),
          });

          // Update button with new count
          upvoteEl.textContent = newFavorites;
          console.log("✅ Post upvote removed! New count:", newFavorites);
        } else {
          // User is adding their upvote
          const newFavorites = currentFavorites + 1;

          // Update Firestore: increment favorites and add user to upvotedBy array
          await updateDoc(postRef, {
            favorites: newFavorites,
            upvotedBy: arrayUnion(currentUser.uid),
          });

          // Update button with new count
          upvoteEl.textContent = newFavorites;
          console.log("✅ Post upvote successful! New count:", newFavorites);
        }
      } catch (err) {
        console.error("❌ Error upvoting post:", err);
      }
    });

    await initializeDetailBookmark(docID); // ADRIEN CYR

    // 9. Update reply button with post ID and load replies
    replyButtonEl.href = `/pages/reply?postID=${docID}`;
    await loadReplies(docID);
  } catch (err) {
    // Firestore error (e.g. network issue, permission denied)
    console.error("Error loading post:", err);
    hide(loadingEl);
    show(errorEl);
  }
}

// Run once the DOM is ready
document.addEventListener("DOMContentLoaded", loadPost);
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
