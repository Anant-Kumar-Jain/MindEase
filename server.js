const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// --- In-memory "database" for demonstration ---
// In a real application, you would use a proper database like MongoDB or PostgreSQL.
const users = [];

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies from incoming requests
app.use(express.static(path.join(__dirname, '/'))); // Serve static files like index.html, style.css, and script.js


// --- API Endpoints ---

/**
 * API Endpoint for User Signup
 * POST /api/auth/signup
 */
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        // Check if user already exists (in a real app, you'd query your database)
        const userExists = users.find(user => user.email === email);
        if (userExists) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        // Hash the password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save the new user (in-memory for this example)
        const newUser = { id: users.length + 1, username, email, password: hashedPassword };
        users.push(newUser);

        console.log('New user signed up:', newUser);
        console.log('All users:', users);

        // In a real app, you would generate a JWT token and send it back
        res.status(201).json({ message: 'User created successfully!', userId: newUser.id });

    } catch (error) {
        res.status(500).json({ message: 'Server error during signup.', error: error.message });
    }
});

/**
 * API Endpoint for User Login
 * POST /api/auth/login
 */
app.post('/api/auth/login', (req, res) => {
    // In a real application, you would find the user in the database,
    // compare the hashed password using bcrypt.compare(),
    // and if successful, return a JSON Web Token (JWT) for session management.
    const { email, password } = req.body;
    res.json({ message: `Login endpoint called for user: ${email}. Implement login logic here.` });
});


// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
