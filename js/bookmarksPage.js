// Author: Adrien Cyr

import { getBookmarkedPosts } from './bookmark.js';

const loadingEl = document.getElementById('bookmarksLoading');
const emptyEl = document.getElementById('bookmarksEmpty');
const sectionEl = document.getElementById('bookmarksSection');
const containerEl = document.getElementById('bookmarksContainer');

function createBookmarkCard(post) {
    const category = post.tags && post.tags.length > 0 ? post.tags[0] : 'General';
    const excerpt = post.body && post.body.length > 180
        ? `${post.body.substring(0, 180)}...`
        : (post.body || '');

    return `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 shadow-sm">
                <div class="card-body d-flex flex-column">
                    <div class="mb-2">
                        <span class="post-category-badge">${category}</span>
                    </div>
                    <h5 class="card-title">${post.title || 'Untitled Post'}</h5>
                    <p class="card-text flex-grow-1">${excerpt}</p>
                    <a href="/pages/post-details?docID=${post.id}" class="btn btn-primary btn-sm mt-auto">
                        View Post
                    </a>
                </div>
            </div>
        </div>
    `;
}

async function loadBookmarksPage() {
    try {
        const posts = await getBookmarkedPosts();

        loadingEl.classList.add('d-none');

        if (posts.length === 0) {
            emptyEl.classList.remove('d-none');
            sectionEl.classList.add('d-none');
            return;
        }

        emptyEl.classList.add('d-none');
        sectionEl.classList.remove('d-none');

        containerEl.innerHTML = posts.map(createBookmarkCard).join('');
    } catch (error) {
        console.error('Error loading bookmarked posts:', error);
        loadingEl.classList.add('d-none');
        emptyEl.classList.remove('d-none');
    }
}

document.addEventListener('DOMContentLoaded', loadBookmarksPage);