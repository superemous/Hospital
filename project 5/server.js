const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = 4300;

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'world',
  password: '123456',
  port: 5432,
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.post('/check-aadhar', async (req, res) => {
  const { aadhar_no } = req.body;

  try {
    // Directly query the user table without checking existence
    const result = await pool.query(
      'SELECT * FROM "user" WHERE aadhar_no = $1',
      [aadhar_no]
    );

    if (result.rows.length > 0) {
      // Redirect with Aadhar number if found
      res.json({ 
        exists: true,
        redirect: `/dashboard.html?aadhar=${aadhar_no}`
      });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

app.get('/user-data', async (req, res) => {
  const { aadhar } = req.query;

  try {
    // Directly fetch user data
    const result = await pool.query(
      'SELECT * FROM "user" WHERE aadhar_no = $1',
      [aadhar]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

// Add this new endpoint to get hospital data
app.get('/hospital-records', async (req, res) => {
    const { aadhar } = req.query;
    console.log('Fetching hospital records for:', aadhar);
  
    try {
      const result = await pool.query(
          `SELECT 
          to_char("Date", 'YYYY - MM - DD' ) as formatted_date,
          prescription FROM hospital_data
          WHERE aadhar_no = $1
          ORDER BY "Date" DESC`,
          [aadhar]
      );
  
      console.log('Found records:', result.rows.length);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching hospital records:', err);
      res.status(500).json({ 
        error: 'Failed to fetch hospital records',
        details: err.message 
      });
    }
  });

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});