
import 'bootstrap/dist/css/bootstrap.min.css';

import 'bootstrap';

// If you have custom global styles, import them as well:
import '../css/style.css';
import { logoutUser } from './authentication.js';  //Perform logout action

import {
    onAuthReady
} from "./authentication.js"
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { renderPostCard } from "./search.js";


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

// Function to render a post card
async function loadAllPosts() {
    const db = getFirestore();
    const container = document.getElementById("mainPosts"); 
console.log("loadAllPosts running");
    if (!container) return;

    container.innerHTML = "Loading posts...";

    try {
        const postsRef = collection(db, "posts");
        const snapshot = await getDocs(postsRef);

        container.innerHTML = "";

        const posts = snapshot.docs.map(doc => ({
                     id: doc.id,   
                    ...doc.data()   
                    }));

        posts.sort((a, b) => {
            const t1 = b.timestamp?.toMillis() || 0;
            const t2 = a.timestamp?.toMillis() || 0;
            return t1 - t2;
        });

        const limited = posts.slice(0, 12);

        limited.forEach(post => {
            renderPostCard(post, container);
        });

    } catch (error) {
        console.error("Error loading posts:", error);
        container.innerHTML = "Failed to load posts.";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded");
    loadAllPosts();
});
    
