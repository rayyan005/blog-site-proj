document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userId = localStorage.getItem('userId');
    
    // Reference to the blog form
    const blogForm = document.getElementById('blog-form');
    const loginMessage = document.querySelector('.login-message-container');
    const writeBlogContainer = document.querySelector('.write-blog-container');
    
    // Show/hide appropriate content based on login status
    if (!isLoggedIn || !userId) {
        // User is not logged in, show login message
        if (loginMessage) loginMessage.style.display = 'flex';
        if (writeBlogContainer) writeBlogContainer.style.display = 'none';
    } else {
        // User is logged in, show blog form
        if (loginMessage) loginMessage.style.display = 'none';
        if (writeBlogContainer) writeBlogContainer.style.display = 'block';
        
        // Setup form submission
        if (blogForm) {
            blogForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Create FormData object
                const formData = new FormData(blogForm);
                
                // Important: Add the userId to the form data
                formData.append('userId', userId);
                
                try {
                    const response = await fetch('/write-blog', {
                        method: 'POST',
                        body: formData // FormData automatically sets content-type
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        alert('Blog post published successfully!');
                        window.location.href = data.redirectUrl || '/';
                    } else {
                        alert('Error: ' + data.message);
                    }
                } catch (error) {
                    console.error('Error submitting blog post:', error);
                    alert('An error occurred while publishing your blog post.');
                }
            });
        }
        
        // Setup image preview functionality
        const fileInput = document.getElementById('blog-image');
        const previewContainer = document.querySelector('.image-preview-container');
        const imagePreview = document.getElementById('image-preview');
        const uploadInstruction = document.querySelector('.upload-instruction');
        
        if (fileInput && previewContainer && imagePreview) {
            // Click on the preview container to trigger file input
            previewContainer.addEventListener('click', () => {
                fileInput.click();
            });
            
            // Update image preview when a file is selected
            fileInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        imagePreview.src = e.target.result;
                        imagePreview.style.display = 'block';
                        if (uploadInstruction) {
                            uploadInstruction.style.display = 'none';
                        }
                    };
                    
                    reader.readAsDataURL(this.files[0]);
                }
            });
        }
    }
});
