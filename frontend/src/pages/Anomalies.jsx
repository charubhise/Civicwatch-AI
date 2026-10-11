import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle, 
  FileSearch, 
  BarChart2, 
  Check, 
  ShieldAlert,
  ArrowRight,
  Filter
} from 'lucide-react';
import { formatINR } from '../components/TransactionTable';
import { api } from '../services/api';

export default function Anomalies() {
  const [anomalies, setAnomalies] = useState([]);
  const [benfordData, setBenfordData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('Under Investigation');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [savingResolution, setSavingResolution] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    loadAnomalyData();
  }, []);

  const loadAnomalyData = async () => {
    setLoading(true);
    try {
      const [reports, benford] = await Promise.all([
        api.getAnomalies(),
        api.getBenfordAnalysis()
      ]);
      setAnomalies(reports);
      setBenfordData(benford);
    } catch (err) {
      console.error('Failed to load anomalies data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    setSavingResolution(true);
    try {
      await api.resolveAnomaly(selectedReport.report_id, {
        resolution_status: resolutionStatus,
        resolution_notes: resolutionNotes
      });
      setSelectedReport(null);
      setResolutionNotes('');
      await loadAnomalyData();
    } catch (err) {
      console.error('Failed to resolve anomaly:', err);
    } finally {
      setSavingResolution(false);
    }
  };

  const filteredAnomalies = severityFilter === 'all' 
    ? anomalies 
    : anomalies.filter(a => a.severity.toLowerCase() === severityFilter.toLowerCase());

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          AI Anomaly & Forensic Audit Inspector
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
          Real-time algorithmic detection of fiscal fraud patterns, Benford's Law distribution divergence, and tender evasion tactics.
        </p>
      </div>

      {/* Benford's Law Forensic Visualizer */}
      <div className="civic-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 size={20} color="#38bdf8" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                Benford's Law First-Digit Forensic Analysis
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Compares leading digits of public disbursements against naturally occurring Benford logarithmic distribution ($P(d) = \log_{10}(1 + 1/d)$)
            </p>
          </div>

          {benfordData && (
            <div style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: benfordData.chi_square_stat > 20 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: benfordData.chi_square_stat > 20 ? '#fb7185' : '#34d399',
              border: `1px solid ${benfordData.chi_square_stat > 20 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
            }}>
              {benfordData.conformity_status} (Chi-Sq: {benfordData.chi_square_stat})
            </div>
          )}
        </div>

        {/* Distribution Bars (1 to 9) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '0.75rem', alignItems: 'flex-end', height: '170px', padding: '1rem 0.5rem', backgroundColor: '#0d1526', borderRadius: '8px', border: '1px solid #1e293b' }}>
          {(benfordData?.distribution || []).map((item) => {
            const isSpike = Math.abs(item.deviation) > 10;
            return (
              <div key={item.digit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.68rem', color: isSpike ? '#fb7185' : '#38bdf8', fontWeight: 700 }}>
                  {item.actual_frequency}%
                </span>
                <div style={{ width: '100%', maxWidth: '32px', height: '100px', display: 'flex', alignItems: 'flex-end', gap: '3px', position: 'relative' }}>
                  {/* Actual frequency bar */}
                  <div style={{
                    flex: 1,
                    height: `${Math.min(100, item.actual_frequency * 2.5)}%`,
                    backgroundColor: isSpike ? '#f43f5e' : '#0284c7',
                    borderRadius: '3px 3px 0 0',
                    transition: 'height 0.4s ease'
                  }}></div>
                  {/* Ideal Benford benchmark line */}
                  <div style={{
                    flex: 1,
                    height: `${Math.min(100, item.benford_expected_frequency * 2.5)}%`,
                    backgroundColor: '#475569',
                    borderRadius: '3px 3px 0 0'
                  }}></div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace' }}>
                  {item.digit}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.85rem', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', backgroundColor: '#0284c7', borderRadius: '2px', display: 'inline-block' }}></span>
              Actual Civic Disbursements
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', backgroundColor: '#475569', borderRadius: '2px', display: 'inline-block' }}></span>
              Benford Theoretical Ideal
            </span>
          </div>
          <span>Total analyzed vouchers: <strong>{benfordData?.total_samples || 0}</strong></span>
        </div>
      </div>

      {/* Flagged Anomalies List & Resolution Center */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>Active Anomaly Audit Ledger</h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Investigate irregularities, review evidence trails, and resolve findings</p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['all', 'critical', 'high', 'medium'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  backgroundColor: severityFilter === sev ? '#1e293b' : '#0d1526',
                  color: severityFilter === sev ? '#38bdf8' : '#64748b',
                  border: severityFilter === sev ? '1px solid #334155' : '1px solid #1e293b',
                  cursor: 'pointer'
                }}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAnomalies.length === 0 ? (
            <div className="civic-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              No anomaly reports found for this filter criteria.
            </div>
          ) : (
            filteredAnomalies.map((rep) => (
              <div 
                key={rep.report_id} 
                className="civic-card" 
                style={{ 
                  padding: '1.25rem', 
                  borderLeft: `4px solid ${rep.severity === 'Critical' ? '#f43f5e' : (rep.severity === 'High' ? '#f59e0b' : '#38bdf8')}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        backgroundColor: rep.severity === 'Critical' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: rep.severity === 'Critical' ? '#fb7185' : '#fbbf24'
                      }}>
                        {rep.severity} Severity
                      </span>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                        {rep.rule_name}
                      </h4>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      Voucher Ref: <strong style={{ color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace' }}>{rep.reference_id}</strong> | Scheme: {rep.scheme_name} ({rep.department})
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>
                      {formatINR(rep.amount)}
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: rep.resolution_status === 'Resolved' ? '#34d399' : (rep.resolution_status === 'False Positive' ? '#94a3b8' : '#fbbf24')
                    }}>
                      Status: {rep.resolution_status}
                    </span>
                  </div>
                </div>

                {/* Evidence Details */}
                <div style={{ padding: '0.75rem 0.95rem', backgroundColor: '#0d1526', borderRadius: '6px', border: '1px solid #1e293b', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  <strong style={{ color: '#f43f5e' }}>Auditor Evidence:</strong> {rep.evidence}
                </div>

                {/* Footer and Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #141e33' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Vendor: <strong style={{ color: '#94a3b8' }}>{rep.vendor_name}</strong> | Detected: {new Date(rep.detected_at).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => { setSelectedReport(rep); setResolutionStatus(rep.resolution_status); setResolutionNotes(rep.resolution_notes || ''); }}
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                  >
                    <span>Update Resolution Status</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Resolution Modal */}
      {selectedReport && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="civic-card" style={{ maxWidth: '520px', width: '100%', padding: '1.5rem', border: '1px solid #334155' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
              Audit Resolution Decision
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Case #{selectedReport.report_id}: {selectedReport.rule_name}
            </p>

            <form onSubmit={handleResolveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Investigation Finding Status
                </label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value)}
                  className="civic-input"
                  style={{ width: '100%' }}
                >
                  <option value="Under Investigation">Under Investigation (Auditor Review Ongoing)</option>
                  <option value="Resolved">Resolved (Statutory Clarification Submitted)</option>
                  <option value="False Positive">False Positive (Verified Special Exemption)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Auditor Notes / Legal Memo
                </label>
                <textarea
                  rows={4}
                  placeholder="Record formal justification, ministry reply, or procurement board resolution..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="civic-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setSelectedReport(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={savingResolution} className="btn-primary">
                  {savingResolution ? 'Saving Decision...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
