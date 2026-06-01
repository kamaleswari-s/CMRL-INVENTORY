import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function GlobalSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`https://cmrl-inventory-production.up.railway.app/api/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setResults(data);
      setSearchParams({ q: searchQuery });
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (comp) => {
    if (comp.remaining_stock === 0) return { label: 'Out of stock', color: '#E8572A', bg: 'rgba(232,87,42,0.1)' };
    if (comp.remaining_stock <= comp.low_stock_threshold) return { label: 'Low stock', color: '#F0A500', bg: 'rgba(240,165,0,0.1)' };
    return { label: 'In stock', color: '#0D9E8A', bg: 'rgba(13,158,138,0.1)' };
  };

  return (
    <div>
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
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
            padding: '12px 14px',
            fontSize: '13px',
            color: '#F5F0E8',
            outline: 'none',
            marginBottom: '12px',
          }}
        />
        <button
          type="submit"
          style={{
            background: '#1E90FF',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 24px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </form>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '22px', fontWeight: 700, color: '#F5F0E8', marginBottom: '8px' }}>
          Global Search Results
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(245,240,232,0.4)' }}>
          {searchQuery && `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${searchQuery}"`}
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
            {searchQuery ? 'No components found' : 'Enter a search term'}
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
                    onClick={() => window.location.href = `/component/${comp.component_id}`}
                    style={{ 
                      borderBottom: '0.5px solid rgba(245,240,232,0.04)',
                      cursor: 'pointer',
                    }}
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