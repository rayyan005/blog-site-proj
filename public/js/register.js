document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("register-form");

    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email = document.getElementById('email').value.trim();
            const firstName = document.getElementById('first-name').value.trim();
            const lastName = document.getElementById('last-name').value.trim();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (!email || !firstName || !lastName || !username || !password || !confirmPassword) {
                showMessage("Please fill in all fields.");
                return;
            }

            if (password !== confirmPassword) {
                showMessage("Passwords do not match.");
                return;
            }

            if (password.length < 8) {
                showMessage("Password must be at least 8 characters long.");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('Please enter a valid email address', 'error');
                return; 
            }

            try {

                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'  // Set the content type to JSON
                    },

                    body: JSON.stringify({
                        email: email,
                        firstName: firstName,
                        lastName: lastName,
                        username: username,
                        password: password,
                        confirmPassword: confirmPassword
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showMessage("Registration successful! Redirecting to login page...", 'success');
                    setTimeout(() => {
                        window.location.href = 'login.html'; // Redirect to login page
                    }, 2000); // Redirect after 2 seconds
                } else {
                    showMessage(data.message, 'error');
                }

            } catch (error) {
                console.error("Error during registration:", error);
                showMessage("An error occurred. Please try again later.", 'error');
            }


        });
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
            const form = document.getElementById('register-form');
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