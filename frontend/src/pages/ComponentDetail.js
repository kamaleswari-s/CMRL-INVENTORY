import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getComponent,
  getComponentTransactions,
  createTransaction,
} from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function ComponentDetail() {
  const { component_id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [component, setComponent] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    action_type: 'received',
    quantity: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      const [compRes, transRes] = await Promise.all([
        getComponent(component_id),
        getComponentTransactions(component_id),
      ]);
      setComponent(compRes.data);
      setTransactions(transRes.data);
    } catch (err) {
      toast.error('Component not found');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    socket.on('stockUpdate', fetchData);
    return () => socket.off('stockUpdate');
  }, [component_id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!updateForm.quantity || updateForm.quantity <= 0) {
      toast.error('Enter a valid quantity');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          component_id: component_id,
          action_type: updateForm.action_type,
          quantity: parseInt(updateForm.quantity),
          notes: updateForm.notes,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      socket.emit('stockUpdate', { component_id: component_id });
      toast.success('Stock updated successfully');
      setShowUpdate(false);
      setUpdateForm({ action_type: 'received', quantity: '', notes: '' });
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to update stock');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${component.name}?`)) return;
    try {
      const response = await fetch(`http://localhost:5000/api/components/${component_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.message || 'Failed to delete component');
        console.error('Delete error:', data);
        return;
      }
      
      toast.success('Component deleted successfully');
      setTimeout(() => navigate(-1), 1000);
    } catch (err) {
      console.error('Delete request error:', err);
      toast.error('Failed to delete component: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'received': return '#0D9E8A';
      case 'used': return '#E8572A';
      case 'shipped': return '#6C5CE7';
      case 'adjusted': return '#F0A500';
      default: return '#1E90FF';
    }
  };

  const getStatusBadge = () => {
    if (!component) return {};
    if (component.remaining_stock === 0) return { label: 'Out of stock', color: '#E8572A', bg: 'rgba(232,87,42,0.1)' };
    if (component.remaining_stock <= component.low_stock_threshold) return { label: 'Low stock', color: '#F0A500', bg: 'rgba(240,165,0,0.1)' };
    return { label: 'In stock', color: '#0D9E8A', bg: 'rgba(13,158,138,0.1)' };
  };

  const inputStyle = {
    width: '100%',
    background: '#1C1917',
    border: '0.5px solid rgba(30,144,255,0.2)',
    borderRadius: '8px',
    padding: '9px 12px',
    fontSize: '12px',
    color: '#F5F0E8',
    outline: 'none',
    colorScheme: 'dark',
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#1E90FF' }}>
      Loading...
    </div>
  );

  if (!component) return null;

  const status = getStatusBadge();
  const pct = component.total_stock > 0
    ? Math.round((component.remaining_stock / component.total_stock) * 100)
    : 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(245,240,232,0.05)',
            border: '0.5px solid rgba(30,144,255,0.2)',
            borderRadius: '8px',
            padding: '7px 14px',
            fontSize: '12px',
            color: 'rgba(245,240,232,0.6)',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#F5F0E8' }}>{component.name}</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#1E90FF' }}>{component.component_id}</div>
        </div>
        <span style={{
          background: status.bg, color: status.color,
          fontSize: '11px', fontWeight: 600,
          padding: '4px 12px', borderRadius: '20px',
        }}>
          {status.label}
        </span>
        {['admin', 'store_manager', 'procurement'].includes(user?.role) && (
          <button
            onClick={() => setShowUpdate(!showUpdate)}
            style={{
              background: '#1E90FF', border: 'none',
              borderRadius: '8px', padding: '8px 18px',
              fontSize: '12px', fontWeight: 600,
              color: '#fff', cursor: 'pointer',
            }}
          >
            {showUpdate ? 'Cancel' : 'Update Stock'}
          </button>
        )}
        {user?.role === 'admin' && (
          <button
            onClick={handleDelete}
            style={{
              background: 'rgba(232,87,42,0.1)',
              border: '0.5px solid rgba(232,87,42,0.3)',
              borderRadius: '8px', padding: '8px 18px',
              fontSize: '12px', fontWeight: 600,
              color: '#E8572A', cursor: 'pointer',
            }}
          >
            Delete
          </button>
        )}
      </div>

      {showUpdate && (
        <div style={{
          background: '#1C1917',
          border: '0.5px solid rgba(30,144,255,0.2)',
          borderRadius: '14px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#F5F0E8', marginBottom: '16px' }}>
            Update stock — {component.name}
          </div>
          <form onSubmit={handleUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)', marginBottom: '5px' }}>
                  Action
                </div>
                <select
                  value={updateForm.action_type}
                  onChange={(e) => setUpdateForm({ ...updateForm, action_type: e.target.value })}
                  style={inputStyle}
                >
                  <option value="received">Received (add stock)</option>
                  <option value="used">Used (consume stock)</option>
                  <option value="shipped">Shipped (dispatch)</option>
                  <option value="adjusted">Adjusted (set exact value)</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)', marginBottom: '5px' }}>
                  Quantity
                </div>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={updateForm.quantity}
                  onChange={(e) => setUpdateForm({ ...updateForm, quantity: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)', marginBottom: '5px' }}>
                  Notes
                </div>
                <input
                  type="text"
                  placeholder="Reason or reference..."
                  value={updateForm.notes}
                  onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>
            <button type="submit" style={{
              background: '#1E90FF', border: 'none',
              borderRadius: '8px', padding: '10px 24px',
              fontSize: '13px', fontWeight: 600,
              color: '#fff', cursor: 'pointer',
            }}>
              Confirm Update
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div style={{
          background: '#1C1917',
          border: '0.5px solid rgba(30,144,255,0.1)',
          borderRadius: '14px',
          padding: '20px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#F5F0E8', marginBottom: '16px' }}>
            Component details
          </div>
          {[
            { label: 'Component ID', value: component.component_id, mono: true },
            { label: 'Code', value: component.code || 'N/A', mono: true },
            { label: 'Category', value: component.category },
            { label: 'Storage location', value: component.storage_location || 'N/A', mono: true },
            { label: 'Unit', value: component.unit },
            { label: 'Supplier', value: component.supplier || 'N/A' },
            { label: 'Low stock threshold', value: component.low_stock_threshold },
            { label: 'Created', value: formatDate(component.created_at) },
            { label: 'Last updated', value: formatDate(component.updated_at) },
          ].map((row) => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '0.5px solid rgba(245,240,232,0.04)',
            }}>
              <span style={{ fontSize: '12px', color: 'rgba(245,240,232,0.4)' }}>{row.label}</span>
              <span style={{
                fontSize: '12px',
                fontFamily: row.mono ? 'JetBrains Mono, monospace' : 'Inter, sans-serif',
                color: '#F5F0E8',
                fontWeight: 500,
              }}>
                {row.value}
              </span>
            </div>
          ))}
          {component.notes && (
            <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(245,240,232,0.03)', borderRadius: '8px' }}>
              <div style={{ fontSize: '10px', color: 'rgba(245,240,232,0.4)', marginBottom: '4px' }}>Notes</div>
              <div style={{ fontSize: '12px', color: 'rgba(245,240,232,0.7)' }}>{component.notes}</div>
            </div>
          )}
        </div>

        <div style={{
          background: '#1C1917',
          border: '0.5px solid rgba(30,144,255,0.1)',
          borderRadius: '14px',
          padding: '20px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#F5F0E8', marginBottom: '16px' }}>
            Stock summary
          </div>
          {[
            { label: 'Total stock received', value: component.total_stock, color: '#1E90FF' },
            { label: 'Remaining stock', value: component.remaining_stock, color: status.color },
            { label: 'Used quantity', value: component.used_quantity, color: '#E8572A' },
            { label: 'Shipped quantity', value: component.shipped_quantity, color: '#6C5CE7' },
          ].map((row) => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '0.5px solid rgba(245,240,232,0.04)',
            }}>
              <span style={{ fontSize: '12px', color: 'rgba(245,240,232,0.4)' }}>{row.label}</span>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '18px', fontWeight: 700,
                color: row.color,
              }}>
                {row.value}
              </span>
            </div>
          ))}
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(245,240,232,0.4)' }}>Stock level</span>
              <span style={{ fontSize: '11px', color: status.color, fontWeight: 600 }}>{pct}%</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(245,240,232,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`,
                height: '100%',
                background: status.color,
                borderRadius: '4px',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{
        background: '#1C1917',
        border: '0.5px solid rgba(30,144,255,0.1)',
        borderRadius: '14px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 18px',
          borderBottom: '0.5px solid rgba(30,144,255,0.08)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0D9E8A' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#F5F0E8' }}>
            Full transaction history — {transactions.length} records
          </span>
        </div>
        {transactions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(245,240,232,0.3)', fontSize: '13px' }}>
            No transactions yet for this component
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(30,144,255,0.05)' }}>
                {['Action', 'Quantity', 'Stock before', 'Stock after', 'Performed by', 'Notes', 'Date and time'].map((h) => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
                    fontSize: '10px', fontWeight: 600,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: 'rgba(245,240,232,0.4)',
                    borderBottom: '0.5px solid rgba(30,144,255,0.08)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} style={{ borderBottom: '0.5px solid rgba(245,240,232,0.04)' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      background: `${getActionColor(t.action_type)}18`,
                      color: getActionColor(t.action_type),
                      fontSize: '10px', fontWeight: 600,
                      padding: '2px 8px', borderRadius: '4px',
                      textTransform: 'capitalize',
                    }}>
                      {t.action_type}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 600, color: t.action_type === 'received' ? '#0D9E8A' : '#E8572A' }}>
                    {t.action_type === 'received' ? '+' : '-'}{Math.abs(t.quantity_change)}
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'rgba(245,240,232,0.5)' }}>
                    {t.stock_before}
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 600, color: '#F5F0E8' }}>
                    {t.stock_after}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '12px', color: '#F5F0E8' }}>
                    {t.performed_by_name}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '11px', color: 'rgba(245,240,232,0.5)' }}>
                    {t.notes || '—'}
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'rgba(245,240,232,0.4)' }}>
                    {formatDate(t.performed_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}