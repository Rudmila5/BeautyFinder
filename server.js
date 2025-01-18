const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Rudu5@',
  database: 'ingredientfinder',
  connectionLimit: 10,
});

app.get('/search', (req, res) => {
  const searchTerm = req.query.query;

  
  console.log(`Received query: ${searchTerm}`);

  if (!searchTerm || searchTerm.trim() === '') {
    console.log('Error: No query parameter provided or query is empty');
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

  // Log the SQL query to verify it's being formed correctly
  console.log(`Executing SQL Query: ${sqlQuery}, with parameter: ${queryParams[0]}`);

  pool.query(sqlQuery, queryParams, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    if (results.length === 0) {
      console.log('No products found for the given ingredient');
      return res.status(404).json({ message: 'No products found for the given ingredient' });
    }

    console.log(`Found ${results.length} products matching the query`);
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
