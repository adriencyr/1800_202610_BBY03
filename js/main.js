import 'bootstrap/dist/css/bootstrap.min.css';

import 'bootstrap';

// If you have custom global styles, import them as well:
import '../css/style.css';
import { logoutUser } from './authentication.js';  //Perform logout action

import {
    onAuthReady
} from "./authentication.js"

const logoutHero = document.getElementById('logoutHero');
const signupHero = document.getElementById('signupHero');

function setVisible(el, visible) {
        el.classList.toggle('d-none', !visible);
    }




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



function updateUIForUser(user) {
    const isLoggedIn = !!user;
    
    if (logoutHero && signupHero) {
        setVisible(logoutHero, isLoggedIn);
        setVisible(signupHero, !isLoggedIn);
    }

};



//user authentication state check
onAuthReady((user) => {

    updateUIForUser(user);

    if (user) {
        const logoutBtn = document.getElementById("logoutBtn");
        

        logoutBtn?.addEventListener("click", () => {
            console.log("Logout button clicked");
            logoutUser(); 
        });
    }
});

    




















