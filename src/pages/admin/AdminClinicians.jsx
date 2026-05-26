// src/pages/admin/AdminClinicians.jsx
// GET /api/admin/users
// PATCH /api/admin/users/{id}/suspend
// PATCH /api/admin/users/{id}/activate
import React, { useEffect, useState } from 'react';
import { Search, UserX, UserCheck, ChevronDown } from 'lucide-react';
import api from '../../api/axios';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminClinicians() {
  const [clinicians, setClinicians] = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [acting, setActing]         = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/users');
      const list = res.data.users || res.data;
      setClinicians(Array.isArray(list) ? list : []);
    } catch (e) {
      setError('Failed to load clinicians.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let list = [...clinicians];
    if (statusFilter === 'active')    list = list.filter(c => c.is_active);
    if (statusFilter === 'suspended') list = list.filter(c => !c.is_active);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.full_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [clinicians, statusFilter, search]);

  const handleSuspend = async (id) => {
    if (!window.confirm('Suspend this clinician? They will not be able to log in.')) return;
    setActing(id);
    try {
      await api.patch(`/api/admin/users/${id}/suspend`);
      load();
    } catch (e) {
      alert('Failed to suspend account.');
    } finally {
      setActing(null);
    }
  };

  const handleActivate = async (id) => {
    setActing(id);
    try {
      await api.patch(`/api/admin/users/${id}/activate`);
      load();
    } catch (e) {
      alert('Failed to activate account.');
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Clinician Management</h1>
        <p>View all registered clinical staff and manage their account status.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Summary */}
      <div className="grid-3 mb-4">
        {[
          { label: 'Total Clinicians', value: clinicians.length, color: 'blue' },
          { label: 'Active',           value: clinicians.filter(c => c.is_active).length, color: 'green' },
          { label: 'Suspended',        value: clinicians.filter(c => !c.is_active).length, color: 'red' },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card">
            <div className={`stat-card-icon ${color}`} />
            <div className="stat-card-body">
              <div className="stat-card-label">{label}</div>
              <div className="stat-card-value">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card mb-4" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 30 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['all', 'active', 'suspended'].map(s => (
              <button
                key={s}
                className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <h3>No clinicians found</h3>
            <p>Try adjusting your search or filter.</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Sessions</th>
                  <th>Predictions</th>
                  <th>Joined</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: 'var(--blue-100)', color: 'var(--primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                        }}>
                          {c.full_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        {c.full_name}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.email}</td>
                    <td>
                      <span className={`badge ${c.is_active ? 'badge-active' : 'badge-suspended'}`}>
                        {c.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td>{c.session_count ?? c.total_sessions ?? '—'}</td>
                    <td>{c.prediction_count ?? c.total_predictions ?? '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{formatDate(c.created_at)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{formatDate(c.last_login)}</td>
                    <td>
                      {c.is_active ? (
                        <button
                          className="btn btn-sm"
                          onClick={() => handleSuspend(c.id)}
                          disabled={acting === c.id}
                          style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          {acting === c.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <UserX size={13} />}
                          Suspend
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm"
                          onClick={() => handleActivate(c.id)}
                          disabled={acting === c.id}
                          style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          {acting === c.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <UserCheck size={13} />}
                          Activate
                        </button>
                      )}
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
