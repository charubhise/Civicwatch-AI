import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  Building, 
  CheckCircle2, 
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { formatINR } from '../components/TransactionTable';
import { api } from '../services/api';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [reconciliation, setReconciliation] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    setLoading(true);
    try {
      const [reportData, recData] = await Promise.all([
        api.getAuditReport(),
        api.getReconciliation()
      ]);
      setReport(reportData);
      setReconciliation(recData);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Action Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Comprehensive Civic Audit & Reconciliation Dossier
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Official financial ledger verification comparing data.gov.in public disclosures against budget appropriations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadReportsData} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Recalculate Dossier</span>
          </button>
          <button onClick={handlePrint} className="btn-primary" style={{ fontSize: '0.8rem' }}>
            <Printer size={14} />
            <span>Print Audit Summary</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="civic-card" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid #38bdf8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Generating financial reconciliation dossier...</p>
        </div>
      ) : (
        <>
          {/* Executive Integrity Banner */}
          <div className="civic-card" style={{
            padding: '1.75rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(2, 132, 199, 0.1) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  OVERALL FISCAL INTEGRITY RATING
                </span>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', marginTop: '0.25rem' }}>
                  {report?.fiscal_integrity_score || 88.5}<span style={{ fontSize: '1.25rem', color: '#94a3b8' }}>/100</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  Generated on: {report?.generated_at}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Audited Outlay</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>
                  {formatINR(report?.total_expenditure || 0)}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Across {report?.total_audited_transactions} transactions</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Flagged Discrepancy Amount</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fb7185' }}>
                  {formatINR(report?.risk_summary?.flagged_amount || 0)}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#fb7185' }}>{report?.risk_summary?.flagged_count} suspect records flagged</div>
              </div>
            </div>
          </div>

          {/* Scheme Reconciliation Ledger Table */}
          <div className="civic-card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                Full Scheme Reconciliation Ledger
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Comprehensive cross-verification of Sanctioned Budget vs Actual Realized Disbursements
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="civic-table">
                <thead>
                  <tr>
                    <th>Scheme Name</th>
                    <th>Ministry / Department</th>
                    <th>Sanctioned Budget</th>
                    <th>Actual Disbursed</th>
                    <th>Unspent Balance</th>
                    <th>Variance %</th>
                    <th>Audit Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reconciliation.map((rec) => {
                    const isOver = rec.status.includes('Overspent');
                    return (
                      <tr key={rec.id}>
                        <td style={{ fontWeight: 600, color: '#ffffff' }}>{rec.scheme_name}</td>
                        <td style={{ color: '#cbd5e1' }}>{rec.department}</td>
                        <td style={{ fontWeight: 600, color: '#ffffff' }}>{formatINR(rec.allocated_budget)}</td>
                        <td style={{ fontWeight: 700, color: isOver ? '#fb7185' : '#38bdf8' }}>{formatINR(rec.disbursed_amount)}</td>
                        <td style={{ color: '#94a3b8' }}>{formatINR(rec.unspent_balance)}</td>
                        <td style={{ fontWeight: 700, color: rec.discrepancy_rate > 20 ? '#fbbf24' : '#34d399' }}>
                          {rec.discrepancy_rate}%
                        </td>
                        <td>
                          <span style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: isOver ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: isOver ? '#fb7185' : '#34d399',
                            border: `1px solid ${isOver ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                          }}>
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Departmental Health Scorecard */}
          <div className="civic-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
              Departmental Fiscal Governance Scorecard
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Ministry integrity grades evaluated on compliance ratio, single-bidder incidence, and GFR conformance.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {(report?.departmental_health || []).map((dh, i) => (
                <div key={i} style={{ padding: '1rem', backgroundColor: '#0d1526', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', flex: 1, paddingRight: '0.5rem' }}>
                      {dh.department}
                    </h4>
                    <span style={{
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      backgroundColor: dh.integrity_grade.startsWith('A') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: dh.integrity_grade.startsWith('A') ? '#34d399' : '#fbbf24'
                    }}>
                      {dh.integrity_grade}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                    <span>Total Outlay:</span>
                    <strong style={{ color: '#e2e8f0' }}>{formatINR(dh.total_spent)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    <span>Flagged Transactions:</span>
                    <strong style={{ color: dh.flagged_tx > 0 ? '#fb7185' : '#34d399' }}>{dh.flagged_tx} of {dh.total_tx}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Findings and Recommendations Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            <div className="civic-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <AlertTriangle size={18} color="#fbbf24" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Auditor Key Findings</h3>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
                {(report?.key_findings || []).map((kf, i) => (
                  <li key={i} style={{ lineHeight: 1.5 }}>{kf}</li>
                ))}
              </ul>
            </div>

            <div className="civic-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <ShieldCheck size={18} color="#34d399" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Compliance & Oversight Actions</h3>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
                {(report?.compliance_recommendations || []).map((cr, i) => (
                  <li key={i} style={{ lineHeight: 1.5 }}>{cr}</li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
