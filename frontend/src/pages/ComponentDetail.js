import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getComponent, updateComponent } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
// import io from 'socket.io-client';

// const socket = io('https://cmrl-inventory-production.up.railway.app');

export default function ComponentDetail() {
  const { component_id } = useParams();
  const { user } = useAuth();
  const [component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getComponent(component_id);
      setComponent(res.data);
      setForm(res.data);
    } catch (err) {
      toast.error('Failed to load component');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
    // socket.on('stockUpdate', fetchData);
    // return () => socket.off('stockUpdate');
  }, [component_id, fetchData]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateComponent(component_id, form);
      toast.success('Component updated');
      setEditing(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleAddStock = async () => {
    const quantity = prompt('Enter quantity to add:');
    if (!quantity || isNaN(quantity)) return;
    try {
      await fetch(`https://cmrl-inventory-production.up.railway.app/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          component_id,
          action_type: 'received',
          quantity_change: parseInt(quantity),
          notes: 'Stock added',
        }),
      });
      toast.success('Stock added');
      fetchData();
    } catch (err) {
      toast.error('Failed to add stock');
    }
  };

  const handleShip = async () => {
    const quantity = prompt('Enter quantity to ship:');
    if (!quantity || isNaN(quantity)) return;
    try {
      await fetch(`https://cmrl-inventory-production.up.railway.app/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          component_id,
          action_type: 'shipped',
          quantity_change: parseInt(quantity),
          notes: 'Stock shipped',
        }),
      });
      toast.success('Stock shipped');
      fetchData();
    } catch (err) {
      toast.error('Failed to ship stock');
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(245,240,232,0.05)',
    border: '0.5px solid rgba(30,144,255,0.2)',
    borderRadius: '8px',
    padding: '9px 12px',
    fontSize: '12px',
    color: '#F5F0E8',
    outline: 'none',
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#1E90FF' }}>Loading...</div>;
  if (!component) return <div style={{ textAlign: 'center', padding: '60px', color: '#E8572A' }}>Component not found</div>;

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#F5F0E8', marginBottom: '4px' }}>
            {component.name}
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(245,240,232,0.4)' }}>
            ID: {component.component_id} • Code: {component.code}
          </div>
        </div>
        {['admin', 'store_manager'].includes(user?.role) && (
          <>
            <button
              onClick={() => setEditing(!editing)}
              style={{
                background: '#1E90FF',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
            <button
              onClick={handleAddStock}
              style={{
                background: '#0D9E8A',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              + Add Stock
            </button>
            <button
              onClick={handleShip}
              style={{
                background: '#F0A500',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              📦 Ship
            </button>
          </>
        )}
      </div>

      {editing && (
        <div style={{
          background: '#1C1917',
          border: '0.5px solid rgba(30,144,255,0.2)',
          borderRadius: '14px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <form onSubmit={handleUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'Name', key: 'name' },
                { label: 'Code', key: 'code' },
                { label: 'Category', key: 'category' },
                { label: 'Storage Location', key: 'storage_location' },
                { label: 'Low Stock Threshold', key: 'low_stock_threshold', type: 'number' },
                { label: 'Unit', key: 'unit' },
              ].map((field) => (
                <div key={field.key}>
                  <label style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)', display: 'block', marginBottom: '5px' }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type || 'text'}
                    value={form[field.key] || ''}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
            <button type="submit" style={{
              background: '#1E90FF',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
            }}>
              Save Changes
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: '#1C1917', border: '0.5px solid rgba(30,144,255,0.1)', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(245,240,232,0.4)', marginBottom: '8px' }}>Total Stock</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#1E90FF' }}>{component.total_stock}</div>
        </div>
        <div style={{ background: '#1C1917', border: '0.5px solid rgba(30,144,255,0.1)', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(245,240,232,0.4)', marginBottom: '8px' }}>Remaining Stock</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: component.remaining_stock > 0 ? '#0D9E8A' : '#E8572A' }}>{component.remaining_stock}</div>
        </div>
        <div style={{ background: '#1C1917', border: '0.5px solid rgba(30,144,255,0.1)', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(245,240,232,0.4)', marginBottom: '8px' }}>Used</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#F0A500' }}>{component.used_quantity}</div>
        </div>
        <div style={{ background: '#1C1917', border: '0.5px solid rgba(30,144,255,0.1)', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(245,240,232,0.4)', marginBottom: '8px' }}>Shipped</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#6C5CE7' }}>{component.shipped_quantity}</div>
        </div>
      </div>

      <div style={{ background: '#1C1917', border: '0.5px solid rgba(30,144,255,0.1)', borderRadius: '14px', padding: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#F5F0E8', marginBottom: '12px' }}>Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px', color: 'rgba(245,240,232,0.6)' }}>
          <div><span style={{ fontWeight: 600 }}>Category:</span> {component.category}</div>
          <div><span style={{ fontWeight: 600 }}>Location:</span> {component.storage_location}</div>
          <div><span style={{ fontWeight: 600 }}>Unit:</span> {component.unit}</div>
          <div><span style={{ fontWeight: 600 }}>Low Stock Threshold:</span> {component.low_stock_threshold}</div>
          <div><span style={{ fontWeight: 600 }}>Invoice:</span> {component.invoice_no || 'N/A'}</div>
          <div><span style={{ fontWeight: 600 }}>Vendor:</span> {component.vendor_name || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
}