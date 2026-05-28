const bcrypt = require('bcryptjs');
const pool = require('./db');

async function check() {
  const res = await pool.query('SELECT password FROM users WHERE email=$1', ['admin@cmrl.in']);
  const hash = res.rows[0].password;
  console.log('Hash in DB:', hash);
  const match = await bcrypt.compare('password', hash);
  console.log('Password match:', match);
  process.exit();
}

check();