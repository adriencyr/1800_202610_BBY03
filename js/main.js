import 'bootstrap/dist/css/bootstrap.min.css';

import 'bootstrap';

// If you have custom global styles, import them as well:
import '../css/style.css';

function sayHello() {

}
// document.addEventListener('DOMContentLoaded', sayHello);

function loadNavbar() {
  // Use correct relative path depending on current location
  let navbarPath = '../components/navbar.html';
  if (window.location.pathname.endsWith('/index.html') || window.location.pathname === '/index.html') {
    navbarPath = 'components/navbar.html';
  }
  fetch(navbarPath)
    .then(response => response.text())
    .then(data => {
      const navbarDiv = document.getElementById('navbar');
      if (navbarDiv) navbarDiv.innerHTML = data;
    });
}
document.addEventListener('DOMContentLoaded', loadNavbar);

<<<<<<< HEAD
// Daniel Uchechukwu-Moses: INTERACTIVE BUTTON FUNCTIONALITY
document.addEventListener('DOMContentLoaded', function() {
  
  // Load stored replies on post.html
  loadStoredReplies();

  // Post upvote button
  const upvoteBtn = document.getElementById('upvote-btn-1');
  if (upvoteBtn) {
    upvoteBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const count = this.querySelector('.upvote-count');
      count.textContent = parseInt(count.textContent) + 1;
      this.classList.toggle('active');
    });
  }

  // Post reply button - Navigate to reply.html
  const replyBtn = document.getElementById('reply-btn-1');
  if (replyBtn) {
    replyBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = './reply.html';
    });
  }

  // Share button
  const shareBtn = document.getElementById('share-icon-1');
  if (shareBtn) {
    shareBtn.addEventListener('click', function(e) {
      e.preventDefault();
      alert('Share functionality - Copy post link to clipboard');
    });
  }

  // More options button
  const moreBtn = document.getElementById('more-icon-1');
  if (moreBtn) {
    moreBtn.addEventListener('click', function(e) {
      e.preventDefault();
      alert('More options menu - Report, Block, etc.');
    });
  }

  // Reply upvote buttons
  const replyUpvoteBtns = document.querySelectorAll('.reply-upvote-btn');
  replyUpvoteBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const count = this.querySelector('.reply-upvote-count');
      count.textContent = parseInt(count.textContent) + 1;
      this.classList.toggle('active');
    });
  });

  // Reply form submit button (on reply.html)
  const replyForm = document.getElementById('reply-form');
  if (replyForm) {
    replyForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const textarea = document.getElementById('reply-textarea');
      const replyText = textarea.value.trim();
      
      if (replyText) {
        // Save reply to localStorage
        saveReply(replyText);
        
        // Show confirmation and redirect
        alert('Reply posted successfully!');
        
        // Redirect to post.html after a short delay
        setTimeout(() => {
          window.location.href = './post.html';
        }, 500);
      }
    });
  }

  // Reply form cancel button
  const cancelBtn = document.getElementById('reply-btn-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function(e) {
      e.preventDefault();
      // Only on reply.html page, navigate back to post.html
      if (window.location.pathname.includes('reply.html')) {
        window.location.href = './post.html';
      } else {
        // On post.html, just clear the form
        const textarea = document.getElementById('reply-textarea');
        if (textarea) {
          textarea.value = '';
          const counter = document.getElementById('char-count');
          if (counter) counter.textContent = '0';
        }
      }
    });
  }

  // Character counter for reply textarea
  const replyTextarea = document.getElementById('reply-textarea');
  if (replyTextarea) {
    replyTextarea.addEventListener('input', function() {
      const charCount = this.value.length;
      const counter = document.getElementById('char-count');
      if (counter) {
        counter.textContent = Math.min(charCount, 500);
      }
      if (charCount > 500) {
        this.value = this.value.substring(0, 500);
      }
    });
  }

});

// Daniel Uchechukwu-Moses: localStorage functions for replies
function saveReply(replyText) {
  // Get existing replies from localStorage
  let replies = JSON.parse(localStorage.getItem('futTalkReplies')) || [];
  
  // Create new reply object
  const newReply = {
    id: replies.length + 3, // Start from 3 since we have 2 default replies
    username: '@User' + Math.floor(Math.random() * 10000),
    text: replyText,
    likes: 0,
    timestamp: new Date().toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  };
  
  // Add new reply to array
  replies.push(newReply);
  
  // Save back to localStorage
  localStorage.setItem('futTalkReplies', JSON.stringify(replies));
}

function loadStoredReplies() {
  // Only run on post.html page
  const repliesContainer = document.getElementById('replies-container');
  if (!repliesContainer) return;
  
  // Get stored replies
  let replies = JSON.parse(localStorage.getItem('futTalkReplies')) || [];
  
  if (replies.length === 0) return; // No stored replies yet
  
  // Get the replies section
  const existingReplies = repliesContainer.querySelectorAll('.reply-card');
  const lastReply = existingReplies[existingReplies.length - 1];
  
  // Add each stored reply to the DOM
  replies.forEach(reply => {
    const replyCard = document.createElement('div');
    replyCard.className = 'reply-card';
    replyCard.id = 'reply-' + reply.id;
    replyCard.innerHTML = `
      <div class="d-flex align-items-start">
        <img src="https://via.placeholder.com/35" alt="User Avatar" class="rounded-circle me-3" width="35" height="35">
        <div class="flex-grow-1">
          <h6 class="mb-1 reply-username"><strong>${reply.username} says:</strong></h6>
          <p class="reply-text mb-0">${reply.text}</p>
          <small class="text-muted reply-date">Now</small>
          <div class="reply-actions mt-2">
            <button class="btn btn-sm btn-outline-secondary reply-upvote-btn" id="reply-upvote-${reply.id}">
              <i class="bi bi-hand-thumbs-up"></i> <span class="reply-upvote-count">${reply.likes}</span> Like
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Insert after existing replies
    if (lastReply) {
      lastReply.parentNode.insertBefore(replyCard, lastReply.nextSibling);
    } else {
      repliesContainer.appendChild(replyCard);
    }
    
    // Add click handler to new reply upvote button
    const upvoteBtn = replyCard.querySelector('.reply-upvote-btn');
    if (upvoteBtn) {
      upvoteBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const count = this.querySelector('.reply-upvote-count');
        count.textContent = parseInt(count.textContent) + 1;
        this.classList.toggle('active');
      });
    }
  });
  
  // Update reply count
  const replyCountSpan = repliesContainer.querySelector('#reply-count-total');
  if (replyCountSpan) {
    const totalReplies = repliesContainer.querySelectorAll('.reply-card').length;
    replyCountSpan.textContent = totalReplies;
  }
}
=======
document.addEventListener("DOMContentLoaded", () => {

    const message = localStorage.getItem("loginAttempt");

    if (message) {
        console.log(message);

        // Remove so it doesn't show again
        localStorage.removeItem("loginAttempt");
    }

});
>>>>>>> 676eddadfd019df768267f62d82381aa44ddee9d
