
import 'bootstrap/dist/css/bootstrap.min.css';

import * as bootstrap from 'bootstrap';

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




// Inject shared navbar
fetch('/components/navbar.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('navbar').innerHTML = data;

    // Simple hamburger menu toggle with debugging
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    console.log("🔷 Navbar injected");
    console.log("  navbarToggler:", navbarToggler);
    console.log("  navbarCollapse:", navbarCollapse);

    if (navbarToggler && navbarCollapse) {
      console.log("✅ Both elements found, attaching listeners");

      // Toggle menu on hamburger click
      navbarToggler.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log("🔷 Hamburger clicked");
        console.log("  Current classes:", navbarCollapse.className);
        navbarCollapse.classList.toggle('show');
        console.log("  After toggle:", navbarCollapse.className);
      });

      // Close menu when any navbar link is clicked
      const navLinks = document.querySelectorAll('.navbar-nav a, .navbar-brand');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          console.log("🔷 Link clicked, closing menu");
          navbarCollapse.classList.remove('show');
        });
      });

      // Also close when clicking outside the navbar
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar')) {
          navbarCollapse.classList.remove('show');
        }
      });
    } else {
      console.error("❌ Could not find navbar elements");
    }
  })
  .catch(err => console.error('Error loading navbar:', err));

// Inject shared footer
fetch('/components/footer.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('footer').innerHTML = data;
  })
  .catch(err => console.error('Error loading footer:', err));

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

    const fav = document.getElementById("nav-favorites");
    if (fav) {
        if (user) {
            fav.classList.remove("d-none");
        } else {
            fav.classList.add("d-none");
        }
    }

    const settings = document.getElementById("nav-settings");
    if (settings) {
        if (user) {
            settings.classList.remove("d-none");
        } else {
            settings.classList.add("d-none");
        }
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (user && logoutBtn && !logoutBtn.dataset.bound) {
        logoutBtn.dataset.bound = "true";
        logoutBtn.addEventListener("click", () => {
            logoutUser();
        });
    }
});
    
