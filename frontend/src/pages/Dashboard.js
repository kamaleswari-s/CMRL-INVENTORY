import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getAllTransactions } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_components: 0,
    low_stock: 0,
    out_of_stock: 0,
    shipped_today: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, transRes] = await Promise.all([
        getDashboardStats(),
        getAllTransactions(),
      ]);
      setStats(statsRes.data);
      setTransactions(transRes.data.slice(0, 10));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    socket.on('stockUpdate', () => {
      fetchData();
    });
    return () => socket.off('stockUpdate');
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
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

  const getActionBg = (action) => {
    switch (action) {
      case 'received': return 'rgba(13,158,138,0.1)';
      case 'used': return 'rgba(232,87,42,0.1)';
      case 'shipped': return 'rgba(108,92,231,0.1)';
      case 'adjusted': return 'rgba(240,165,0,0.1)';
      default: return 'rgba(30,144,255,0.1)';
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#1E90FF', fontSize: '16px' }}>
      Loading dashboard...
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '22px', fontWeight: 700, color: '#F5F0E8', marginBottom: '4px' }}>
          Good day, {user?.name}
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(245,240,232,0.4)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total components', value: stats.total_components, color: '#1E90FF', bg: 'rgba(30,144,255,0.1)' },
          { label: 'Low stock alerts', value: stats.low_stock, color: '#F0A500', bg: 'rgba(240,165,0,0.1)' },
          { label: 'Shipped today', value: stats.shipped_today, color: '#0D9E8A', bg: 'rgba(13,158,138,0.1)' },
          { label: 'Out of stock', value: stats.out_of_stock, color: '#E8572A', bg: 'rgba(232,87,42,0.1)' },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: '#1C1917',
            border: '0.5px solid rgba(30,144,255,0.1)',
            borderRadius: '14px',
            padding: '18px',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)', marginBottom: '10px' }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '32px', fontWeight: 700, color: stat.color, marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0D9E8A' }} />
              <span style={{ fontSize: '10px', color: 'rgba(13,158,138,0.8)' }}>Live</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#F5F0E8' }}>Live audit log</span>
          </div>
          {transactions.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(245,240,232,0.3)', fontSize: '13px' }}>
              No transactions yet
            </div>
          ) : (
            transactions.map((t) => (
              <div key={t.id} style={{
                display: 'flex', gap: '10px',
                padding: '10px 18px',
                borderBottom: '0.5px solid rgba(245,240,232,0.04)',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: '#1B2A4A', color: '#1E90FF',
                  fontSize: '11px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {t.performed_by_name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: 'rgba(245,240,232,0.8)', lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600, color: '#F5F0E8' }}>{t.performed_by_name}</span>
                    {' '}
                    <span style={{
                      background: getActionBg(t.action_type),
                      color: getActionColor(t.action_type),
                      fontSize: '10px', fontWeight: 600,
                      padding: '1px 6px', borderRadius: '4px',
                    }}>
                      {t.action_type}
                    </span>
                    {' '}
                    <span style={{ fontWeight: 600, color: '#1E90FF' }}>{t.component_name}</span>
                    {' — '}
                    {Math.abs(t.quantity_change)} units
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'rgba(245,240,232,0.3)', marginTop: '2px' }}>
                    {formatDate(t.performed_at)}
                  </div>
                </div>
              </div>
            ))
          )}
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
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#F5F0E8' }}>Quick navigation</span>
          </div>
          <div style={{ padding: '14px' }}>
            {[
              { label: 'Passive Components', key: 'passive', desc: 'Resistors, capacitors, inductors' },
              { label: 'Active Components', key: 'active', desc: 'Microcontrollers, ICs, processors' },
              { label: 'Control Components', key: 'control', desc: 'Switches, relays, breakers' },
              { label: 'Sensors', key: 'sensor', desc: 'Transducers, detectors' },
              { label: 'Cables & Connectors', key: 'cable', desc: 'Wires, terminals, plugs' },
              { label: 'Mechanical Parts', key: 'mechanical', desc: 'Bolts, brackets, panels' },
            ].map((cat) => (
              <div
                key={cat.key}
                onClick={() => navigate(`/components/${cat.key}`)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                  marginBottom: '4px',
                  border: '0.5px solid rgba(30,144,255,0.08)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30,144,255,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#F5F0E8' }}>{cat.label}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(245,240,232,0.4)' }}>{cat.desc}</div>
                </div>
                <div style={{ color: '#1E90FF', fontSize: '16px' }}>→</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}