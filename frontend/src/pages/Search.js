import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const q = searchParams.get('q') || '';

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://cmrl-inventory-production.up.railway.app/api/search?q=${q}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      toast.error('Failed to search');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    fetchResults();
  }, [q, fetchResults]);

  const getStatusBadge = (comp) => {
    if (comp.remaining_stock === 0) return { label: 'Out of stock', color: '#E8572A', bg: 'rgba(232,87,42,0.1)' };
    if (comp.remaining_stock <= comp.low_stock_threshold) return { label: 'Low stock', color: '#F0A500', bg: 'rgba(240,165,0,0.1)' };
    return { label: 'In stock', color: '#0D9E8A', bg: 'rgba(13,158,138,0.1)' };
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '22px', fontWeight: 700, color: '#F5F0E8', marginBottom: '8px' }}>
          Search Results
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(245,240,232,0.4)' }}>
          {q && `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${q}"`}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#1E90FF' }}>Searching...</div>
      ) : results.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px',
          background: '#1C1917', borderRadius: '14px',
          border: '0.5px solid rgba(30,144,255,0.1)',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#F5F0E8', marginBottom: '6px' }}>
            {q ? 'No components found' : 'Enter a search term'}
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(245,240,232,0.4)' }}>
            Try searching by component ID, name, code, or location
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
                {['ID', 'Name', 'Code', 'Category', 'Remaining', 'Location', 'Status'].map((h) => (
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
              {results.map((comp) => {
                const status = getStatusBadge(comp);
                return (
                  <tr
                    key={comp.id}
                    onClick={() => navigate(`/component/${comp.component_id}`)}
                    style={{ cursor: 'pointer', borderBottom: '0.5px solid rgba(245,240,232,0.04)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30,144,255,0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#1E90FF' }}>{comp.component_id}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 600, color: '#F5F0E8' }}>{comp.name}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'rgba(245,240,232,0.5)' }}>{comp.code}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: 'rgba(245,240,232,0.6)' }}>{comp.category}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 600, color: status.color }}>{comp.remaining_stock}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'rgba(245,240,232,0.5)' }}>{comp.storage_location}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: status.bg, color: status.color, fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px' }}>
                        {status.label}
                      </span>
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

