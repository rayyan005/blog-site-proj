document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            if (!username || !password) {
                alert("Please fill in all fields.");
                return;
            }

            try {

                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'  // Set the content type to JSON
                    },

                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                });

                const data = await response.json();

                if (data.success) {
                    // Store login information in localStorage
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('username', username);
                    localStorage.setItem('userId', data.userId); // Store user ID if available
                    
                    showMessage("Login successful! Redirecting...", 'success');
                    
                    setTimeout(() => {
                        const redirectUrl = data.redirectUrl || '/'; // Default to home page if no redirect URL is provided
                        window.location.href = redirectUrl; // Redirect to the specified URL
                    }, 2000); // Redirect after 2 seconds
                } else {
                    showMessage(data.message, 'error');
                }

            } catch (error) {
                console.error("Error during registration:", error);
                showMessage("An error occurred. Please try again later.", 'error');
            }
            
        })
    }



    /**
     * Helper function to display messages to the user
     * @param {string} message - The message to display
     * @param {string} type - The type of message ('error' or 'success')
     */
    function showMessage(message, type) {
        // Look for existing message element or create a new one
        let messageElement = document.getElementById('message');
        
        // If the message element doesn't exist, create it
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'message';
            
            // Insert at the beginning of the form
            const form = document.getElementById('login-form');
            form.insertBefore(messageElement, form.firstChild);
        }

        // Set the message content and CSS class
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        
        // Apply inline styles for the message element
        Object.assign(messageElement.style, {
            padding: '10px',
            marginBottom: '15px',
            borderRadius: '5px',
            textAlign: 'center',
            fontFamily: '"Inter", sans-serif',
            display: 'block'
        });
        
        // Apply different styles based on message type
        if (type === 'error') {
            Object.assign(messageElement.style, {
                backgroundColor: '#ffebee',
                color: '#c62828',
                border: '1px solid #ef9a9a'
            });
        } else if (type === 'success') {
            Object.assign(messageElement.style, {
                backgroundColor: '#e8f5e9',
                color: '#2e7d32',
                border: '1px solid #a5d6a7'
            });
        }


        // Automatically hide the message after 5 seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }

});