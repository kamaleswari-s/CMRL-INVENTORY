const express = require('express');
const cors = require('cors');
const http = require('http');

// Only use dotenv in local development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: '*' }));
app.use(express.json());

// Test endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

app.get('/api/test', (req, res) => {
  res.json({ test: 'success' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = server;