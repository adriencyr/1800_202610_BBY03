import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const searchBtn = document.getElementById('searchPageBtn');
const searchInput = document.getElementById('searchPageInput');

// 1. Handle the button click manually
searchBtn?.addEventListener('click', () => {
    const term = searchInput.value.trim();
    if (term) {
        
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



function renderPostCard(data, container) {
    // Access title directly from the data object
    const displayTitle = data.title || "Untitled"; 
    const displayBody = data.body || "No content";

    container.innerHTML += `
        <div class="col-md-6 mb-3">
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <h5 class="card-title text-primary">${displayTitle}</h5>
                    <p class="card-text">${displayBody}</p>
                </div>
            </div>
        </div>`;
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
            const data = doc.data();
            
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

