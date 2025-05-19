document.addEventListener('DOMContentLoaded', function() {
    // Handle click events for blog cards in the hero section
    const leftSectionBlog = document.querySelector('.left-section');
    if (leftSectionBlog) {
        leftSectionBlog.addEventListener('click', function() {
            const blogTitle = this.querySelector('.blog-title').textContent;
            navigateToBlogPost(blogTitle);
        });
    }

    // Handle click events for blog cards in the right section
    const rightSectionBlogs = document.querySelectorAll('.right-section > div');
    rightSectionBlogs.forEach(blog => {
        blog.addEventListener('click', function() {
            const blogTitle = this.querySelector('.blog-title').textContent;
            navigateToBlogPost(blogTitle);
        });
    });

    // Handle click events for featured content
    const featuredBlogs = document.querySelectorAll('.featured-content-container:not(#featured-heading)');
    featuredBlogs.forEach(blog => {
        blog.addEventListener('click', function() {
            const blogTitle = this.querySelector('.title').textContent;
            navigateToBlogPost(blogTitle);
        });
    });

    // Handle click events for recent content
    const recentBlogs = document.querySelectorAll('.recent-content-container');
    recentBlogs.forEach(blog => {
        blog.addEventListener('click', function() {
            const blogTitle = this.querySelector('.title').textContent;
            navigateToBlogPost(blogTitle);
        });
    });

    // Function to create a slug from the blog title and navigate to the blog post
    function navigateToBlogPost(title) {
        if (!title) return;
        
        // Create a URL-friendly slug from the title
        const slug = title.toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-')     // Replace spaces with hyphens
            .replace(/--+/g, '-');    // Replace multiple hyphens with single hyphen
        
        // Navigate to the blog post page
        window.location.href = `/blog/${slug}`;
    }

    // Add cursor pointer to make it clear items are clickable
    const allClickableBlogs = document.querySelectorAll('.left-section, .right-section > div, .featured-content-container:not(#featured-heading), .recent-content-container');
    allClickableBlogs.forEach(blog => {
        blog.style.cursor = 'pointer';
    });
});
