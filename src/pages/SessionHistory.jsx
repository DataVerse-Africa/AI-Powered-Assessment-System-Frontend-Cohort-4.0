// src/pages/SessionHistory.jsx
// GET /api/sessions/mine
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Plus, Search, ChevronRight, Trash2, XCircle } from 'lucide-react';
import api from '../api/axios';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function SessionHistory() {
  const [sessions, setSessions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch]     = useState('');
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/sessions/mine');
      const list = res.data.sessions || res.data;
      setSessions(Array.isArray(list) ? list : []);
    } catch (e) {
      setError('Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let list = [...sessions];
    if (statusFilter !== 'all') list = list.filter(s => s.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.patient_name?.toLowerCase().includes(q) ||
        s.reason_for_visit?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [sessions, statusFilter, search]);

  const handleClose = async (id) => {
    try {
      await api.patch(`/api/sessions/${id}/close`, {});
      load();
    } catch (e) {
      alert('Failed to close session.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session and all its predictions? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/api/sessions/${id}`);
      load();
    } catch (e) {
      alert('Failed to delete session.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Session History</h1>
          <p>All patient sessions you have opened.</p>
        </div>
        <Link to="/sessions/new" className="btn btn-primary">
          <Plus size={15} /> New Session
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="card mb-4" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              className="form-input"
              placeholder="Search by patient name or reason…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 30 }}
            />
          </div>
          {/* Status filter */}
          <div className="tabs" style={{ margin: 0, borderBottom: 'none', gap: 4 }}>
            {['all', 'open', 'closed'].map(s => (
              <button
                key={s}
                className={`tab-btn ${statusFilter === s ? 'active' : ''}`}
                onClick={() => setStatusFilter(s)}
                style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', borderBottom: 'none' }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Clock size={40} className="empty-state-icon" />
            <h3>No sessions found</h3>
            <p>{sessions.length === 0 ? 'Open your first session to get started.' : 'Try changing your filters.'}</p>
            {sessions.length === 0 && (
              <Link to="/sessions/new" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                <Plus size={14} /> New Session
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ borderRadius: 'var(--radius-lg)', border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Age / Gender</th>
                  <th>Reason</th>
                  <th>Predictions</th>
                  <th>Status</th>
                  <th>Opened</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.session_id}>
                    <td style={{ fontWeight: 500 }}>{s.patient_name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {s.patient_age} · {s.patient_gender}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.reason_for_visit}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{s.total_predictions}</span>
                    </td>
                    <td><span className={`badge badge-${s.status}`}>{s.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{formatDate(s.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link
                          to={`/sessions/${s.session_id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          View <ChevronRight size={13} />
                        </Link>
                        {s.status === 'open' && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleClose(s.session_id)}
                            title="Close session"
                            style={{ color: 'var(--warning)' }}
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDelete(s.session_id)}
                          disabled={deleting === s.session_id}
                          title="Delete session"
                          style={{ color: 'var(--danger)' }}
                        >
                          {deleting === s.session_id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
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
