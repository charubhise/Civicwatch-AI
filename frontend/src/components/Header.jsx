import React from 'react';
import { Upload, Database, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function Header({ title, subtitle, onOpenUpload, onOpenSync, stats }) {
  return (
    <header style={{ 
      padding: '1.25rem 2rem', 
      borderBottom: '1px solid #1e293b', 
      backgroundColor: '#0d1322', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>{title}</h2>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.15rem' }}>{subtitle}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Live Status Pill */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.45rem', 
          backgroundColor: '#131d33', 
          border: '1px solid #233352', 
          padding: '0.45rem 0.8rem', 
          borderRadius: '9999px',
          fontSize: '0.75rem',
          color: '#cbd5e1'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }}></span>
          <span>data.gov.in Live Engine</span>
        </div>

        {/* Risk Alerts Counter */}
        {stats && stats.critical_risk_count > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            padding: '0.45rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#fb7185'
          }}>
            <ShieldAlert size={14} />
            <span>{stats.critical_risk_count} Critical Anomaly</span>
          </div>
        )}

        {/* Upload Button */}
        <button 
          onClick={onOpenUpload}
          className="btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
        >
          <Upload size={15} />
          <span>Ingest Dataset</span>
        </button>

        {/* Sync data.gov.in Button */}
        <button 
          onClick={onOpenSync}
          className="btn-primary"
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem' }}
        >
          <Database size={15} />
          <span>Sync data.gov.in</span>
        </button>
      </div>
    </header>
  );
}
