import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Account created! Please login');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(245,240,232,0.05)',
    border: '0.5px solid rgba(30,144,255,0.2)',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#F5F0E8',
    outline: 'none',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#141210',
    }}>
      <div style={{
        background: '#1C1917',
        border: '0.5px solid rgba(30,144,255,0.15)',
        borderRadius: '14px',
        padding: '40px',
        maxWidth: '420px',
        width: '100%',
      }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#F5F0E8', marginBottom: '6px' }}>
            Create account
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(245,240,232,0.4)' }}>
            CMRL Inventory Management System
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(245,240,232,0.5)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Full name
            </label>
            <input
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(245,240,232,0.5)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(245,240,232,0.5)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(245,240,232,0.5)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              style={inputStyle}
            >
              <option value="staff">Staff</option>
              <option value="store_manager">Store Manager</option>
              <option value="procurement">Procurement</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              background: '#1E90FF',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
              marginBottom: '12px',
            }}
          >
            Create account
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(245,240,232,0.5)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1E90FF', textDecoration: 'none', fontWeight: 600 }}>
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}