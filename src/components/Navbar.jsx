// src/components/Navbar.jsx
// ═══════════════════════════════════════════════════════════════════
//  Navbar — top bar, fixed above main content
//  Shows the current page title (derived from route) + user avatar
// ═══════════════════════════════════════════════════════════════════

import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, User, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Map route paths to readable page titles
const PAGE_TITLES = {
  '/dashboard':           { title: 'Dashboard',        sub: 'Overview of your clinical activity' },
  '/sessions/new':        { title: 'New Session',       sub: 'Open a session for a patient' },
  '/sessions':            { title: 'Session History',   sub: 'All your past sessions' },
  '/predictions':         { title: 'Run Prediction',    sub: 'Select a model and enter patient data' },
  '/chatbot':             { title: 'AI Chatbot',        sub: 'AI-assisted clinical conversation' },
  '/admin/dashboard':     { title: 'Admin Dashboard',   sub: 'System-wide statistics' },
  '/admin/clinicians':    { title: 'Clinician Management', sub: 'View and manage clinical staff' },
  '/admin/sessions':      { title: 'All Sessions',      sub: 'Sessions across all clinicians' },
  '/admin/predictions':   { title: 'All Predictions',   sub: 'Full system prediction audit' },
  '/admin/export':        { title: 'CSV Export',        sub: 'Download tables as CSV files' },
};

function getPageInfo(pathname) {
  // Direct match
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Prefix match for dynamic routes e.g. /sessions/3
  for (const [key, val] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(key + '/')) return val;
  }
  return { title: 'Patient Assessment', sub: 'Clinical Decision Support System' };
}

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const { pathname } = useLocation();
  const { title, sub } = getPageInfo(pathname);

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 'var(--sidebar-width)',
      right: 0,
      height: 'var(--navbar-height)',
      background: 'white',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      zIndex: 90,
      boxShadow: 'var(--shadow-sm)',
    }}>

      {/* ── Left: page title ─────────────────────────────────────── */}
      <div>
        <div style={{
          fontSize: '0.9375rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}>
          {title}
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}>
          {sub}
        </div>
      </div>

      {/* ── Right: user info ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Status badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '3px 10px',
          background: 'var(--success-bg)',
          border: '1px solid var(--success-border)',
          borderRadius: 999,
          fontSize: '0.7rem',
          fontWeight: 500,
          color: 'var(--success)',
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--success)',
            display: 'inline-block',
          }} />
          API Connected
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

        {/* User info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: isAdmin ? '#7c3aed' : 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}>
            {user?.full_name?.[0]?.toUpperCase() || <User size={14} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              maxWidth: 140,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {user?.full_name || user?.email || 'User'}
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              {isAdmin ? 'Administrator' : 'Clinician'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
