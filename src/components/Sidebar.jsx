// src/components/Sidebar.jsx
// ═══════════════════════════════════════════════════════════════════
//  Sidebar — persistent left navigation
//
//  Shows different nav items depending on whether the user is
//  a clinician or admin (detected via isAdmin from AuthContext).
// ═══════════════════════════════════════════════════════════════════

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Clock,
  Activity,
  MessageSquare,
  Users,
  BarChart2,
  FileText,
  Download,
  LogOut,
  Stethoscope,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ── Nav items for clinician ───────────────────────────────────────
const clinicianNav = [
  { to: '/dashboard',       label: 'Dashboard',        icon: LayoutDashboard },
  { to: '/sessions/new',    label: 'New Session',       icon: FolderOpen },
  { to: '/sessions',        label: 'Session History',   icon: Clock },
  { to: '/predictions',     label: 'Run Prediction',    icon: Activity },
  { to: '/chatbot',         label: 'AI Chatbot',        icon: MessageSquare },
];

// ── Nav items for admin ───────────────────────────────────────────
const adminNav = [
  { to: '/admin/dashboard',   label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/admin/clinicians',  label: 'Clinicians',      icon: Users },
  { to: '/admin/sessions',    label: 'All Sessions',    icon: Clock },
  { to: '/admin/predictions', label: 'All Predictions', icon: BarChart2 },
  { to: '/admin/export',      label: 'CSV Export',      icon: Download },
];

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = isAdmin ? adminNav : clinicianNav;

  const handleLogout = async () => {
    await logout();
    navigate(isAdmin ? '/admin-login' : '/login');
  };

  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: 'var(--sidebar-width)',
      height: '100vh',
      background: 'var(--sidebar-bg)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      borderRight: '1px solid #1e293b',
    }}>

      {/* ── Logo / App Name ──────────────────────────────────────── */}
      <div style={{
        padding: '20px 16px 16px',
        borderBottom: '1px solid #1e293b',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36,
            height: 36,
            background: 'var(--primary)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Stethoscope size={18} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.2 }}>
              PatientAssess
            </div>
            <div style={{ color: '#64748b', fontSize: '0.6875rem', marginTop: 2 }}>
              {isAdmin ? 'Admin Panel' : 'Clinical System'}
            </div>
          </div>
        </div>
      </div>

      {/* ── User info chip ───────────────────────────────────────── */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
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
          flexShrink: 0,
        }}>
          {isAdmin
            ? <ShieldCheck size={16} />
            : (user?.full_name?.[0] || 'C')}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            color: '#e2e8f0',
            fontSize: '0.8125rem',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {user?.full_name || user?.email || 'User'}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.6875rem' }}>
            {isAdmin ? 'Administrator' : 'Clinician'}
          </div>
        </div>
      </div>

      {/* ── Navigation Links ─────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{
            fontSize: '0.65rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#475569',
            padding: '0 8px',
            marginBottom: 6,
          }}>
            {isAdmin ? 'Administration' : 'Navigation'}
          </div>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 10px',
                borderRadius: 8,
                marginBottom: 2,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: isActive ? 'white' : '#94a3b8',
                background: isActive ? 'rgba(37,99,235,0.25)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'all 0.15s ease',
                textDecoration: 'none',
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.color = '#e2e8f0';
                  e.currentTarget.style.background = '#1e293b';
                }
              }}
              onMouseLeave={e => {
                // NavLink handles active state, we just reset hover
                const link = e.currentTarget;
                if (!link.style.background.includes('37,99,235')) {
                  link.style.color = '#94a3b8';
                  link.style.background = 'transparent';
                }
              }}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ── Logout ───────────────────────────────────────────────── */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid #1e293b' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 10px',
            borderRadius: 8,
            width: '100%',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#94a3b8',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            textAlign: 'left',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#f87171';
            e.currentTarget.style.background = 'rgba(220,38,38,0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut size={17} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
