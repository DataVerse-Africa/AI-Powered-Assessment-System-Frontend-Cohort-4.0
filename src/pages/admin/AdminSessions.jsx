// src/pages/admin/AdminSessions.jsx
// GET /api/admin/sessions
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import api from '../../api/axios';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    api.get('/api/admin/sessions')
      .then(res => {
        const list = res.data.sessions || res.data;
        setSessions(Array.isArray(list) ? list : []);
      })
      .catch(() => setError('Failed to load sessions.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = [...sessions];
    if (statusFilter !== 'all') list = list.filter(s => s.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.patient_name?.toLowerCase().includes(q) ||
        s.clinician_name?.toLowerCase().includes(q) ||
        s.clinician_email?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [sessions, statusFilter, search]);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>All Sessions</h1>
        <p>Clinical sessions across all registered clinicians.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats */}
      <div className="grid-3 mb-4">
        {[
          { label: 'Total Sessions', value: sessions.length },
          { label: 'Open', value: sessions.filter(s => s.status === 'open').length },
          { label: 'Closed', value: sessions.filter(s => s.status === 'closed').length },
        ].map(({ label, value }) => (
          <div key={label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card mb-4" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" placeholder="Search by patient or clinician…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30 }} />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['all', 'open', 'closed'].map(s => (
              <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStatusFilter(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="card"><div className="empty-state"><h3>No sessions found</h3></div></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient</th>
                  <th>Clinician</th>
                  <th>Reason</th>
                  <th>Predictions</th>
                  <th>Status</th>
                  <th>Opened</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.session_id || s.id}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                      #{s.session_id || s.id}
                    </td>
                    <td style={{ fontWeight: 500 }}>{s.patient_name}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                      {s.clinician_name || s.clinician_email || '—'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.reason_for_visit}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{s.total_predictions ?? s.prediction_count ?? 0}</span>
                    </td>
                    <td><span className={`badge badge-${s.status}`}>{s.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{formatDate(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
