import React, { useState, useEffect } from 'react';
import { getUsers, updateUser, register } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'engineer',
  });

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      toast.success('User created successfully');
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: 'engineer' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleToggleActive = async (u) => {
    try {
      await updateUser(u.id, { name: u.name, role: u.role, is_active: !u.is_active });
      toast.success(`User ${u.is_active ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return { color: '#E8572A', bg: 'rgba(232,87,42,0.1)' };
      case 'store_manager': return { color: '#0D9E8A', bg: 'rgba(13,158,138,0.1)' };
      case 'engineer': return { color: '#6C5CE7', bg: 'rgba(108,92,231,0.1)' };
      case 'procurement': return { color: '#F0A500', bg: 'rgba(240,165,0,0.1)' };
      default: return { color: '#1E90FF', bg: 'rgba(30,144,255,0.1)' };
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

  if (user?.role !== 'admin') {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(245,240,232,0.4)' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</div>
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#F5F0E8' }}>Access denied</div>
        <div style={{ fontSize: '13px', marginTop: '6px' }}>Only admins can manage users</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#F5F0E8', marginBottom: '4px' }}>
            User management
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(245,240,232,0.4)' }}>
            {users.length} users registered
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: '#1E90FF', border: 'none',
            borderRadius: '10px', padding: '10px 20px',
            fontSize: '13px', fontWeight: 600,
            color: '#fff', cursor: 'pointer',
          }}
        >
          {showForm ? 'Cancel' : '+ Add User'}
        </button>
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
            Create new user
          </div>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'Full name', key: 'name', placeholder: 'e.g. Rajesh Kumar', type: 'text' },
                { label: 'Email', key: 'email', placeholder: 'e.g. rajesh@cmrl.in', type: 'email' },
                { label: 'Password', key: 'password', placeholder: 'Set a password', type: 'password' },
              ].map((field) => (
                <div key={field.key}>
                  <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)', marginBottom: '5px' }}>
                    {field.label}
                  </div>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
              ))}
              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)', marginBottom: '5px' }}>
                  Role
                </div>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  style={inputStyle}
                >
                  <option value="admin">Admin</option>
                  <option value="store_manager">Store Manager</option>
                  <option value="engineer">Engineer</option>
                  <option value="procurement">Procurement</option>
                </select>
              </div>
            </div>
            <button type="submit" style={{
              background: '#1E90FF', border: 'none',
              borderRadius: '8px', padding: '10px 24px',
              fontSize: '13px', fontWeight: 600,
              color: '#fff', cursor: 'pointer',
            }}>
              Create User
            </button>
          </form>
        </div>
      )}

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
                {['User', 'Email', 'Role', 'Status', 'Created', 'Actions'].map((h) => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left',
                    fontSize: '10px', fontWeight: 600,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: 'rgba(245,240,232,0.4)',
                    borderBottom: '0.5px solid rgba(30,144,255,0.08)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const roleStyle = getRoleColor(u.role);
                return (
                  <tr key={u.id} style={{ borderBottom: '0.5px solid rgba(245,240,232,0.04)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: '#1B2A4A', color: '#1E90FF',
                          fontSize: '13px', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#F5F0E8' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'rgba(245,240,232,0.6)' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        background: roleStyle.bg, color: roleStyle.color,
                        fontSize: '10px', fontWeight: 600,
                        padding: '3px 10px', borderRadius: '20px',
                        textTransform: 'capitalize',
                      }}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        background: u.is_active ? 'rgba(13,158,138,0.1)' : 'rgba(245,240,232,0.05)',
                        color: u.is_active ? '#0D9E8A' : 'rgba(245,240,232,0.3)',
                        fontSize: '10px', fontWeight: 600,
                        padding: '3px 10px', borderRadius: '20px',
                      }}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'rgba(245,240,232,0.4)' }}>
                      {new Date(u.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {u.id !== user.id && (
                        <button
                          onClick={() => handleToggleActive(u)}
                          style={{
                            background: u.is_active ? 'rgba(232,87,42,0.1)' : 'rgba(13,158,138,0.1)',
                            border: `0.5px solid ${u.is_active ? 'rgba(232,87,42,0.3)' : 'rgba(13,158,138,0.3)'}`,
                            borderRadius: '6px',
                            padding: '5px 12px',
                            fontSize: '11px', fontWeight: 600,
                            color: u.is_active ? '#E8572A' : '#0D9E8A',
                            cursor: 'pointer',
                          }}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
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