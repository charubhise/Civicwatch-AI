import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  AlertTriangle, 
  FileText, 
  Database, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onOpenSync, onResetDemo, loadingDemo }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions Ledger', icon: Receipt },
    { id: 'anomalies', label: 'AI Anomaly Inspector', icon: AlertTriangle },
    { id: 'reports', label: 'Audit & Reconciliation', icon: FileText },
  ];

  return (
    <aside style={{ width: '260px', minHeight: '100vh', backgroundColor: '#0d1322', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column' }}>
      {/* Brand Header */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)' }}>
          <ShieldCheck size={22} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', lineHeight: 1.2 }}>CivicWatch-AI</h1>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>Public Funds Oversight</p>
        </div>
      </div>

      {/* data.gov.in status badge */}
      <div style={{ margin: '1rem 1rem 0.5rem', padding: '0.75rem', backgroundColor: '#131b2e', borderRadius: '8px', border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.04em' }}>Data Connector</span>
          <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }}></span>
        </div>
        <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          data.gov.in (OGD India)
        </p>
        <p style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.2rem' }}>
          Real-time API & Public Datasets
        </p>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.7rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : '#94a3b8',
                backgroundColor: isActive ? '#1e293b' : 'transparent',
                border: isActive ? '1px solid #334155' : '1px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={18} color={isActive ? '#38bdf8' : '#64748b'} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div style={{ margin: '1rem 0 0.5rem', borderTop: '1px solid #1e293b' }}></div>

        {/* Action button: Sync data.gov.in */}
        <button
          onClick={onOpenSync}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.7rem 0.85rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease'
          }}
        >
          <Database size={18} color="#38bdf8" />
          <span>Sync data.gov.in</span>
        </button>
      </nav>

      {/* Footer controls */}
      <div style={{ padding: '1rem', borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <button
          onClick={onResetDemo}
          disabled={loadingDemo}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.55rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: '#94a3b8',
            backgroundColor: '#111827',
            border: '1px solid #1e293b',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <RefreshCw size={13} className={loadingDemo ? 'animate-spin' : ''} />
          <span>{loadingDemo ? 'Reseeding...' : 'Reset Demo Data'}</span>
        </button>

        <a 
          href="https://data.gov.in/?utm_source=chatgpt.com" 
          target="_blank" 
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            fontSize: '0.7rem',
            color: '#64748b',
            textDecoration: 'none',
            padding: '0.3rem'
          }}
        >
          <span>Open data.gov.in Portal</span>
          <ExternalLink size={11} />
        </a>
      </div>
    </aside>
  );
}
