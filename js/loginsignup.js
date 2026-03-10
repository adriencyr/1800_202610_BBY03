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
import {
    loginUser,
    signupUser,
    authErrorMessage,
} from '/js/authentication.js';


  const alertEl = document.getElementById('authAlert');
  const loginView = document.getElementById('loginView');
  const signupView = document.getElementById('signupView');
  const toSignupBtn = document.getElementById('toSignup');
  const toLoginBtn = document.getElementById('toLogin');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const redirectUrl = 'index.html';

function initAuthUI() {

function setVisible(el, visible) {
        el.classList.toggle('d-none', !visible);
    }

    let errorTimeout;
    function showError(msg) {
        alertEl.textContent = msg || '';
        alertEl.classList.remove('d-none');
        clearTimeout(errorTimeout);
        errorTimeout = setTimeout(hideError, 5000); // Auto-hide after 5s
    }

    function hideError() {
        alertEl.classList.add('d-none');
        alertEl.textContent = '';
        clearTimeout(errorTimeout);
    }

    function setSubmitDisabled(form, disabled) {
        const submitBtn = form?.querySelector('[type="submit"]');
        if (submitBtn) submitBtn.disabled = disabled;
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

    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();
        const email = document.querySelector('#loginEmail')?.value?.trim() ?? '';
        const password = document.querySelector('#loginPassword')?.value ?? '';
        if (!email || !password) {
            showError('Please enter your email and password.');
            return;
        }
        setSubmitDisabled(loginForm, true);
        try {
            await loginUser(email, password);
            location.href = redirectUrl;
        } catch (err) {
            showError(authErrorMessage(err));
            console.error(err);
        } finally {
            setSubmitDisabled(loginForm, false);
        }
    });
 signupForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();
        const name = document.querySelector('#signupName')?.value?.trim() ?? '';
        const email = document.querySelector('#signupEmail')?.value?.trim() ?? '';
        const password = document.querySelector('#signupPassword')?.value ?? '';
        if (!name || !email || !password) {
            showError('Please fill in name, email, and password.');
            return;
        }
        setSubmitDisabled(signupForm, true);
        try {
            await signupUser(name, email, password);
            location.href = redirectUrl;
        } catch (err) {
            showError(authErrorMessage(err));
            console.error(err);
        } finally {
            setSubmitDisabled(signupForm, false);
        }
    });


document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    loginForm?.addEventListener("submit", (e) => {
        e.preventDefault(); 

        localStorage.setItem("loginAttempt", "Login button was clicked");  

        location.href = redirectUrl;
    });

});


};





//login button event listener



// --- Initialize UI on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', initAuthUI);