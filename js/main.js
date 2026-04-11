import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import '../css/style.css';

import { logoutUser, onAuthReady } from './authentication.js';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { renderPostCard } from "./search.js";

const logoutHero = document.getElementById('logoutHero');
const signupHero = document.getElementById('signupHero');

function setVisible(el, visible) {
    if (!el) return;
    el.classList.toggle('d-none', !visible);
}

function updateUIForUser(user) {
    const isLoggedIn = !!user;

    if (logoutHero && signupHero) {
        setVisible(logoutHero, isLoggedIn);
        setVisible(signupHero, !isLoggedIn);
    }
}

function updateNavbarForUser(user) {
    const isLoggedIn = !!user;

    const favoriteIds = ["nav-favorites", "nav-favorites-desktop", "nav-favorites-mobile"];
    const settingsIds = ["nav-settings", "nav-settings-desktop", "nav-settings-mobile"];

    favoriteIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.toggle("d-none", !isLoggedIn);
        }
    });

    settingsIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.toggle("d-none", !isLoggedIn);
        }
    });

    const logoutBtn = document.getElementById("logoutBtn");
    if (user && logoutBtn && !logoutBtn.dataset.bound) {
        logoutBtn.dataset.bound = "true";
        logoutBtn.addEventListener("click", () => {
            logoutUser();
        });
    }
}
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

function loadSharedComponent(targetId, path) {
    return fetch(path)
        .then((response) => response.text())
        .then((data) => {
            const target = document.getElementById(targetId);
            if (target) {
                target.innerHTML = data;
            }
        })
        .catch((err) => console.error(`Error loading ${path}:`, err));
}

document.addEventListener("DOMContentLoaded", async () => {
    loadAllPosts();
    const message = localStorage.getItem("loginAttempt");
    
    if (message) {
        console.log(message);
        localStorage.removeItem("loginAttempt");
    }

    await Promise.all([
        loadSharedComponent("navbar", "/components/navbar.html"),
        loadSharedComponent("footer", "/components/footer.html")
    ]);

    onAuthReady((user) => {
        updateUIForUser(user);
        updateNavbarForUser(user);
    });
});
