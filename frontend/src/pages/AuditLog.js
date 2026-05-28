import React, { useState, useEffect } from 'react';
import { getAllTransactions } from '../utils/api';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function AuditLog() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchTransactions = async () => {
    try {
      const res = await getAllTransactions();
      setTransactions(res.data);
    } catch (err) {
      toast.error('Failed to load audit log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    socket.on('stockUpdate', fetchTransactions);
    return () => socket.off('stockUpdate');
  }, []);

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

  const filtered = transactions.filter((t) => {
    const matchesFilter = filter === 'all' || t.action_type === filter;
    const matchesSearch =
      search === '' ||
      t.component_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.component_id?.toLowerCase().includes(search.toLowerCase()) ||
      t.performed_by_name?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '22px', fontWeight: 700, color: '#F5F0E8', marginBottom: '4px' }}>
          Audit log
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(245,240,232,0.4)' }}>
          Every stock change ever made — who, what, when
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <input
            type="text"
            placeholder="Search by component, ID or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(245,240,232,0.05)',
              border: '0.5px solid rgba(30,144,255,0.2)',
              borderRadius: '8px',
              padding: '8px 12px 8px 32px',
              fontSize: '12px',
              color: '#F5F0E8',
              outline: 'none',
            }}
          />
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px' }}>🔍</span>
        </div>

        {['all', 'received', 'used', 'shipped', 'adjusted'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? '#1E90FF' : 'rgba(245,240,232,0.05)',
              border: '0.5px solid rgba(30,144,255,0.2)',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '11px',
              fontWeight: 600,
              color: filter === f ? '#fff' : 'rgba(245,240,232,0.5)',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {f}
          </button>
        ))}

        <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'rgba(245,240,232,0.4)' }}>
          {filtered.length} records
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#1E90FF' }}>Loading...</div>
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
                {['Component', 'Action', 'Change', 'Before', 'After', 'Performed by', 'Notes', 'Date and time'].map((h) => (
                  <th key={h} style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'rgba(245,240,232,0.4)',
                    borderBottom: '0.5px solid rgba(30,144,255,0.08)',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'rgba(245,240,232,0.3)', fontSize: '13px' }}>
                    No records found
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr
                    key={t.id}
                    style={{ borderBottom: '0.5px solid rgba(245,240,232,0.04)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30,144,255,0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#F5F0E8' }}>{t.component_name}</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#1E90FF' }}>{t.component_id}</div>
                    </td>
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
                    <td style={{ padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 700, color: t.action_type === 'received' ? '#0D9E8A' : '#E8572A' }}>
                      {t.action_type === 'received' ? '+' : '-'}{Math.abs(t.quantity_change)}
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'rgba(245,240,232,0.5)' }}>
                      {t.stock_before}
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 600, color: '#F5F0E8' }}>
                      {t.stock_after}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '50%',
                          background: '#1B2A4A', color: '#1E90FF',
                          fontSize: '10px', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {t.performed_by_name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '12px', color: '#F5F0E8' }}>{t.performed_by_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '11px', color: 'rgba(245,240,232,0.5)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.notes || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'rgba(245,240,232,0.4)', whiteSpace: 'nowrap' }}>
                      {formatDate(t.performed_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}