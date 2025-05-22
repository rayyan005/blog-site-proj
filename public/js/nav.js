document.addEventListener("DOMContentLoaded", function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username');
    
    // Get the navigation buttons container
    const navButtons = document.querySelector('.nav-buttons');
    
    if (isLoggedIn && username && navButtons) {
        // Clear existing buttons
        navButtons.innerHTML = '';
        
        // Create Write button
        const writeButton = document.createElement('a');
        writeButton.href = '/write-blog';
        const writeButtonElem = document.createElement('button');
        writeButtonElem.type = 'button';
        writeButtonElem.id = 'write-button';
        writeButtonElem.textContent = 'WRITE';
        writeButton.appendChild(writeButtonElem);
        
        // Create Profile button
        const profileButton = document.createElement('a');
        profileButton.href = `/profile/${username}`;
        const profileButtonElem = document.createElement('button');
        profileButtonElem.type = 'button';
        profileButtonElem.id = 'profile-button';
        profileButtonElem.textContent = 'PROFILE';
        profileButton.appendChild(profileButtonElem);
        
        // Create Logout button
        const logoutButton = document.createElement('button');
        logoutButton.type = 'button';
        logoutButton.id = 'logout-button';
        logoutButton.textContent = 'LOGOUT';
        logoutButton.addEventListener('click', function() {
            // Clear localStorage
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            localStorage.removeItem('userId');
            
            // Redirect to home page
            window.location.href = '/';
        });
        
        // Add buttons to navigation
        navButtons.appendChild(writeButton);
        navButtons.appendChild(profileButton);
        navButtons.appendChild(logoutButton);
    }
    
    // Setup search functionality
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = searchBar.value.trim();
                if (query) {
                    window.location.href = `/search-results?query=${encodeURIComponent(query)}`;
                }
            }
        });
    }
});
