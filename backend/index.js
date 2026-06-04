const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: '*' }));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

// Register routes
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/components', require('./routes/components'));
  app.use('/api/transactions', require('./routes/transactions'));
  app.use('/api/search', require('./routes/search'));
  app.use('/api/users', require('./routes/users'));
  console.log('Routes loaded successfully');
} catch (err) {
  console.error('Error loading routes:', err.message);
}

// Dashboard stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
  const pool = require('./db');
  
  // Apply auth check
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const total = await pool.query('SELECT COUNT(*) FROM components');
    const lowStock = await pool.query(
      'SELECT COUNT(*) FROM components WHERE remaining_stock <= low_stock_threshold'
    );
    const outOfStock = await pool.query(
      'SELECT COUNT(*) FROM components WHERE remaining_stock = 0'
    );
    const shippedToday = await pool.query(
      `SELECT COALESCE(SUM(quantity_change), 0) as total
       FROM stock_transactions
       WHERE action_type = 'shipped'
       AND performed_at::date = CURRENT_DATE`
    );
    res.json({
      total_components: parseInt(total.rows[0].count),
      low_stock: parseInt(lowStock.rows[0].count),
      out_of_stock: parseInt(outOfStock.rows[0].count),
      shipped_today: parseInt(shippedToday.rows[0].total),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Error handlers
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});

module.exports = server;