const bcrypt = require('bcryptjs');
const pool = require('./db');

async function reset() {
  const hash = await bcrypt.hash('password', 10);
  await pool.query('UPDATE users SET password=$1', [hash]);
  console.log('Password reset for all users successfully');
  process.exit();
}

reset();