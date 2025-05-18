document.addEventListener("DOMContentLoaded", function() {
    const navButtons = document.querySelector('.nav-buttons');
    
    // Check if user is logged in (using localStorage)
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username');
    
    if (isLoggedIn && username) {
        // User is logged in, update navigation
        updateNavForLoggedInUser(navButtons, username);
    } else {
        // User is not logged in, ensure standard navigation
        handleWriteButtonForNonLoggedUsers();
    }
    
    // Check if we're on the write blog page and handle content visibility
    if (window.location.pathname.includes('/write-blog')) {
        handleWriteBlogPageAccess(isLoggedIn);
    }
    
    // Function to update nav for logged in users
    function updateNavForLoggedInUser(navContainer, username) {
        // Clear existing buttons
        navContainer.innerHTML = '';
        
        // Create write button
        const writeButton = createButton('write-button', 'WRITE', '/write-blog');
        navContainer.appendChild(writeButton);
        
        // Create profile button
        const profileButton = createButton('profile-button', 'PROFILE', '/profile');
        navContainer.appendChild(profileButton);
        
        // Create logout button
        const logoutButton = document.createElement('button');
        logoutButton.id = 'log-out-button';
        logoutButton.textContent = 'LOG OUT';
        logoutButton.addEventListener('click', handleLogout);
        
        const logoutLink = document.createElement('a');
        logoutLink.appendChild(logoutButton);
        navContainer.appendChild(logoutLink);
    }
    
    // Helper function to create button with link
    function createButton(id, text, href) {
        const button = document.createElement('button');
        button.id = id;
        button.textContent = text;
        button.type = 'button';
        
        const link = document.createElement('a');
        link.href = href;
        link.appendChild(button);
        
        return link;
    }
    
    // Function to handle logout
    function handleLogout() {
        // Clear user session data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        
        // Redirect to home page
        window.location.href = '/';
    }
    
    // Function to handle write button for non-logged in users
    function handleWriteButtonForNonLoggedUsers() {
        const writeButton = document.getElementById('write-button');
        if (writeButton) {
            const writeLink = writeButton.closest('a');
            
            if (writeLink) {
                // Instead of preventing default and showing alert,
                // let the link work - we'll handle the content display on the write-blog page
            }
        }
    }
    
    // Function to handle the write blog page content based on login status
    function handleWriteBlogPageAccess(isLoggedIn) {
        const loginMessage = document.getElementById('login-message');
        const writeBlogContent = document.getElementById('write-blog-content');
        
        if (!isLoggedIn) {
            // User is not logged in, show message and hide content
            if (loginMessage) loginMessage.style.display = 'flex';
            if (writeBlogContent) writeBlogContent.style.display = 'none';
        } else {
            // User is logged in, hide message and show content
            if (loginMessage) loginMessage.style.display = 'none';
            if (writeBlogContent) writeBlogContent.style.display = 'block';
        }
    }
});
