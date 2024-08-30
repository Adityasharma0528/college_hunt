// Import necessary modules
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure MySQL connection
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Aditi@12345',
    database: 'collegepicker',
    connectionLimit: 10
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
    connection.release();
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Serve HTML files
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'login.html'));
// });

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/filter', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'filter.html'));
});

// Register a new user
// Register a new user
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    // Check if the email is already registered
    const checkEmailSql = 'SELECT * FROM users WHERE email = ?';
    pool.query(checkEmailSql, [email], (err, results) => {
        if (err) {
            console.error('Error checking email:', err);
            return res.status(500).json({ error: 'Error checking email' });
        }

        if (results.length > 0) {
            // Email already exists
            return res.status(409).json({ error: 'This email is already registered' });
        }

        // Email does not exist, proceed to register the user
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).json({ error: 'Error registering user' });
            }
            const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
            pool.query(sql, [name, email, hash], (err) => {
                if (err) {
                    console.error('Error inserting user into database:', err);
                    return res.status(500).json({ error: 'Error registering user' });
                }
                console.log('User registered successfully');
                res.status(200).json({ success: true });
            });
        });
    });
});


// Login user
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ?';
    pool.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Error querying user:', err);
            return res.status(500).json({ error: 'Error logging in' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        bcrypt.compare(password, results[0].password, (err, match) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ error: 'Error logging in' });
            }
            if (!match) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            console.log('User logged in successfully');
            res.status(200).json({ success: true });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
