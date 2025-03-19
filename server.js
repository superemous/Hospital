const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// PostgreSQL connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'world',
    password: '123456',
    port: 5432,
});

// Middleware to parse JSON and form data
app.use(bodyParser.json()); // Parse JSON data
app.use(bodyParser.urlencoded({ extended: true })); // Parse form data
app.use(express.static('public'));

// Predefined username and password
const USERNAME = 'admin';
const PASSWORD = 'password';

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === USERNAME && password === PASSWORD) {
        res.sendFile(__dirname + '/public/dashboard.html');
    } else {
        res.send('Invalid credentials');
    }
});


app.post('/add-to-queue', async (req, res) => {
    const { text1, text2, text3, number1, number2 } = req.body;
    try {
        const query = `
            INSERT INTO queue (text1, text2, text3, number1, number2)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [text1, text2, text3, Number(number1), Number(number2)]; 
        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


app.get('/queue-data', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM queue ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});