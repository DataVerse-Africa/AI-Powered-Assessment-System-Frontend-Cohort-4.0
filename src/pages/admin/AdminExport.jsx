// src/pages/admin/AdminExport.jsx
// GET /api/admin/export/{table}
import React, { useState } from 'react';
import { Download, FileText, CheckCircle } from 'lucide-react';
import api from '../../api/axios';

const TABLES = [
  {
    key: 'users',
    label: 'Clinicians',
    desc: 'All registered clinical staff accounts with session and prediction counts.',
    icon: '👩‍⚕️',
  },
  {
    key: 'sessions',
    label: 'Sessions',
    desc: 'All clinical sessions across all clinicians, with patient details and status.',
    icon: '📁',
  },
  {
    key: 'predictions',
    label: 'Predictions',
    desc: 'Complete audit trail of all ML model predictions with risk levels and results.',
    icon: '🔬',
  },
  {
    key: 'audit_logs',
    label: 'Audit Logs',
    desc: 'System-wide log of all actions: logins, logouts, session events, predictions.',
    icon: '📋',
  },
];

export default function AdminExport() {
  const [downloading, setDownloading] = useState(null);
  const [downloaded, setDownloaded]   = useState([]);
  const [error, setError]             = useState('');

  const handleExport = async (tableKey) => {
    setDownloading(tableKey);
    setError('');
    try {
      // Use raw axios with blob response type so we can trigger a download
      const res = await api.get(`/api/admin/export/${tableKey}`, {
        responseType: 'blob',
      });

      // Create a download link and click it programmatically
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href  = url;
      const filename = `${tableKey}_export_${new Date().toISOString().slice(0, 10)}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setDownloaded(d => [...new Set([...d, tableKey])]);
    } catch (e) {
      setError(`Failed to download ${tableKey} CSV. ${e.response?.data?.detail || ''}`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>CSV Export</h1>
        <p>Download any system table as a CSV file for external reporting or analysis.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="alert alert-info" style={{ marginBottom: 24 }}>
        <FileText size={16} style={{ flexShrink: 0 }} />
        <span>
          CSV files are generated fresh on each download and reflect the current state of the database.
          They can be opened in Excel, Google Sheets, or any data tool.
        </span>
      </div>

      <div className="grid-2">
        {TABLES.map(table => (
          <div
            key={table.key}
            className="card"
            style={{
              border: downloaded.includes(table.key)
                ? '1px solid var(--success-border)'
                : '1px solid var(--border)',
              transition: 'border-color 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem' }}>{table.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    {table.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {table.key}.csv
                  </div>
                </div>
              </div>
              {downloaded.includes(table.key) && (
                <CheckCircle size={18} color="var(--success)" />
              )}
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
              {table.desc}
            </p>

            <button
              className="btn btn-secondary btn-full"
              onClick={() => handleExport(table.key)}
              disabled={downloading === table.key}
            >
              {downloading === table.key ? (
                <><span className="spinner" /> Generating CSV…</>
              ) : downloaded.includes(table.key) ? (
                <><CheckCircle size={15} color="var(--success)" /> Download Again</>
              ) : (
                <><Download size={15} /> Download {table.label} CSV</>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
