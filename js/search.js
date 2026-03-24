import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const searchBtn = document.getElementById('searchPageBtn');
const searchInput = document.getElementById('searchPageInput');

// 1. Handle the button click manually
searchBtn?.addEventListener('click', () => {
    const term = searchInput.value.trim();
    if (term) {
        // Change this line:
        deepSearch(term); 
        
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?q=' + encodeURIComponent(term);
        window.history.pushState({path:newUrl},'',newUrl);
    }
});

// 2. Also handle the "Enter" key
searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

async function runTagSearch(searchTerm) {
    const db = getFirestore();
    const resultsContainer = document.getElementById('searchResults');
    
    // 1. Normalize the search term (e.g., "WorldCup" -> "worldcup")
    const cleanedTerm = searchTerm.toLowerCase().replace('#', ''); 

    // 2. Query Firestore for posts where the 'tags' array contains this word

    const postsRef = collection(db, "posts");
    const q = query(postsRef, where("tags", "array-contains", cleanedTerm));

    try {
        const querySnapshot = await getDocs(q);
        resultsContainer.innerHTML = ""; 

        if (querySnapshot.empty) {
            resultsContainer.innerHTML = `<p>No posts found with the tag: #${cleanedTerm}</p>`;
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            renderPostCard(data, resultsContainer);
        });
    } catch (e) {
        console.error("Tag Search Error: ", e);
    }
}

function renderPostCard(data, container) {
    // Because your title and body are in different places, 
    // we reach into data.tags.title for the header.
    const displayTitle = data.tags?.title || "Untitled Post";
    const displayBody = data.body || "No content available.";
    
    // Since tags is a Map, we turn the values into an array to display them
    const tagValues = data.tags ? Object.values(data.tags) : [];

    container.innerHTML += `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <h5 class="card-title text-primary">${displayTitle}</h5>
                    <p class="card-text">${displayBody}</p>
                    <div class="mt-2">
                        ${tagValues.map(t => `<span class="badge bg-light text-dark border me-1">#${t}</span>`).join('')}
                    </div>
                </div>
                <div class="card-footer text-muted small">
                    By: ${data.author || 'Anonymous'}
                </div>
            </div>
        </div>`;
}

async function deepSearch(term) {
    // 1. Initialize the connection
    const db = getFirestore(); 
    const resultsContainer = document.getElementById('searchResults');
    
    if (!resultsContainer) {
        console.error("Could not find searchResults div!");
        return;
    }

    resultsContainer.innerHTML = "Searching...";

    try {
        // 2. Fetch ALL posts from the collection
        const postsRef = collection(db, "posts");
        const querySnapshot = await getDocs(postsRef);
        
        resultsContainer.innerHTML = ""; 
        let found = false;

        // 3. Loop through every post and check the 'tags.title' manually
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log("Checking Document:", data); // Check your F12 console to see this!

            // Use the ?. (optional chaining) to safely check nested fields
            const postTitle = data.tags?.title || "";
            const postTag = data.tags?.[0] || ""; // Checks the "0" key in your map

            if (
                postTitle.toLowerCase().includes(term.toLowerCase()) || 
                postTag.toLowerCase().includes(term.toLowerCase())
            ) {
                renderPostCard(data, resultsContainer);
                found = true;
            }
        });

        if (!found) {
            resultsContainer.innerHTML = `<p class="text-center">No matches found for "${term}"</p>`;
        }
    } catch (e) {
        console.error("Search Error:", e);
        resultsContainer.innerHTML = "Error accessing the database.";
    }
}

