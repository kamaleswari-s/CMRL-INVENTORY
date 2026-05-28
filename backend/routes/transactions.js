const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  if (!['admin', 'store_manager', 'procurement'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  const { component_id, action_type, quantity, notes } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const compResult = await client.query(
      'SELECT * FROM components WHERE component_id = $1 FOR UPDATE',
      [component_id]
    );
    if (compResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Component not found' });
    }
    const comp = compResult.rows[0];
    const stock_before = comp.remaining_stock;
    let stock_after = stock_before;
    let total_stock = comp.total_stock;
    let used_quantity = comp.used_quantity;
    let shipped_quantity = comp.shipped_quantity;

    if (action_type === 'received') {
      stock_after = stock_before + quantity;
      total_stock = total_stock + quantity;
    } else if (action_type === 'used') {
      if (quantity > stock_before) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Not enough stock' });
      }
      stock_after = stock_before - quantity;
      used_quantity = used_quantity + quantity;
    } else if (action_type === 'shipped') {
      if (quantity > stock_before) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Not enough stock' });
      }
      stock_after = stock_before - quantity;
      shipped_quantity = shipped_quantity + quantity;
    } else if (action_type === 'adjusted') {
      stock_after = quantity;
    }

    await client.query(
      `UPDATE components SET
        remaining_stock=$1, total_stock=$2,
        used_quantity=$3, shipped_quantity=$4,
        updated_at=NOW()
       WHERE component_id=$5`,
      [stock_after, total_stock, used_quantity, shipped_quantity, component_id]
    );

    const transaction = await client.query(
      `INSERT INTO stock_transactions
        (component_id, action_type, quantity_change, stock_before, stock_after, performed_by, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [component_id, action_type, quantity, stock_before, stock_after, req.user.id, notes]
    );

    await client.query('COMMIT');

    res.status(201).json({
      transaction: transaction.rows[0],
      updated_stock: stock_after,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    client.release();
  }
});

router.get('/component/:component_id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.name as performed_by_name
       FROM stock_transactions t
       LEFT JOIN users u ON t.performed_by = u.id
       WHERE t.component_id = $1
       ORDER BY t.performed_at DESC`,
      [req.params.component_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/audit/all', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.name as performed_by_name, c.name as component_name
       FROM stock_transactions t
       LEFT JOIN users u ON t.performed_by = u.id
       LEFT JOIN components c ON t.component_id = c.component_id
       ORDER BY t.performed_at DESC
       LIMIT 200`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;