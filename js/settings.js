// -------------------------------------------------------------
// js/settings.js
// -------------------------------------------------------------
// Authored by: 
// - Carly Orr (Original)
// - Adrien Cyr (Revised)
// -------------------------------------------------------------
// Version: 2.0
// -------------------------------------------------------------

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import '../css/style.css';
import { auth, db } from '/js/firebaseConfig.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

//------------------------------------------------------------
// Holds the currently selected avatar image (Base64 payload only).
// This is previewed immediately and persisted only on form submit.
//------------------------------------------------------------
let selectedBase64Image = null;

// -------------------------------------------------------------
// Waits for Firebase Auth to finish resolving the current user.
// -------------------------------------------------------------
export function waitForAuth() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
}

//------------------------------------------------------------
// Attaches a change listener to the avatar file input.
// On selection, reads the image as Base64, stores it temporarily,
// and updates the on-page preview.
//------------------------------------------------------------
function uploadImage() {
    const avatarInput = document.getElementById("inputImage");

    if (!avatarInput) {
        console.error('No avatar input found.');
        return;
    }

    avatarInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = function (e) {
            const result = e.target?.result;
            if (!result) return;

            const base64String = result.split(',')[1];
            selectedBase64Image = base64String;
            displayProfileImage(base64String);
        };

        reader.readAsDataURL(file);
    });
}

//---------------------------------------------------
// Saves the provided Base64 avatar string to the
// signed-in user's Firestore document.
// This is called during settings form submission.
//---------------------------------------------------
async function saveProfileImage(base64String) {
    const user = auth.currentUser;

    if (!user) {
        console.error("No user is signed in.");
        return;
    }

    const userDocRef = doc(db, "users", user.uid);

    try {
        await setDoc(userDocRef, { avatar: base64String }, { merge: true });

        const successBanner = document.getElementById("uploadSuccessBanner");
        successBanner?.classList.remove("d-none");

        setTimeout(() => {
            successBanner?.classList.add("d-none");
        }, 2000);
    } catch (error) {
        console.error("Error saving profile image:", error);
    }
}

//----------------------------------------------------------------
// Renders an avatar preview from a Base64 payload by restoring
// the data URL prefix and injecting an <img> into the avatar slot.
//----------------------------------------------------------------
function displayProfileImage(base64String) {
    const profileContainer = document.getElementById("profileImageContainer");

    if (!profileContainer) {
        console.error("No profile image container found.");
        return;
    }

    if (base64String) {
        profileContainer.innerHTML = `
            <img
                id="profileImage"
                src="data:image/png;base64,${base64String}"
                alt="Profile Picture"
                width="50"
                height="50"
                class="rounded-circle"
                style="object-fit: cover;"
            >
        `;
    } else {
        profileContainer.innerHTML = `
            <i class="bi bi-person-circle fs-1"></i>
        `;
    }
}

//-----------------------------------------------------------
// Loads the signed-in user's profile document and renders
// the existing avatar (or a default icon) in the settings UI.
//-----------------------------------------------------------
async function populateUserInfo(user) {
    if (!user) {
        console.log("No user is signed in");
        return;
    }

    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            console.log("No such document!");
            displayProfileImage(null);
            return;
        }

        const userData = userSnap.data();
        const { avatar = null } = userData;

        displayProfileImage(avatar);
    } catch (error) {
        console.error("Error getting user document:", error);
    }
}

//-----------------------------------------------------------
// Handles settings form submission.
// Saves the newly selected avatar only when Save is clicked.
//-----------------------------------------------------------
async function handleSettingsSubmit(e) {
    e.preventDefault();

    if (!selectedBase64Image) {
        console.log("No new image selected");
        return;
    }

    await saveProfileImage(selectedBase64Image);
}

//-----------------------------------------------------------
// Initializes the settings page once auth is confirmed.
//-----------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    const user = await waitForAuth();

    if (!user) {
        window.location.href = "/pages/login.html";
        return;
    }

    document.body.style.display = "block";

    uploadImage();
    await populateUserInfo(user);

    document.getElementById("settingsForm")?.addEventListener("submit", handleSettingsSubmit);
});