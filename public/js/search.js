document.addEventListener('DOMContentLoaded', function() {
    // Get search input elements across all pages
    const searchBars = document.querySelectorAll('#search-bar');
    
    // Add event listeners to all search bars
    searchBars.forEach(searchBar => {
        searchBar.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    // Redirect to search results page with the query
                    window.location.href = `/search-results?query=${encodeURIComponent(query)}`;
                }
            }
        });
    });
    
    // Check if we're on the search results page
    if (window.location.pathname === '/search-results') {
        displaySearchResults();
    }
    
    // Function to display search results
    function displaySearchResults() {
        // Get the query parameter from URL
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('query');
        
        // Update the search bar with the current query
        const searchBar = document.getElementById('search-bar');
        if (searchBar) {
            searchBar.value = query;
        }
        
        // Update the query display
        const queryText = document.getElementById('query-text');
        if (queryText) {
            queryText.textContent = query || 'no query provided';
        }
        
        // If no query provided, show no results message
        if (!query) {
            showNoResults();
            return;
        }
        
        // Fetch search results from the server
        fetch(`/search?query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    renderSearchResults(data.results, query);
                } else {
                    showError(data.message);
                }
            })
            .catch(error => {
                console.error('Error fetching search results:', error);
                showError('An error occurred while fetching results. Please try again.');
            });
    }
    
    // Function to render search results
    function renderSearchResults(results, query) {
        const resultsContainer = document.getElementById('search-results');
        const resultsCount = document.getElementById('results-count');
        
        // Remove loading indicator
        const loadingElement = document.querySelector('.loading-results');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // Update results count
        if (resultsCount) {
            resultsCount.textContent = `Found ${results.length} result${results.length !== 1 ? 's' : ''}`;
        }
        
        // If no results found
        if (results.length === 0) {
            showNoResults();
            return;
        }
        
        // Clear previous results
        resultsContainer.innerHTML = '';
        
        // Create and append result cards
        results.forEach(result => {
            const card = createResultCard(result);
            resultsContainer.appendChild(card);
        });
    }
    
    // Function to create a result card
    function createResultCard(result) {
        // Create slug from title for the URL
        const slug = result.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        
        const card = document.createElement('div');
        card.className = 'result-card';
        
        const imgSrc = result.imageURL || '/images/default-blog-image.jpg';
        
        card.innerHTML = `
            <a href="/blog/${slug}" style="text-decoration: none; color: inherit;">
                <img src="${imgSrc}" alt="${result.title}" onerror="this.src='/images/default-blog-image.jpg'">
                <div class="result-card-content">
                    <h3>${result.title}</h3>
                    <p>${result.description || 'No description available'}</p>
                </div>
            </a>
        `;
        
        return card;
    }
    
    // Function to show no results message
    function showNoResults() {
        const resultsContainer = document.getElementById('search-results');
        const noResultsElement = document.querySelector('.no-results');
        const loadingElement = document.querySelector('.loading-results');
        
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        if (noResultsElement) {
            noResultsElement.style.display = 'block';
        }
        
        // Update results count
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            resultsCount.textContent = '0 results found';
        }
    }
    
    // Function to show error message
    function showError(message) {
        const resultsContainer = document.getElementById('search-results');
        const loadingElement = document.querySelector('.loading-results');
        
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        resultsContainer.innerHTML = `
            <div class="no-results" style="display: block;">
                <p>Error: ${message}</p>
            </div>
        `;
        
        // Update results count
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            resultsCount.textContent = '';
        }
    }
});
