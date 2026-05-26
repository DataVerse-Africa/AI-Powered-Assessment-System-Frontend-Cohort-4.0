// src/pages/SessionDetail.jsx
// GET /api/sessions/{id}
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Activity, MessageSquare, XCircle, Trash2,
  User, Calendar, ClipboardList, AlertTriangle
} from 'lucide-react';
import api from '../api/axios';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

function riskBadge(level) {
  const map = { Low: 'badge-low', Moderate: 'badge-moderate', High: 'badge-high', Critical: 'badge-critical' };
  return <span className={`badge ${map[level] || ''}`}>{level || '—'}</span>;
}

function modelBadge(name) {
  const map = {
    diabetes: 'badge-diabetes', ckd: 'badge-ckd',
    pneumonia: 'badge-pneumonia', breast_cancer: 'badge-breast_cancer'
  };
  return <span className={`badge ${map[name] || ''}`}>{name?.replace('_', ' ') || '—'}</span>;
}

export default function SessionDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [closing, setClosing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/sessions/${id}`);
      setSession(res.data);
    } catch (e) {
      setError(e.response?.status === 404 ? 'Session not found.' : 'Failed to load session.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleClose = async () => {
    setClosing(true);
    try {
      await api.patch(`/api/sessions/${id}/close`, {});
      load();
    } catch (e) {
      alert('Failed to close session.');
    } finally {
      setClosing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this session and all predictions? This cannot be undone.')) return;
    try {
      await api.delete(`/api/sessions/${id}`);
      navigate('/sessions');
    } catch (e) {
      alert('Failed to delete session.');
    }
  };

  if (loading) return <div className="page-content"><div className="loading-center"><div className="spinner spinner-lg" /></div></div>;
  if (error)   return <div className="page-content"><div className="alert alert-error">{error}</div></div>;
  if (!session) return null;

  const predictions = session.predictions || [];

  return (
    <div className="page-content">
      {/* ── Back + actions ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Back
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          {session.status === 'open' && (
            <>
              <Link to={`/predictions?session_id=${id}`} className="btn btn-primary btn-sm">
                <Activity size={14} /> Run Prediction
              </Link>
              <Link to={`/chatbot?session_id=${id}`} className="btn btn-secondary btn-sm">
                <MessageSquare size={14} /> AI Chatbot
              </Link>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleClose}
                disabled={closing}
                style={{ color: 'var(--warning)' }}
              >
                {closing ? <span className="spinner" /> : <XCircle size={14} />} Close Session
              </button>
            </>
          )}
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleDelete}
            style={{ color: 'var(--danger)' }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* ── Session info ────────────────────────────────────────────── */}
      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-header" style={{ marginBottom: 16 }}>
            <div className="card-title">Patient Details</div>
            <span className={`badge badge-${session.status}`}>{session.status}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: User, label: 'Name', value: session.patient_name },
              { icon: Calendar, label: 'Age', value: `${session.patient_age} years` },
              { icon: User, label: 'Gender', value: session.patient_gender },
              { icon: ClipboardList, label: 'Reason', value: session.reason_for_visit },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Icon size={15} style={{ color: 'var(--text-muted)', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>{label}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{value || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Session Stats</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Session ID', value: `#${session.session_id || id}` },
              { label: 'Total Predictions', value: predictions.length },
              { label: 'Opened', value: formatDate(session.created_at) },
              { label: 'Closed', value: session.closed_at ? formatDate(session.closed_at) : 'Still open' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                padding: '10px 12px',
                background: 'var(--surface-2)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-light)',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 3 }}>{value}</div>
              </div>
            ))}
          </div>

          {session.notes && (
            <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 'var(--radius)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Notes</div>
              {session.notes}
            </div>
          )}
        </div>
      </div>

      {/* ── Predictions list ────────────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Predictions ({predictions.length})</div>
            <div className="card-subtitle">All ML model results for this session</div>
          </div>
          {session.status === 'open' && (
            <Link to={`/predictions?session_id=${id}`} className="btn btn-primary btn-sm">
              <Activity size={14} /> Run Prediction
            </Link>
          )}
        </div>

        {predictions.length === 0 ? (
          <div className="empty-state">
            <Activity size={36} className="empty-state-icon" />
            <h3>No predictions yet</h3>
            {session.status === 'open'
              ? <p>Run a prediction to see results here.</p>
              : <p>This session was closed without any predictions.</p>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {predictions.map(p => (
              <div
                key={p.prediction_id || p.id}
                className="prediction-result"
              >
                <div className="prediction-result-header">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {modelBadge(p.modelname)}
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {formatDate(p.created_at)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {riskBadge(p.risk_level)}
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {p.prediction_label || '—'}
                    </span>
                  </div>
                </div>

                {/* Probability bar */}
                {p.probability != null && (
                  <div className="probability-bar-wrap">
                    <div className="probability-bar-label">
                      <span>Confidence</span>
                      <span style={{ fontWeight: 600 }}>{(p.probability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="probability-bar">
                      <div
                        className={`probability-bar-fill ${p.risk_level?.toLowerCase() || ''}`}
                        style={{ width: `${(p.probability * 100).toFixed(1)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                {p.recommendation && (
                  <div style={{
                    marginTop: 10,
                    padding: '8px 12px',
                    background: 'var(--surface-2)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    gap: 8,
                    alignItems: 'flex-start',
                  }}>
                    <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1, color: 'var(--warning)' }} />
                    {p.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
