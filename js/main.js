import 'bootstrap/dist/css/bootstrap.min.css';

import 'bootstrap';

// If you have custom global styles, import them as well:
import '../css/style.css';
import { logoutUser } from './authentication.js';  //Perform logout action

import {
    onAuthReady
} from "./authentication.js"

onAuthReady((user) => {

    if (!user && window.location.pathname.endsWith("/pages/main.html")) {
        window.location.href = "../index.html";
    }

});

// document.addEventListener('DOMContentLoaded', sayHello);

fetch('/components/navbar.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('navbar').innerHTML = data;
  });

document.addEventListener("DOMContentLoaded", () => {

    const message = localStorage.getItem("loginAttempt");

    if (message) {
        console.log(message);

        // Remove so it doesn't show again
        localStorage.removeItem("loginAttempt");
    }

});



//user authentication state check



document.addEventListener("DOMContentLoaded", () => {

    const logoutBtn = document.getElementById("logoutBtn");

    logoutBtn?.addEventListener("click", () => {
        logoutUser();
    });

});
















