const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: 'your-secret-key', // ඔයාගේ රහස් කී එකක් දාන්න
    resave: false,
    saveUninitialized: true
}));

const db = new sqlite3.Database('./users.db');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)");
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], function(err) {
        if (err) {
            return res.status(500).send('Registration failed: Username already exists.');
        }
        res.send('Registration successful!');
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (err) {
            return res.status(500).send('Login failed.');
        }
        if (row) {
            req.session.loggedIn = true;
            req.session.username = username;
            res.json({ success: true, message: 'Login successful!' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Logout failed.');
        }
        res.send('Logout successful!');
    });
});

app.get('/protected', (req, res) => {
    if (req.session.loggedIn) {
        res.send(`Welcome, ${req.session.username}! This is a protected area.`);
    } else {
        res.status(401).send('Unauthorized. Please log in.');
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

app.use(express.static('../')); // ඔයාගේ HTML ෆයිල් එක තියෙන ෆෝල්ඩරේ පාර දෙන්න