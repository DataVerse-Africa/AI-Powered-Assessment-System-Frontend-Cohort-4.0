// src/pages/admin/AdminDashboard.jsx
// GET /api/admin/analytics
import React, { useEffect, useState } from 'react';
import { Users, FolderOpen, Activity, AlertTriangle, TrendingUp, ShieldAlert } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import api from '../../api/axios';

const RISK_COLORS  = { Low: '#16a34a', Moderate: '#d97706', High: '#dc2626', Critical: '#7c3aed' };
const MODEL_COLORS = { diabetes: '#2563eb', ckd: '#7c3aed', pneumonia: '#0891b2', breast_cancer: '#be185d' };

export default function AdminDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/api/admin/analytics')
      .then(res => setData(res.data))
      .catch(e => {
        const msg = e.response?.data?.detail;
        setError(typeof msg === 'string' ? msg : 'Failed to load analytics.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-content"><div className="loading-center"><div className="spinner spinner-lg" /></div></div>;
  if (error)   return <div className="page-content"><div className="alert alert-error">{error}</div></div>;
  if (!data)   return null;

  // ── Destructure with safe fallbacks ──────────────────────────────
  const summary     = data.summary || {};
  const modelUsage  = data.model_usage || [];
  const riskDist    = data.risk_distribution || [];
  const dailyData   = data.daily_activity_last_30_days || [];
  const topClinicians = data.top_5_clinicians || [];
  const loginActivity = data.login_activity_last_30_days || {};

  // ── Chart-ready data ──────────────────────────────────────────────
  const modelChartData = modelUsage.map(m => ({
    name: m.model?.replace('_', ' ') || '—',
    value: m.count || 0,
    fill: MODEL_COLORS[m.model] || '#94a3b8',
  }));

  const riskChartData = riskDist.map(r => ({
    name: r.risk_level || '—',
    value: r.count || 0,
    fill: RISK_COLORS[r.risk_level] || '#94a3b8',
  }));

  const lineChartData = dailyData.slice(-14).map(d => ({
    date: d.date ? new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '',
    count: d.predictions || 0,
  }));

  const highRisk = riskDist
    .filter(r => r.risk_level === 'High' || r.risk_level === 'Critical')
    .reduce((sum, r) => sum + (r.count || 0), 0);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>System-wide statistics across all clinicians and patients.</p>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <div className="grid-4 mb-6">
        <div className="stat-card">
          <div className="stat-card-icon blue"><Users size={22} /></div>
          <div className="stat-card-body">
            <div className="stat-card-label">Total Clinicians</div>
            <div className="stat-card-value">{summary.total_clinicians ?? '—'}</div>
            <div className="stat-card-sub">{summary.active_clinicians ?? 0} active · {summary.suspended_clinicians ?? 0} suspended</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon green"><FolderOpen size={22} /></div>
          <div className="stat-card-body">
            <div className="stat-card-label">Total Sessions</div>
            <div className="stat-card-value">{summary.total_sessions ?? '—'}</div>
            <div className="stat-card-sub">{summary.open_sessions ?? 0} open</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon blue"><Activity size={22} /></div>
          <div className="stat-card-body">
            <div className="stat-card-label">Total Predictions</div>
            <div className="stat-card-value">{summary.total_predictions ?? '—'}</div>
            <div className="stat-card-sub">Across all sessions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon red"><AlertTriangle size={22} /></div>
          <div className="stat-card-body">
            <div className="stat-card-label">High Risk Cases</div>
            <div className="stat-card-value">{highRisk}</div>
            <div className="stat-card-sub">High + Critical</div>
          </div>
        </div>
      </div>

      {/* ── Charts row ─────────────────────────────────────────────── */}
      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Predictions by Model</div>
            <TrendingUp size={18} color="var(--text-muted)" />
          </div>
          {modelChartData.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}><p>No predictions yet</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={modelChartData} barSize={36}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} cursor={{ fill: 'var(--surface-2)' }} />
                <Bar dataKey="value" name="Predictions" radius={[4, 4, 0, 0]}>
                  {modelChartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Risk Level Distribution</div>
          </div>
          {riskChartData.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}><p>No predictions yet</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={riskChartData}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                  labelLine={false}
                >
                  {riskChartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Daily activity line chart ───────────────────────────────── */}
      {lineChartData.length > 0 && (
        <div className="card mb-6">
          <div className="card-header">
            <div className="card-title">Daily Predictions (Last 14 Days)</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineChartData}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="count" name="Predictions" stroke="var(--primary)" strokeWidth={2} dot={{ fill: 'var(--primary)', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Bottom row: top clinicians + login activity ─────────────── */}
      <div className="grid-2">

        {/* Top clinicians */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Top 5 Clinicians</div>
            <div className="card-subtitle">By prediction count</div>
          </div>
          {topClinicians.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 0' }}><p>No data yet</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topClinicians.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--blue-100)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.name || c.email}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</div>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
                    {c.total_predictions}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Login activity */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Login Activity</div>
            <div className="card-subtitle">Last 30 days</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Successful Logins', value: loginActivity.successful_logins ?? 0, color: 'var(--success)', bg: 'var(--success-bg)' },
              { label: 'Failed Logins',     value: loginActivity.failed_logins ?? 0,     color: 'var(--danger)',  bg: 'var(--danger-bg)' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', background: bg,
                borderRadius: 'var(--radius)', border: `1px solid ${color}22`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldAlert size={16} color={color} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
