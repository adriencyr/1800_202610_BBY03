// Author: Adrien Cyr

import { getBookmarkedPosts } from "./bookmark.js";

const loadingMessage = document.getElementById("bookmarksLoading");
const emptyMessage = document.getElementById("bookmarksEmpty");
const container = document.getElementById("bookmarksContainer");
const bookmarksSection = document.getElementById("bookmarksSection");

const bookmarkedPosts = await getBookmarkedPosts();
if (bookmarkedPosts.length === 0) {
    loadingMessage.classList.add("d-none");
    emptyMessage.classList.remove("d-none");
} else {
    loadingMessage.classList.add("d-none");
    bookmarksSection.classList.remove("d-none");

    bookmarkedPosts.forEach((post) => {
        container.innerHTML += `
          <div class="col-md-6 col-lg-4">
            <div class="card h-100 shadow-sm">
              <div class="card-body">
        <h5 class="card-title">${post.title}</h5>
        <p class="card-text text-muted mb-2">By ${post.author}</p>
        <a href="./post-details.html?id=${post.id}" class="btn btn-primary btn-sm">View Post</a>
      </div>
    </div>
  </div>
`;
    });
}