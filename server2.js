const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 4000;

// PostgreSQL connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'world',
    password: '123456',
    port: 5432,
});

// Middleware to parse JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Predefined username and password
const USERNAME = 'admin';
const PASSWORD = 'password';

// Login route for the second login page
app.post('/login2', (req, res) => {
    const { username, password } = req.body;
    if (username === USERNAME && password === PASSWORD) {
        res.sendFile(__dirname + '/public/dashboard2.html');
    } else {
        res.send('Invalid credentials');
    }
});

// Fetch the first entry from the queue table
app.get('/first-entry', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM queue ORDER BY id LIMIT 1');
        res.json(result.rows[0] || {});
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

// Insert data into the hospital_data table
app.post('/add-hospital-data', async (req, res) => {
    const { adhar_no, prescription } = req.body;
    try {
        const query = `
            INSERT INTO hospital_data (adhar_no, prescription)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const values = [adhar_no, prescription];
        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Fetch all data from the hospital_data table
app.get('/hospital-data', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM hospital_data ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Delete the first row from the queue table
app.delete('/delete-first-entry', async (req, res) => {
    try {
        const query = `
            DELETE FROM queue
            WHERE id = (SELECT id FROM queue ORDER BY id LIMIT 1)
            RETURNING *;
        `;
        const result = await pool.query(query);
        res.json(result.rows[0]); // Return the deleted row
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});