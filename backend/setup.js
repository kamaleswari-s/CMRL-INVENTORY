const pool = require('./db');

const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'store_manager', 'engineer', 'procurement')),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Users table created');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS components (
        id SERIAL PRIMARY KEY,
        component_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(200) NOT NULL,
        code VARCHAR(100),
        category VARCHAR(100) NOT NULL,
        total_stock INTEGER DEFAULT 0,
        remaining_stock INTEGER DEFAULT 0,
        used_quantity INTEGER DEFAULT 0,
        shipped_quantity INTEGER DEFAULT 0,
        storage_location VARCHAR(100),
        low_stock_threshold INTEGER DEFAULT 20,
        unit VARCHAR(50) DEFAULT 'pcs',
        supplier VARCHAR(200),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Components table created');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS stock_transactions (
        id SERIAL PRIMARY KEY,
        component_id VARCHAR(50) REFERENCES components(component_id),
        action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('received', 'used', 'shipped', 'adjusted', 'added')),
        quantity_change INTEGER NOT NULL,
        stock_before INTEGER NOT NULL,
        stock_after INTEGER NOT NULL,
        performed_by INTEGER REFERENCES users(id),
        notes TEXT,
        performed_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Stock transactions table created');

    await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES (
        'Admin',
        'admin@cmrl.in',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
        'admin'
      )
      ON CONFLICT (email) DO NOTHING;
    `);
    console.log('Default admin user created');
    console.log('Email: admin@cmrl.in');
    console.log('Password: password');

    console.log('All tables created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error creating tables:', err.message);
    process.exit(1);
  }
};

createTables();