const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// GET all active components (exclude deleted)
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM components WHERE deleted_at IS NULL ORDER BY created_at ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET components by category (exclude deleted)
router.get('/category/:category', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM components WHERE category = $1 AND deleted_at IS NULL ORDER BY created_at ASC',
      [req.params.category]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// SOFT DELETE component by ID (mark as deleted, don't actually delete)
router.delete('/:component_id', auth, async (req, res) => {
  console.log('DELETE request received for:', req.params.component_id);
  console.log('User role:', req.user.role);
  
  const userRole = req.user.role?.trim().toLowerCase();
  if (userRole !== 'admin') {
    console.log('User is not admin, denying delete');
    return res.status(403).json({ message: 'Only admin can delete components' });
  }
  
  try {
    console.log('Attempting to soft delete component:', req.params.component_id);
    const result = await pool.query(
      'UPDATE components SET deleted_at = NOW() WHERE component_id = $1 AND deleted_at IS NULL RETURNING *',
      [req.params.component_id]
    );
    
    if (result.rows.length === 0) {
      console.log('Component not found or already deleted:', req.params.component_id);
      return res.status(404).json({ message: 'Component not found or already deleted' });
    }
    
    console.log('Component soft deleted successfully:', req.params.component_id);
    res.json({ message: 'Component moved to trash', deleted: result.rows[0] });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// RESTORE deleted component from trash
router.put('/:component_id/restore', auth, async (req, res) => {
  const userRole = req.user.role?.trim().toLowerCase();
  if (userRole !== 'admin') {
    return res.status(403).json({ message: 'Only admin can restore components' });
  }
  
  try {
    const result = await pool.query(
      'UPDATE components SET deleted_at = NULL WHERE component_id = $1 AND deleted_at IS NOT NULL RETURNING *',
      [req.params.component_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Component not found in trash' });
    }
    
    res.json({ message: 'Component restored successfully', restored: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET trash (deleted components)
router.get('/trash/all', auth, async (req, res) => {
  const userRole = req.user.role?.trim().toLowerCase();
  if (userRole !== 'admin') {
    return res.status(403).json({ message: 'Only admin can view trash' });
  }
  
  try {
    const result = await pool.query(
      'SELECT * FROM components WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PERMANENTLY delete old trash items (30+ days old)
router.delete('/trash/cleanup', auth, async (req, res) => {
  const userRole = req.user.role?.trim().toLowerCase();
  if (userRole !== 'admin') {
    return res.status(403).json({ message: 'Only admin can cleanup trash' });
  }
  
  try {
    const result = await pool.query(
      `DELETE FROM components 
       WHERE deleted_at IS NOT NULL 
       AND deleted_at < NOW() - INTERVAL '30 days'
       RETURNING *`
    );
    
    res.json({ 
      message: `Permanently deleted ${result.rows.length} old components`,
      count: result.rows.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET single component by ID (both active and deleted)
router.get('/:component_id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM components WHERE component_id = $1',
      [req.params.component_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Component not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// CREATE component
router.post('/', auth, async (req, res) => {
  const {
    component_id, name, code, category,
    total_stock, storage_location,
    low_stock_threshold, unit, notes,
    invoice_no, vendor_name
  } = req.body;
  if (!['admin', 'store_manager'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO components 
        (component_id, name, code, category, total_stock, remaining_stock,
         storage_location, low_stock_threshold, unit, notes, invoice_no, vendor_name)
       VALUES ($1,$2,$3,$4,$5,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [component_id, name, code, category, total_stock,
       storage_location, low_stock_threshold, unit, notes, invoice_no, vendor_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Component ID already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// UPDATE component
router.put('/:component_id', auth, async (req, res) => {
  if (!['admin', 'store_manager'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  const {
    name, code, storage_location,
    low_stock_threshold, unit, notes,
    invoice_no, vendor_name
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE components SET
        name=$1, code=$2, storage_location=$3,
        low_stock_threshold=$4, unit=$5,
        notes=$6, invoice_no=$7, vendor_name=$8, updated_at=NOW()
       WHERE component_id=$9 AND deleted_at IS NULL RETURNING *`,
      [name, code, storage_location,
       low_stock_threshold, unit, notes,
       invoice_no, vendor_name,
       req.params.component_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Component not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;