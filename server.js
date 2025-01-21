require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: 'https://rudmila5.github.io',
}));

app.use(express.json());

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'monorail.proxy.rlwy.net',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'yiIqbIUFsCFBshHtqlFyEraZAOcqKaly',
  database: process.env.MYSQL_DATABASE || 'railway',
  port: process.env.MYSQL_PORT || 21049,
  connectionLimit: 10,
  connectTimeout: 30000
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection error:', err.message);
    return;
  }
  console.log('Database connected!');
  connection.release();
});

app.get('/', (req, res) => {
  res.send('Welcome to BeautyFinder API');
});

app.get('/search', (req, res) => {
  const searchTerm = req.query.query;

  if (!searchTerm || searchTerm.trim() === '') {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const queryParams = [`%${searchTerm.trim()}%`];

  const sqlQuery = `
    SELECT 
      p.product_name, 
      COALESCE(p.brand_name, 'No brand available') AS brand_name,
      COALESCE(c.category_name, 'No category available') AS category_name,
      i.ingredient_name, 
      COALESCE(p.product_URL, 'No URL available') AS product_URL
    FROM products_ingredients pi
    INNER JOIN products p ON pi.product_id = p.product_id
    INNER JOIN ingredients i ON pi.ingredient_id = i.ingredient_id
    INNER JOIN categories c ON p.category_id = c.category_id
    WHERE i.ingredient_name LIKE ?;
  `;

  pool.query(sqlQuery, queryParams, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No products found for the given ingredient' });
    }

    res.json(results);
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
