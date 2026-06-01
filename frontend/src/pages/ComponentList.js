import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComponentsByCategory, createComponent } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const socket = io('https://cmrl-inventory-production.up.railway.app');

const categoryLabels = {
  passive: 'Passive Components',
  active: 'Active Components',
  control: 'Control Components',
  sensor: 'Sensors & Transducers',
  cable: 'Cables & Connectors',
  mechanical: 'Mechanical Parts',
};

export default function ComponentList() {
  const { category } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    component_id: '',
    name: '',
    code: '',
    category: category,
    total_stock: '',
    storage_location: '',
    low_stock_threshold: 20,
    unit: 'pcs',
    notes: '',
    invoice_no: '',
    vendor_name: '',
  });

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const res = await getComponentsByCategory(category);
      setComponents(res.data);
    } catch (err) {
      toast.error('Failed to load components');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
    socket.on('stockUpdate', fetchComponents);
    return () => socket.off('stockUpdate');
  }, [category, fetchComponents]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, category }));
  }, [category]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createComponent(form);
      toast.success('Component added successfully');
      setShowForm(false);
      setForm({
        component_id: '',
        name: '',
        code: '',
        category,
        total_stock: '',
        storage_location: '',
        low_stock_threshold: 20,
        unit: 'pcs',
        notes: '',
        invoice_no: '',
        vendor_name: '',
      });
      fetchComponents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add component');
    }
  };

  const handleDeleteComponent = async (componentId) => {
    if (!window.confirm('Are you sure you want to delete this component?')) return;
    try {
      const response = await fetch(`https://cmrl-inventory-production.up.railway.app/api/components/${componentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to delete');
      toast.success('Component deleted');
      fetchComponents();
    } catch (err) {
      toast.error('Failed to delete component');
    }
  };

  const getStatusBadge = (comp) => {
    if (comp.remaining_stock === 0) return { label: 'Out of stock', color: '#E8572A', bg: 'rgba(232,87,42,0.1)' };
    if (comp.remaining_stock <= comp.low_stock_threshold) return { label: 'Low stock', color: '#F0A500', bg: 'rgba(240,165,0,0.1)' };
    return { label: 'In stock', color: '#0D9E8A', bg: 'rgba(13,158,138,0.1)' };
  };

  const searchParams = new URLSearchParams(window.location.search);
  const searchQuery = (searchParams.get('q') || '').toLowerCase();

  const filtered = components.filter((c) => {
    const matchesSearch = !searchQuery || 
      c.component_id.toLowerCase().includes(searchQuery) ||
      c.name.toLowerCase().includes(searchQuery) ||
      c.code.toLowerCase().includes(searchQuery) ||
      c.storage_location.toLowerCase().includes(searchQuery);
    
    const matchesFilter = filter === 'all' || 
      (filter === 'in_stock' && c.remaining_stock > c.low_stock_threshold) ||
      (filter === 'low_stock' && c.remaining_stock > 0 && c.remaining_stock <= c.low_stock_threshold) ||
      (filter === 'out_of_stock' && c.remaining_stock === 0);
    
    return matchesSearch && matchesFilter;
  });

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

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#F5F0E8', marginBottom: '4px' }}>
            {categoryLabels[category] || category}
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(245,240,232,0.4)' }}>
            {filtered.length} components {searchQuery && `matching "${searchQuery}"`}
          </div>
        </div>
        {['admin', 'store_manager'].includes(user?.role) && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: '#1E90FF',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            {showForm ? 'Cancel' : '+ Add Component'}
          </button>
        )}
      </div>

      {showForm && (
        <div style={{
          background: '#1C1917',
          border: '0.5px solid rgba(30,144,255,0.2)',
          borderRadius: '14px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#F5F0E8', marginBottom: '16px' }}>
            Add new component
          </div>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              {[
                { label: 'Component ID', key: 'component_id', placeholder: 'e.g. RES-001' },
                { label: 'Name', key: 'name', placeholder: 'e.g. 10K Ohm Resistor' },
                { label: 'Code', key: 'code', placeholder: 'e.g. CF-10K-25' },
                { label: 'Storage Location', key: 'storage_location', placeholder: 'e.g. Shelf A-12' },
                { label: 'Total Stock', key: 'total_stock', placeholder: 'e.g. 500', type: 'number' },
                { label: 'Low Stock Threshold', key: 'low_stock_threshold', placeholder: 'e.g. 20', type: 'number' },
                { label: 'Unit', key: 'unit', placeholder: 'e.g. pcs' },
                { label: 'Invoice No', key: 'invoice_no', placeholder: 'e.g. INV-2024-001' },
                { label: 'Vendor Name', key: 'vendor_name', placeholder: 'e.g. Electronics Vendor Ltd' },
              ].map((field) => (
                <div key={field.key}>
                  <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)', marginBottom: '5px' }}>
                    {field.label}
                  </div>
                  <input
                    type={field.type || 'text'}
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    style={inputStyle}
                    required={['component_id', 'name', 'total_stock'].includes(field.key)}
                  />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)', marginBottom: '5px' }}>
                Notes
              </div>
              <textarea
                placeholder="Any additional notes..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                style={{ ...inputStyle, height: '70px', resize: 'vertical' }}
              />
            </div>
            <button type="submit" style={{
              background: '#1E90FF', border: 'none', borderRadius: '8px',
              padding: '10px 24px', fontSize: '13px', fontWeight: 600,
              color: '#fff', cursor: 'pointer',
            }}>
              Save Component
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'in_stock', label: 'In stock' },
          { key: 'low_stock', label: 'Low stock' },
          { key: 'out_of_stock', label: 'Out of stock' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              background: filter === f.key ? '#1E90FF' : 'rgba(245,240,232,0.05)',
              border: '0.5px solid rgba(30,144,255,0.2)',
              borderRadius: '6px',
              padding: '5px 14px',
              fontSize: '11px',
              fontWeight: 600,
              color: filter === f.key ? '#fff' : 'rgba(245,240,232,0.5)',
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#1E90FF' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px',
          background: '#1C1917', borderRadius: '14px',
          border: '0.5px solid rgba(30,144,255,0.1)',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📦</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#F5F0E8', marginBottom: '6px' }}>No components found</div>
          <div style={{ fontSize: '13px', color: 'rgba(245,240,232,0.4)' }}>
            {['admin', 'store_manager'].includes(user?.role) ? 'Click "+ Add Component" to get started' : 'No components in this category yet'}
          </div>
        </div>
      ) : (
        <div style={{
          background: '#1C1917',
          border: '0.5px solid rgba(30,144,255,0.1)',
          borderRadius: '14px',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: 'rgba(30,144,255,0.05)' }}>
                {['ID', 'Name', 'Code', 'Total', 'Remaining', 'Used', 'Shipped', 'Invoice No', 'Vendor Name', 'Location', 'Status', 'Action'].map((h) => (
                  <th key={h} style={{
                    padding: '10px 12px', textAlign: 'left',
                    fontSize: '10px', fontWeight: 600,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: 'rgba(245,240,232,0.4)',
                    borderBottom: '0.5px solid rgba(30,144,255,0.08)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((comp) => {
                const status = getStatusBadge(comp);
                const pct = comp.total_stock > 0 ? Math.round((comp.remaining_stock / comp.total_stock) * 100) : 0;
                return (
                  <tr
                    key={comp.id}
                    style={{ borderBottom: '0.5px solid rgba(245,240,232,0.04)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30,144,255,0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#1E90FF', cursor: 'pointer' }} onClick={() => navigate(`/component/${comp.component_id}`)}>{comp.component_id}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 600, color: '#F5F0E8', cursor: 'pointer' }} onClick={() => navigate(`/component/${comp.component_id}`)}>{comp.name}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'rgba(245,240,232,0.5)' }}>{comp.code}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: '#F5F0E8' }}>{comp.total_stock}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: status.color }}>{comp.remaining_stock}</span>
                        <div style={{ flex: 1, height: '4px', background: 'rgba(245,240,232,0.1)', borderRadius: '2px', minWidth: '40px' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: status.color, borderRadius: '2px' }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: 'rgba(245,240,232,0.6)' }}>{comp.used_quantity}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: 'rgba(245,240,232,0.6)' }}>{comp.shipped_quantity}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'rgba(245,240,232,0.5)' }}>{comp.invoice_no || 'N/A'}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: 'rgba(245,240,232,0.6)' }}>{comp.vendor_name || 'N/A'}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'rgba(245,240,232,0.5)' }}>{comp.storage_location}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: status.bg, color: status.color, fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px' }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteComponent(comp.component_id)}
                          style={{
                            background: 'rgba(232,87,42,0.1)',
                            border: '0.5px solid rgba(232,87,42,0.3)',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '10px',
                            fontWeight: 600,
                            color: '#E8572A',
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}