// -------------------------------------------------------------
// src/loginsignup.js
// -------------------------------------------------------------
// Part of the COMP1800 Projects 1 Course (BCIT).
// Starter code provided for students to use and adapt.
// Manages the login/signup form behaviour and redirects.
// -------------------------------------------------------------

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import '../css/style.css';

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    loginForm?.addEventListener("submit", (e) => {
        e.preventDefault();  // 🔥 VERY IMPORTANT (stops refresh)

        localStorage.setItem("loginAttempt", "Login button was clicked");  

        location.href = "../index.html";  // Redirect to home page
    });

});

// --- Initialize UI on DOMContentLoaded ---
// document.addEventListener('DOMContentLoaded', initAuthUI);