// src/pages/Dashboard.jsx
// Calls: GET /api/user/sessions  +  GET /api/user/predictions
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderOpen, Activity, AlertTriangle, CheckCircle,
  Clock, Plus, ChevronRight, TrendingUp
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function riskColor(level) {
  return { Low: 'var(--risk-low)', Moderate: 'var(--risk-moderate)', High: 'var(--risk-high)', Critical: 'var(--risk-critical)' }[level] || 'var(--text-muted)';
}

function riskBadge(level) {
  const cls = { Low: 'badge-low', Moderate: 'badge-moderate', High: 'badge-high', Critical: 'badge-critical' }[level] || '';
  return <span className={`badge ${cls}`}>{level || '—'}</span>;
}

function modelBadge(name) {
  const cls = { diabetes: 'badge-diabetes', ckd: 'badge-ckd', pneumonia: 'badge-pneumonia', breast_cancer: 'badge-breast_cancer' }[name] || '';
  return <span className={`badge ${cls}`}>{name?.replace('_', ' ') || '—'}</span>;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState(null);
  const [preds, setPreds]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, pRes] = await Promise.all([
          api.get('/api/user/sessions'),
          api.get('/api/user/predictions'),
        ]);
        setSessions(sRes.data);
        setPreds(pRes.data);
      } catch (e) {
        setError('Failed to load dashboard data. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="page-content">
      <div className="loading-center"><div className="spinner spinner-lg" /><span>Loading dashboard…</span></div>
    </div>
  );

  if (error) return (
    <div className="page-content">
      <div className="alert alert-error">{error}</div>
    </div>
  );

  // ── Build chart data from by_model counts ─────────────────────────
  const modelChartData = preds ? [
    { name: 'Diabetes',      value: preds.by_model.diabetes,      fill: '#2563eb' },
    { name: 'CKD',           value: preds.by_model.ckd,           fill: '#7c3aed' },
    { name: 'Pneumonia',     value: preds.by_model.pneumonia,      fill: '#0891b2' },
    { name: 'Breast Cancer', value: preds.by_model.breast_cancer,  fill: '#be185d' },
  ] : [];

  const riskChartData = preds ? [
    { name: 'Low',      value: preds.by_risk_level.Low,      fill: 'var(--risk-low)' },
    { name: 'Moderate', value: preds.by_risk_level.Moderate, fill: 'var(--risk-moderate)' },
    { name: 'High',     value: preds.by_risk_level.High,     fill: 'var(--risk-high)' },
    { name: 'Critical', value: preds.by_risk_level.Critical, fill: 'var(--risk-critical)' },
  ] : [];

  const recentSessions   = sessions?.sessions?.slice(0, 5) || [];
  const recentPredictions = preds?.predictions?.slice(0, 5) || [];

  return (
    <div className="page-content">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Good day, {user?.full_name?.split(' ')[0] || 'Doctor'} 👋</h1>
          <p>Here's a summary of your clinical activity.</p>
        </div>
        <Link to="/sessions/new" className="btn btn-primary">
          <Plus size={15} /> New Session
        </Link>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <div className="grid-stat mb-6">
        <div className="stat-card">
          <div className="stat-card-icon blue"><FolderOpen size={22} /></div>
          <div className="stat-card-body">
            <div className="stat-card-label">Total Sessions</div>
            <div className="stat-card-value">{sessions?.total_sessions ?? '—'}</div>
            <div className="stat-card-sub">{sessions?.open_sessions ?? 0} open · {sessions?.closed_sessions ?? 0} closed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon green"><CheckCircle size={22} /></div>
          <div className="stat-card-body">
            <div className="stat-card-label">Open Sessions</div>
            <div className="stat-card-value">{sessions?.open_sessions ?? '—'}</div>
            <div className="stat-card-sub">Active patient sessions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon blue"><Activity size={22} /></div>
          <div className="stat-card-body">
            <div className="stat-card-label">Total Predictions</div>
            <div className="stat-card-value">{preds?.total_predictions ?? '—'}</div>
            <div className="stat-card-sub">Across all sessions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon red"><AlertTriangle size={22} /></div>
          <div className="stat-card-body">
            <div className="stat-card-label">High Risk</div>
            <div className="stat-card-value">
              {preds ? (preds.by_risk_level.High + preds.by_risk_level.Critical) : '—'}
            </div>
            <div className="stat-card-sub">High + Critical cases</div>
          </div>
        </div>
      </div>

      {/* ── Charts row ─────────────────────────────────────────────── */}
      {preds?.total_predictions > 0 && (
        <div className="grid-2 mb-6">
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Predictions by Model</div>
                <div className="card-subtitle">How often each model was used</div>
              </div>
              <TrendingUp size={18} color="var(--text-muted)" />
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={modelChartData} barSize={32}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }}
                  cursor={{ fill: 'var(--surface-2)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {modelChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Predictions by Risk Level</div>
                <div className="card-subtitle">Distribution of outcomes</div>
              </div>
              <AlertTriangle size={18} color="var(--text-muted)" />
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={riskChartData} barSize={40}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }}
                  cursor={{ fill: 'var(--surface-2)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {riskChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Recent sessions + predictions ─────────────────────────── */}
      <div className="grid-2">

        {/* Recent Sessions */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Sessions</div>
              <div className="card-subtitle">Your last 5 sessions</div>
            </div>
            <Link to="/sessions" className="btn btn-ghost btn-sm">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <Clock size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
              <h3>No sessions yet</h3>
              <p>Start by opening a session for a patient.</p>
              <Link to="/sessions/new" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                <Plus size={14} /> New Session
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentSessions.map(s => (
                <Link
                  key={s.session_id}
                  to={`/sessions/${s.session_id}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border-light)',
                    textDecoration: 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {s.patient_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {formatDate(s.created_at)} · {s.total_predictions} prediction{s.total_predictions !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <span className={`badge badge-${s.status}`}>{s.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Predictions */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Predictions</div>
              <div className="card-subtitle">Your last 5 results</div>
            </div>
            <Link to="/predictions" className="btn btn-ghost btn-sm">
              Run new <ChevronRight size={14} />
            </Link>
          </div>

          {recentPredictions.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <Activity size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
              <h3>No predictions yet</h3>
              <p>Open a session then run a prediction.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentPredictions.map(p => (
                <div
                  key={p.prediction_id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 3 }}>
                      {modelBadge(p.modelname)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {p.patient_name} · {formatDate(p.created_at)}
                    </div>
                  </div>
                  {riskBadge(p.risk_level)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
