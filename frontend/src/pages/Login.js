import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../utils/api';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await login({ email, password });
      loginUser(res.data.user, res.data.token);
      toast.success(`Welcome, ${res.data.user.name}`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#141210',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(30,144,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(30,144,255,0.06) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div style={{
        display: 'flex',
        width: '820px',
        background: 'rgba(20,18,16,0.95)',
        border: '0.5px solid rgba(30,144,255,0.2)',
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{
          width: '360px',
          background: '#1C1917',
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: '0.5px solid rgba(30,144,255,0.15)',
        }}>
          <svg width="130" height="130" viewBox="0 0 130 130" style={{ marginBottom: '20px' }}>
            <circle cx="65" cy="65" r="55" fill="none" stroke="#1E90FF" strokeWidth="6" strokeDasharray="300 50" strokeLinecap="round"/>
            <circle cx="65" cy="65" r="38" fill="none" stroke="#1E90FF" strokeWidth="3.5" strokeDasharray="200 40" strokeLinecap="round"/>
            <rect x="40" y="58" width="50" height="32" rx="2" fill="#1E90FF"/>
            <polygon points="65,42 41,60 89,60" fill="#1E90FF"/>
            <rect x="55" y="68" width="8" height="22" rx="1" fill="#141210"/>
            <rect x="67" y="68" width="8" height="22" rx="1" fill="#141210"/>
            <rect x="43" y="63" width="11" height="8" rx="1" fill="rgba(20,18,16,0.6)"/>
            <rect x="76" y="63" width="11" height="8" rx="1" fill="rgba(20,18,16,0.6)"/>
          </svg>

          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(30,144,255,0.6)', marginBottom: '8px' }}>
            Chennai Metro Rail Limited
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#F5F0E8', textAlign: 'center', marginBottom: '6px', lineHeight: 1.2 }}>
            Digital Inventory<br />System
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(245,240,232,0.4)', textAlign: 'center', marginBottom: '28px' }}>
            Store management platform
          </div>

          <div style={{ width: '48px', height: '1px', background: 'rgba(30,144,255,0.3)', marginBottom: '24px' }} />

          <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
            {[
              { num: 'Live', label: 'Real-time sync' },
              { num: 'Safe', label: 'Role-based access' },
              { num: 'SQL', label: 'Audit trail' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '20px', fontWeight: 600, color: '#1E90FF' }}>{s.num}</div>
                <div style={{ fontSize: '10px', color: 'rgba(245,240,232,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0D9E8A' }} />
            <div style={{ fontSize: '11px', color: 'rgba(13,158,138,0.8)', fontFamily: 'JetBrains Mono, monospace' }}>System online</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(30,144,255,0.6)', marginBottom: '10px' }}>
            Secure access
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#F5F0E8', marginBottom: '4px' }}>
            Sign in to CMRL
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(245,240,232,0.4)', marginBottom: '32px' }}>
            Enter your credentials to access the inventory system
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.45)', marginBottom: '6px' }}>
                Email
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cmrl.in"
                style={{
                  width: '100%',
                  background: 'rgba(245,240,232,0.05)',
                  border: '0.5px solid rgba(30,144,255,0.2)',
                  borderRadius: '10px',
                  padding: '11px 14px',
                  fontSize: '13px',
                  color: '#F5F0E8',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.45)', marginBottom: '6px' }}>
                Password
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  background: 'rgba(245,240,232,0.05)',
                  border: '0.5px solid rgba(30,144,255,0.2)',
                  borderRadius: '10px',
                  padding: '11px 14px',
                  fontSize: '13px',
                  color: '#F5F0E8',
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'rgba(30,144,255,0.5)' : '#1E90FF',
                border: 'none',
                borderRadius: '10px',
                padding: '13px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s',
                marginBottom: '16px',
              }}
            >
              {loading ? 'Signing in...' : 'Sign in to inventory system'}
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', color: 'rgba(245,240,232,0.25)' }}>
              Forgot password? Contact IT support
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'rgba(30,144,255,0.4)' }}>
              v1.0.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}