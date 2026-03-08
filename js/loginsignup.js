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

  const alertEl = document.getElementById('authAlert');
  const loginView = document.getElementById('loginView');
  const signupView = document.getElementById('signupView');
  const toSignupBtn = document.getElementById('toSignup');
  const toLoginBtn = document.getElementById('toLogin');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

function setVisible(el, visible) {
        el.classList.toggle('d-none', !visible);
    }


toSignupBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        setVisible(loginView, false);
        setVisible(signupView, true);
        signupView?.querySelector('input')?.focus();
    });

    toLoginBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        setVisible(signupView, false);
        setVisible(loginView, true);
        loginView?.querySelector('input')?.focus();
    });

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    loginForm?.addEventListener("submit", (e) => {
        e.preventDefault(); 

        localStorage.setItem("loginAttempt", "Login button was clicked");  

        location.href = "../index.html";
    });

});

// --- Initialize UI on DOMContentLoaded ---
// document.addEventListener('DOMContentLoaded', initAuthUI);
