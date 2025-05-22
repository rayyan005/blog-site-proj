const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
// Add cookie-parser for handling cookies
const cookieParser = require('cookie-parser');
// Add hbs for better Handlebars configuration
const hbs = require('hbs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// Set up Handlebars view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views')); // Set the views directory

// Register partials directory
hbs.registerPartials(path.join(__dirname, '../views/partials'));

// Add middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser()); // Add cookie parser middleware
app.use(express.static(path.join(__dirname, '../public'))); // Serve static files from the public directory


// Route to serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});


// Create a connection to the database
const con = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});

// Connect to the database
con.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});



// Route to handle registration
// This route will be called when the user submits the registration form
// The form data will be sent as a POST request to this route
app.post('/register', (req, res) => {
    // Updated to match the form field names from HTML
    const { email, firstName, lastName, username, password, confirmPassword } = req.body;
    
    // Log the request body to help with debugging
    console.log("Registration attempt with data:", req.body);

    // Check for both email and username
    con.query('SELECT email, username FROM users WHERE email = ? OR username = ?', [email, username], async (error, result) => {
        if (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Database error. Please try again."
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        if (result.length > 0) {
            // checking if email or username already exists
            const emailExists = result.some(user => user.email === email);
            const usernameExists = result.some(user => user.username === username);

            //If both email and username exist
            if (emailExists && usernameExists) {
                return res.status(409).json({
                    success: false,
                    message: "That email and username are already in use"
                });
            } else if (emailExists) {
                return res.status(409).json({
                    success: false,
                    message: "That email is already in use"
                });
            } else {
                return res.status(409).json({
                    success: false,
                    message: "That username is already in use"
                });
            }
        }

        // Hash the password
        let hashedPassword = await bcrypt.hash(password, 10);

        con.query('INSERT INTO users SET ?', {
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: email,
            password: hashedPassword
        }, (error, results) => {
            if (error) {
                console.log("Database error during insertion:", error);
                return res.status(500).json({
                    success: false,
                    message: "Error registering user"
                });
            }
            
            console.log("User registration successful, inserted ID:", results.insertId);
            return res.status(201).json({
                success: true,
                message: "Registration successful",
                redirectUrl: '/login.html'
            });
        });
    });
});






// Route to handle login
// This route will be called when the user submits the login form
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Log the request body to help with debugging
    console.log("Login attempt with data:", req.body);

    const sql = 'SELECT * FROM users WHERE username = ?';

    con.query(sql, [username, username], async (error, results) => {
        if (error) {
            console.log("Database error during login:", error);
            return res.status(500).json({
                success: false,
                message: "Database error. Please try again."
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or email"
            });
        }

        const user = results[0];
        bcrypt.compare(password, user.password, (error, result) => {
            if (error) {
                console.log("Error comparing passwords:", error);
                return res.status(500).json({
                    status: error,
                    message: "Error during password comparison"
                });
            }

            if (result) {
                // Passwords match
                console.log("Login successful for user:", user.username);
                return res.status(200).json({
                    success: true,
                    message: "Login successful",
                    redirectUrl: '/', // Changed from '/index.html' to '/'
                    userId: user.id
                });
            } else {
                // Passwords do not match
                console.log("Invalid password for user:", user.username);
                return res.status(401).json({
                    success: false,
                    message: "Invalid password"
                });
            }
        })
    })
});





// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// Set storage engine
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/uploads/'),
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 }, // Limit file size to 1MB
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('blog-image');




//Route to handle blog post submission
app.post('/write-blog', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.log("Error during file upload:", err);
            return res.status(400).json({
                success: false,
                message: err
            });
        }

        const { userId, title, description, content } = req.body;
        console.log("Received userId:", userId); // Add this for debugging

        // Generate a slug: lowercase, remove special chars, replace spaces with hyphens
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove all non-alphanumeric except spaces and hyphens
            .replace(/\s+/g, '-')         // Replace spaces with hyphens
            .replace(/-+/g, '-');         // Replace multiple hyphens with single


        // Check if userId exists and is valid
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "You must be logged in to post a blog"
            });
        }

        // First verify the user exists
        con.query('SELECT id FROM users WHERE id = ?', [userId], (error, userResults) => {
            if (error) {
                console.log("Error verifying user:", error);
                return res.status(500).json({
                    success: false,
                    message: "Error verifying user"
                });
            }

            if (userResults.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid user ID. Please log in again."
                });
            }

            // Check if a file was uploaded
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No image file was uploaded"
                });
            }

            const imageUrl = `/uploads/${req.file.filename}`;
            const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

            const sql = 'INSERT INTO blogs_data (userID, title, slug, description, content, imageURL, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)';

            con.query(sql, [userId, title, slug, description, content, imageUrl, created_at], (error, results) => {
                if (error) {
                    console.log("Database error during blog post insertion:", error);
                    return res.status(500).json({
                        success: false,
                        message: "Error saving blog post"
                    });
                }

                console.log("Blog post saved successfully with ID:", results.insertId);
                return res.status(201).json({
                    success: true,
                    message: "Blog post saved successfully",
                    redirectUrl: '/'
                });
            });
        });
    });
});





app.get('/profile/:username', (req, res) => {

    const username = req.params.username;

    if (!username) {
        return res.status(401).redirect('/login');
    }

    const sql = 'SELECT id, username, firstName, lastName, email FROM users WHERE username = ?';

    con.query(sql, [username], (error, result) => {

        if (error || result.length === 0) {
            console.log("Error finding user:", error);
            return res.status(404).send('User not found');
        }

        const user = result[0];

        const blogsQuery = 'SELECT id, title, description, content, imageURL, createdAt FROM blogs_data WHERE userID = ? ORDER BY createdAt DESC';

        con.query(blogsQuery, [user.id], (error, blogsResults) => {

            if (error) {
                console.log("Error fetching blogs:", error);
                return res.status(500).send('Error fetching blogs');
            }

            // Format blog data for display
            const blogs = blogsResults.map(blog => {
                // Create a truncated summary from the content or use description
                const summary = blog.description || (blog.content.length > 150 
                    ? blog.content.substring(0, 150) + '...' 
                    : blog.content);
                
                // Format the date
                const date = new Date(blog.createdAt);
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                
                return {
                    id: blog.id,
                    title: blog.title,
                    summary: summary,
                    imageUrl: blog.imageURL,
                    formattedDate: formattedDate
                };
            });

            // Render the profile template with user and blogs data
            res.render('profile', {
                user: user,
                blogs: blogs,
                hasMoreBlogs: false,
                nextPage: 2
            });
        });
    });
});

// Middleware to check if the user is logged in
const checkLoggedIn = (req, res, next) => {
    // The error happens because req.cookies might be undefined if cookie-parser middleware is not used
    // Also, we should account for authorization header as a fallback
    // For a real app with localStorage, this check doesn't work directly since localStorage is client-side
    // Instead, we'd typically use sessions/JWT tokens
    
    // For now, we'll just allow access and let the client-side handle authorization
    // In a real app, implement proper authentication with sessions or JWT
    next();
};

// Route to serve the login.html file when /login is requested
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// Route to serve the register.html file when /register is requested 
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'register.html'));
});

// Route to serve the write-blog.html file when /write-blog is requested
// We'll remove the middleware to allow page access, but control content via JavaScript
app.get('/write-blog', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'write-blog.html'));
});

// Route to serve the profile.html file when /profile is requested
// Protect this route with the checkLoggedIn middleware
app.get('/profile', (req, res) => {
    // Redirect to profile page with the username from localStorage
    // The actual authentication will be handled client-side
    res.sendFile(path.join(__dirname, '../public', 'profile.html'));
});

// Route to handle individual blog posts by title (URL-safe slug)
app.get('/blog/:slug', (req, res) => {
    const slug = req.params.slug;
    
    // Update the query to use the stored slug column
    const sql = `
    SELECT b.id, b.title, b.description, b.content, b.imageURL, b.createdAt, 
           u.username, u.firstName, u.lastName 
    FROM blogs_data b
    JOIN users u ON b.userID = u.id
    WHERE b.slug = ?`;
    
    
    con.query(sql, [slug], (error, results) => {
        if (error) {
            console.log("Error fetching blog:", error);
            return res.status(500).send('Database error');
        }
        
        if (results.length === 0) {
            return res.status(404).render('blog-post', {
                error: true,
                message: 'Blog post not found'
            });
        }
        
        const blog = results[0];
        
        // Format the date
        const date = new Date(blog.createdAt);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Create an author display name
        const authorName = `${blog.firstName} ${blog.lastName}`;
        
        // Prepare the blog data for the template
        const blogData = {
            id: blog.id,
            title: blog.title,
            description: blog.description,
            content: formatBlogContent(blog.content), // Format the content as HTML
            imageUrl: blog.imageURL,
            date: formattedDate,
            author: authorName,
            username: blog.username
        };
        
        // Render the Handlebars template with the blog data
        res.render('blog-post', { 
            blog: blogData,
            pageTitle: blog.title + ' - the blog site'
        });
    });
});

// Route to handle blog post access by ID
app.get('/blog-post/:id', (req, res) => {
    const blogId = req.params.id;
    
    // Query to find blog by ID
    const sql = `
        SELECT b.id, b.title, b.description, b.content, b.imageURL, b.createdAt, 
               u.username, u.firstName, u.lastName 
        FROM blogs_data b
        JOIN users u ON b.userID = u.id
        WHERE b.id = ?`;
    
    con.query(sql, [blogId], (error, results) => {
        if (error) {
            console.log("Error fetching blog:", error);
            return res.status(500).send('Database error');
        }
        
        if (results.length === 0) {
            return res.status(404).render('blog-post', {
                error: true,
                message: 'Blog post not found'
            });
        }
        
        const blog = results[0];
        
        // Create a URL-friendly slug from the title
        const slug = blog.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        
        // Redirect to the slug-based URL for better SEO
        return res.redirect(`/blog/${slug}`);
    });
});

// Helper function to convert plain text with line breaks to HTML paragraphs
function formatBlogContent(content) {
    if (!content) return '';
    
    // Split content by line breaks and wrap each paragraph in <p> tags
    const paragraphs = content.split(/\r?\n\r?\n/);
    return paragraphs.map(p => `<p>${p.replace(/\r?\n/g, '<br>')}</p>`).join('');
}




app.post('/comments', (req, res) => {
    const { userId, blogId, comment } = req.body;

    // Comprehensive validation
    if (!userId || isNaN(parseInt(userId))) {
        console.log("Comment attempt without valid userId:", userId);
        return res.status(401).json({
            success: false,
            message: "You must be logged in to post a comment"
        });
    }

    if (!blogId || isNaN(parseInt(blogId))) {
        return res.status(400).json({
            success: false,
            message: "Invalid blog ID"
        });
    }

    if (!comment || comment.trim() === '') {
        return res.status(400).json({
            success: false,
            message: "Comment cannot be empty"
        });
    }

    // First check if the user exists
    const checkUserSql = 'SELECT id, username, firstName, lastName FROM users WHERE id = ?';
    
    con.query(checkUserSql, [userId], (userError, userResults) => {
        if (userError) {
            console.log("Database error checking user:", userError);
            return res.status(500).json({
                success: false,
                message: "Error verifying user identity"
            });
        }

        if (userResults.length === 0) {
            console.log("Comment attempt with non-existent userId:", userId);
            return res.status(401).json({
                success: false,
                message: "Invalid user. Please log in again."
            });
        }

        // Now check if the blog exists
        const checkBlogSql = 'SELECT id FROM blogs_data WHERE id = ?';
        
        con.query(checkBlogSql, [blogId], (blogError, blogResults) => {
            if (blogError) {
                console.log("Database error checking blog:", blogError);
                return res.status(500).json({
                    success: false,
                    message: "Error verifying blog existence"
                });
            }

            if (blogResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Blog post not found"
                });
            }

            // All checks passed, now save the comment
            const user = userResults[0];
            const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
            
            const sql = 'INSERT INTO comments_data (userID, blogID, comment, createdAt) VALUES (?, ?, ?, ?)';

            con.query(sql, [userId, blogId, comment, createdAt], (error, results) => {
                if (error) {
                    console.log("Database error during comment insertion:", error);
                    return res.status(500).json({
                        success: false,
                        message: "Error saving comment"
                    });
                }

                console.log("Comment saved successfully with ID:", results.insertId);
                return res.status(201).json({
                    success: true,
                    message: "Comment saved successfully",
                    commentId: results.insertId,
                    username: user.username,
                    authorName: `${user.firstName} ${user.lastName}`,
                    createdAt: createdAt
                });
            });
        });
    });
});

// Add this route to your server.js to fetch comments for a blog post
app.get('/api/comments/:blogId', (req, res) => {
    const blogId = req.params.blogId;
    
    const sql = `
        SELECT c.id, c.comment, c.createdAt, c.userID,
               u.username, u.firstName, u.lastName
        FROM comments_data c
        JOIN users u ON c.userID = u.id
        WHERE c.blogID = ?
        ORDER BY c.createdAt DESC`;
    
    con.query(sql, [blogId], (error, results) => {
        if (error) {
            console.log("Error fetching comments:", error);
            return res.status(500).json({
                success: false,
                message: "Error retrieving comments"
            });
        }
        
        // Format the comments for the frontend
        const comments = results.map(comment => {
            const date = new Date(comment.createdAt);
            return {
                id: comment.id,
                username: comment.username,
                authorName: `${comment.firstName} ${comment.lastName}`,
                comment: comment.comment,
                createdAt: date.toLocaleString(),
                userId: comment.userID
            };
        });
        
        return res.status(200).json({
            success: true,
            comments: comments
        });
    });
});


app.get('/search', (req, res) => {

    const { query } = req.query;

    const sql = `
        SELECT id, title, description, imageURL 
        FROM blogs_data 
        WHERE title LIKE ? OR description LIKE ? OR content LIKE ?
        ORDER BY createdAt DESC
        LIMIT 20`;

    const searchPattern = `%${query}%`;
    
    con.query(sql, [searchPattern, searchPattern, searchPattern], (error, results) => {
        if (error) {
            console.log("Error searching blogs:", error);
            return res.status(500).json({
                success: false,
                message: "Error searching blogs"
            });
        }
        
        return res.status(200).json({
            success: true,
            results: results
        });
    });
});

// Add a route to serve the search results page
app.get('/search-results', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'search-results.html'));
});


const port = 3000; // Port for the server to listen on

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});