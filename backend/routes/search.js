const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === '') {
    return res.json([]);
  }
  try {
    const result = await pool.query(
      `SELECT * FROM components
       WHERE
         component_id ILIKE $1 OR
         name ILIKE $1 OR
         code ILIKE $1 OR
         category ILIKE $1 OR
         storage_location ILIKE $1 OR
         supplier ILIKE $1
       ORDER BY name
       LIMIT 50`,
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;