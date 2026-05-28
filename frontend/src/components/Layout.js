import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const categories = [
  { name: 'Passive Components', key: 'passive', icon: '⚡' },
  { name: 'Active Components', key: 'active', icon: '💻' },
  { name: 'Control Components', key: 'control', icon: '🔌' },
  { name: 'Sensors', key: 'sensor', icon: '📡' },
  { name: 'Cables & Connectors', key: 'cable', icon: '🔗' },
  { name: 'Mechanical Parts', key: 'mechanical', icon: '⚙️' },
];

export default function Layout() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/globalsearch?q=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const isActive = (path) => location.pathname === path;
  const isCategoryActive = (key) => location.pathname === `/components/${key}`;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#141210' }}>
      <div style={{
        width: '240px',
        background: '#1C1917',
        borderRight: '0.5px solid rgba(30,144,255,0.15)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowY: 'auto',
      }}>
        <div style={{
          padding: '16px 14px',
          borderBottom: '0.5px solid rgba(30,144,255,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px',
              background: '#1B2A4A',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2A8 8 0 1 0 17 14" stroke="#1E90FF" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M10 5A5 5 0 1 0 15 13" stroke="#1E90FF" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="6" y="9" width="8" height="6" rx="1" fill="#1E90FF"/>
                <polygon points="10,5 6,9 14,9" fill="#1E90FF"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#F5F0E8' }}>CMRL Inventory</div>
              <div style={{ fontSize: '10px', color: 'rgba(245,240,232,0.4)' }}>Digital Store System</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '8px 6px' }}>
          <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9B9890', padding: '8px 8px 4px' }}>Overview</div>

          <div onClick={() => navigate('/')} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 10px',
            borderRadius: isActive('/') ? '0' : '8px',
            cursor: 'pointer', marginBottom: '2px',
            background: isActive('/') ? 'rgba(30,144,255,0.1)' : 'transparent',
            borderLeft: isActive('/') ? '2px solid #1E90FF' : '2px solid transparent',
            color: isActive('/') ? '#1E90FF' : 'rgba(245,240,232,0.6)',
            fontSize: '12px', fontWeight: 500,
            transition: 'all 0.15s',
          }}>
            <span style={{ fontSize: '14px' }}>📊</span> Dashboard
          </div>

          <div onClick={() => navigate('/globalsearch')} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 10px',
            borderRadius: isActive('/globalsearch') ? '0' : '8px',
            cursor: 'pointer', marginBottom: '2px',
            background: isActive('/globalsearch') ? 'rgba(30,144,255,0.1)' : 'transparent',
            borderLeft: isActive('/globalsearch') ? '2px solid #1E90FF' : '2px solid transparent',
            color: isActive('/globalsearch') ? '#1E90FF' : 'rgba(245,240,232,0.6)',
            fontSize: '12px', fontWeight: 500,
          }}>
            <span style={{ fontSize: '14px' }}>🔍</span> Global Search
          </div>

          <div onClick={() => navigate('/audit')} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 10px',
            borderRadius: isActive('/audit') ? '0' : '8px',
            cursor: 'pointer', marginBottom: '2px',
            background: isActive('/audit') ? 'rgba(30,144,255,0.1)' : 'transparent',
            borderLeft: isActive('/audit') ? '2px solid #1E90FF' : '2px solid transparent',
            color: isActive('/audit') ? '#1E90FF' : 'rgba(245,240,232,0.6)',
            fontSize: '12px', fontWeight: 500,
          }}>
            <span style={{ fontSize: '14px' }}>🕐</span> Audit Log
          </div>

          {user?.role === 'admin' && (
            <>
              <div onClick={() => navigate('/users')} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 10px',
                borderRadius: isActive('/users') ? '0' : '8px',
                cursor: 'pointer', marginBottom: '2px',
                background: isActive('/users') ? 'rgba(30,144,255,0.1)' : 'transparent',
                borderLeft: isActive('/users') ? '2px solid #1E90FF' : '2px solid transparent',
                color: isActive('/users') ? '#1E90FF' : 'rgba(245,240,232,0.6)',
                fontSize: '12px', fontWeight: 500,
              }}>
                <span style={{ fontSize: '14px' }}>👥</span> Users
              </div>

              <div onClick={() => navigate('/trash')} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 10px',
                borderRadius: isActive('/trash') ? '0' : '8px',
                cursor: 'pointer', marginBottom: '2px',
                background: isActive('/trash') ? 'rgba(30,144,255,0.1)' : 'transparent',
                borderLeft: isActive('/trash') ? '2px solid #1E90FF' : '2px solid transparent',
                color: isActive('/trash') ? '#1E90FF' : 'rgba(245,240,232,0.6)',
                fontSize: '12px', fontWeight: 500,
              }}>
                <span style={{ fontSize: '14px' }}>🗑</span> Trash
              </div>
            </>
          )}

          <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9B9890', padding: '12px 8px 4px' }}>Components</div>

          {categories.map((cat) => (
            <div key={cat.key} onClick={() => navigate(`/components/${cat.key}`)} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 10px',
              borderRadius: isCategoryActive(cat.key) ? '0' : '8px',
              cursor: 'pointer', marginBottom: '2px',
              background: isCategoryActive(cat.key) ? 'rgba(30,144,255,0.1)' : 'transparent',
              borderLeft: isCategoryActive(cat.key) ? '2px solid #1E90FF' : '2px solid transparent',
              color: isCategoryActive(cat.key) ? '#1E90FF' : 'rgba(245,240,232,0.6)',
              fontSize: '12px', fontWeight: 500,
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: '14px' }}>{cat.icon}</span> {cat.name}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', padding: '10px', borderTop: '0.5px solid rgba(30,144,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: '#1E90FF', color: '#fff',
              fontSize: '11px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#F5F0E8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: '10px', color: 'rgba(245,240,232,0.4)', textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</div>
            </div>
            <div onClick={logoutUser} style={{ fontSize: '16px', cursor: 'pointer', color: 'rgba(245,240,232,0.4)' }} title="Logout">🚪</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          height: '52px',
          background: '#1C1917',
          borderBottom: '0.5px solid rgba(30,144,255,0.1)',
          display: 'flex', alignItems: 'center',
          padding: '0 20px', gap: '12px', flexShrink: 0,
        }}>
          <div style={{ fontSize: '13px', color: 'rgba(245,240,232,0.4)', fontFamily: 'JetBrains Mono, monospace' }}>
            CMRL / Inventory
          </div>
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '400px', marginLeft: 'auto', position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components by name, ID, code, location..."
              style={{
                width: '100%',
                background: 'rgba(245,240,232,0.05)',
                border: '0.5px solid rgba(30,144,255,0.2)',
                borderRadius: '8px',
                padding: '7px 14px 7px 32px',
                fontSize: '12px',
                color: '#F5F0E8',
                outline: 'none',
              }}
            />
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🔍</span>
          </form>
          <div style={{
            fontSize: '10px', fontWeight: 600,
            padding: '3px 10px', borderRadius: '20px',
            background: 'rgba(30,144,255,0.1)',
            color: '#1E90FF',
            textTransform: 'capitalize',
          }}>
            {user?.role?.replace('_', ' ')}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}