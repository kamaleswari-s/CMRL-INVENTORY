import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Trash() {
  const { user } = useAuth();
  const [trash, setTrash] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrash();
  }, []);

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/components/trash/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setTrash(data);
    } catch (err) {
      toast.error('Failed to load trash');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (componentId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/components/${componentId}/restore`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Component restored');
      fetchTrash();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getDaysInTrash = (deletedAt) => {
    const deleted = new Date(deletedAt);
    const now = new Date();
    const days = Math.floor((now - deleted) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getStatusBadge = (comp) => {
    if (comp.remaining_stock === 0) return { label: 'Out of stock', color: '#E8572A', bg: 'rgba(232,87,42,0.1)' };
    if (comp.remaining_stock <= comp.low_stock_threshold) return { label: 'Low stock', color: '#F0A500', bg: 'rgba(240,165,0,0.1)' };
    return { label: 'In stock', color: '#0D9E8A', bg: 'rgba(13,158,138,0.1)' };
  };

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(245,240,232,0.4)' }}>
        Only admins can access trash
      </div>
    );
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#1E90FF' }}>Loading trash...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '22px', fontWeight: 700, color: '#F5F0E8', marginBottom: '8px' }}>
          🗑 Recycle Bin
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(245,240,232,0.4)' }}>
          {trash.length} component{trash.length !== 1 ? 's' : ''} in trash. Items auto-delete after 30 days.
        </div>
      </div>

      {trash.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px',
          background: '#1C1917', borderRadius: '14px',
          border: '0.5px solid rgba(30,144,255,0.1)',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗑</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#F5F0E8', marginBottom: '6px' }}>
            Trash is empty
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(245,240,232,0.4)' }}>
            Deleted components appear here for 30 days
          </div>
        </div>
      ) : (
        <div style={{
          background: '#1C1917',
          border: '0.5px solid rgba(30,144,255,0.1)',
          borderRadius: '14px',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(30,144,255,0.05)' }}>
                {['ID', 'Name', 'Code', 'Category', 'Status', 'Days in Trash', 'Action'].map((h) => (
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
              {trash.map((comp) => {
                const status = getStatusBadge(comp);
                const daysInTrash = getDaysInTrash(comp.deleted_at);
                const daysLeft = 30 - daysInTrash;
                return (
                  <tr key={comp.id} style={{ borderBottom: '0.5px solid rgba(245,240,232,0.04)' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#1E90FF' }}>{comp.component_id}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 600, color: '#F5F0E8' }}>{comp.name}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'rgba(245,240,232,0.5)' }}>{comp.code}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: 'rgba(245,240,232,0.6)' }}>{comp.category}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: status.bg, color: status.color, fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px' }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: daysLeft <= 7 ? '#E8572A' : '#F0A500' }}>
                      {daysInTrash} days ago ({daysLeft} days left)
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <button
                        onClick={() => handleRestore(comp.component_id)}
                        style={{
                          background: 'rgba(13,158,138,0.1)',
                          border: '0.5px solid rgba(13,158,138,0.3)',
                          borderRadius: '6px',
                          padding: '5px 12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#0D9E8A',
                          cursor: 'pointer',
                        }}
                      >
                        Restore
                      </button>
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