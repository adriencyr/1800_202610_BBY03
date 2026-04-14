import '../css/search.css';
import { auth } from '/js/firebaseConfig.js';
import { getFirestore, collection, query, where, getDocs, addDoc,
  serverTimestamp } from "firebase/firestore";

const db = getFirestore();
const searchBtn = document.getElementById('searchPageBtn');
const searchInput = document.getElementById('searchPageInput');
const historyContainer = document.getElementById("history");

if (searchBtn) {
    

    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q');
    if (initialQuery) {
        searchInput.value = initialQuery;
        deepSearch(initialQuery);
    }

// 1. Handle the button click manually
searchBtn?.addEventListener('click', () => {
    const term = searchInput.value.trim();
    if (term) {
        
        saveSearchHistory(term);
        
        deepSearch(term); 
        
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?q=' + encodeURIComponent(term);
        window.history.pushState({path:newUrl},'',newUrl);
    }
});

// Also handle the "Enter" key
searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// Show history when input is focused
searchInput?.addEventListener("focus", async () => {
    await loadSearchHistory();         // your existing function
    historyContainer.style.display = "block";
});

// Hide history when clicking outside
document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !historyContainer.contains(e.target)) {
        historyContainer.style.display = "none";
    }
});

// hide history when selecting a search
historyContainer?.addEventListener("click", () => {
    historyContainer.style.display = "none";
});

searchInput?.addEventListener("focus", loadSearchHistory);
}


export function renderPostCard(data, container) {
    const displayTitle = data.title || "Untitled"; 
    const displayBody = data.body || "No content";
    container.innerHTML += `
        <div class="col-md-4 mb-4">
            <div class="card h-100 shadow-sm">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title text-primary fw-bold">${displayTitle}</h5>
                    
                    <p class="card-text post-description">
                        ${displayBody}
                    </p>
                    
                    <div class="mt-auto">
                        <a href="/pages/post-details?docID=${data.id}" class="btn btn-sm btn-outline-primary">View Full Post</a>
                 </div>
                </div>
            </div>
        </div>`;
}

//saving search history
async function saveSearchHistory(term) {
    const user = auth.currentUser;
    if (!user) return; // do nothing if not logged in

    try {
        // Avoid duplicate searches for this user
        const q = query(
            collection(db, "search_history"),
            where("query", "==", term),
            where("userId", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            await addDoc(collection(db, "search_history"), {
                query: term,
                userId: user.uid,
                timestamp: serverTimestamp()
            });
        }
    } catch (error) {
        console.error("Error saving search history:", error);
    }
}

async function deepSearch(term) {
    const db = getFirestore(); 
    const resultsContainer = document.getElementById('searchResults');
    
    if (!resultsContainer) return;
    resultsContainer.innerHTML = "Searching...";

    try {
        const postsRef = collection(db, "posts");
        const querySnapshot = await getDocs(postsRef);
        
        resultsContainer.innerHTML = ""; 
        let found = false;

        querySnapshot.forEach((doc) => {
            const data = {
                            id: doc.id,
                            ...doc.data()
                        };
            
            // Look for 'title' in document
            const postTitle = data.title || ""; 
            
            
            console.log("Checking Post:", postTitle, "against search term:", term);

            // Checking if the title matches 
            if (postTitle.toLowerCase().includes(term.toLowerCase())) {
                renderPostCard(data, resultsContainer);
                found = true;
            }
        });

        if (!found) {
            resultsContainer.innerHTML = `<p class="text-center">No posts found matching "${term}"</p>`;
        }
    } catch (e) {
        console.error("Search Error:", e);
    }
}

// loads search history from Firestore and displays it in the search history section

async function loadSearchHistory() {
    const db = getFirestore();
    const user = auth.currentUser;
    if (!user) return;

    // Step 1: Fetch all search history for this user
    const q = query(collection(db, "search_history"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);

    // Step 2: Convert to array and sort in JS
    const historyArray = snapshot.docs.map(doc => doc.data());

    // Sort by timestamp descending
    historyArray.sort((a, b) => {
    const timeA = a.timestamp?.toMillis() || 0;
    const timeB = b.timestamp?.toMillis() || 0;
    return timeB - timeA;
});

    // Step 3: Limit to last 10
    const last10 = historyArray.slice(0, 10);

    // Step 4: Render the history
    const historyContainer = document.getElementById("history");
    historyContainer.innerHTML = ""; // clear previous
    last10.forEach(item => {
        const li = document.createElement("li");
        li.className = "list-group-item list-group-item-action";
        li.textContent = item.query;
        li.addEventListener("click", () => {
        searchInput.value = item.query; 
        deepSearch(item.query);         
        historyContainer.style.display = "none";
    });
        historyContainer.appendChild(li);
    });
}

