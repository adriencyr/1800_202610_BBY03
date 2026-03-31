// Author: Adrien Cyr

import { db, auth } from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    arrayRemove
} from "firebase/firestore";

export function getBookmarkUser() {
    return new Promise((resolve) => {
        if (auth.currentUser) {
            resolve(auth.currentUser);
            return;
        }

        let unsubscribe = () => {};

        unsubscribe = onAuthReady((user) => {
            unsubscribe();
            resolve(user || null);
        });
    });
}

export async function getUserBookmarks() {
    const user = await getBookmarkUser();
    if (!user) return [];

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return [];

    const data = userSnap.data();
    return data.bookmarks || [];
}

export async function isPostBookmarked(postId) {
    const bookmarks = await getUserBookmarks();
    return bookmarks.includes(postId);
}

export async function addBookmark(postId) {
    const user = await getBookmarkUser();
    if (!user) return false;

    const userRef = doc(db, "users", user.uid);

    await setDoc(userRef, {
        bookmarks: arrayUnion(postId)
    }, { merge: true });

    return true;
}

export async function removeBookmark(postId) {
    const user = await getBookmarkUser();
    if (!user) return false;

    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
        bookmarks: arrayRemove(postId)
    });

    return false;
}

export async function toggleBookmark(postId) {
    const isBookmarked = await isPostBookmarked(postId);

    if (isBookmarked) {
        await removeBookmark(postId);
        return false;
    } else {
        await addBookmark(postId);
        return true;
    }
}

export async function getBookmarkedPosts() {
    const bookmarks = await getUserBookmarks();

    const postPromises = bookmarks.map(async (postId) => {
        const postRef = doc(db, "posts", postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
            return { id: postId, ...postSnap.data() };
        }

        return null;
    });

    const posts = await Promise.all(postPromises);
    return posts.filter(post => post !== null);
}