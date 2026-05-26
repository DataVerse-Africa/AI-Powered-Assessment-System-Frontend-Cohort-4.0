// src/pages/admin/AdminPredictions.jsx
// GET /api/admin/predictions
import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../../api/axios';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function riskBadge(level) {
  const map = { Low: 'badge-low', Moderate: 'badge-moderate', High: 'badge-high', Critical: 'badge-critical' };
  return <span className={`badge ${map[level] || ''}`}>{level || '—'}</span>;
}

function modelBadge(name) {
  const map = { diabetes: 'badge-diabetes', ckd: 'badge-ckd', pneumonia: 'badge-pneumonia', breast_cancer: 'badge-breast_cancer' };
  return <span className={`badge ${map[name] || ''}`}>{name?.replace('_', ' ') || '—'}</span>;
}

const MODELS = ['all', 'diabetes', 'ckd', 'pneumonia', 'breast_cancer'];
const RISKS  = ['all', 'Low', 'Moderate', 'High', 'Critical'];

export default function AdminPredictions() {
  const [predictions, setPredictions] = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [modelFilter, setModelFilter] = useState('all');
  const [riskFilter, setRiskFilter]   = useState('all');

  useEffect(() => {
    api.get('/api/admin/predictions')
      .then(res => {
        const list = res.data.predictions || res.data;
        setPredictions(Array.isArray(list) ? list : []);
      })
      .catch(() => setError('Failed to load predictions.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = [...predictions];
    if (modelFilter !== 'all') list = list.filter(p => p.modelname === modelFilter);
    if (riskFilter !== 'all')  list = list.filter(p => p.risk_level === riskFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.patient_name?.toLowerCase().includes(q) ||
        p.clinician_name?.toLowerCase().includes(q) ||
        p.prediction_label?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [predictions, modelFilter, riskFilter, search]);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>All Predictions</h1>
        <p>Complete prediction audit trail across all clinicians and sessions.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filters */}
      <div className="card mb-4" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" placeholder="Search by patient, clinician, or result…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30 }} />
          </div>
          <select className="form-select" value={modelFilter} onChange={e => setModelFilter(e.target.value)} style={{ width: 160 }}>
            {MODELS.map(m => <option key={m} value={m}>{m === 'all' ? 'All Models' : m.replace('_', ' ')}</option>)}
          </select>
          <select className="form-select" value={riskFilter} onChange={e => setRiskFilter(e.target.value)} style={{ width: 140 }}>
            {RISKS.map(r => <option key={r} value={r}>{r === 'all' ? 'All Risks' : r}</option>)}
          </select>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="card"><div className="empty-state"><h3>No predictions found</h3></div></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient</th>
                  <th>Clinician</th>
                  <th>Model</th>
                  <th>Result</th>
                  <th>Confidence</th>
                  <th>Risk</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.prediction_id || p.id}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                      #{p.prediction_id || p.id}
                    </td>
                    <td style={{ fontWeight: 500 }}>{p.patient_name || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                      {p.clinician_name || p.clinician_email || '—'}
                    </td>
                    <td>{modelBadge(p.modelname)}</td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{p.prediction_label || '—'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                      {p.probability != null ? `${(p.probability * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td>{riskBadge(p.risk_level)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{formatDate(p.created_at)}</td>
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
