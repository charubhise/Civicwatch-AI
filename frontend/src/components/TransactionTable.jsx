import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle,
  Building2,
  Calendar,
  CreditCard
} from 'lucide-react';

export function formatINR(val) {
  if (val === null || val === undefined) return '₹0';
  const num = Number(val);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakh`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

export default function TransactionTable({ 
  transactions = [], 
  loading = false, 
  page = 1, 
  total = 0, 
  limit = 20, 
  onPageChange 
}) {
  const [selectedTx, setSelectedTx] = useState(null);

  const totalPages = Math.ceil(total / limit) || 1;

  const getRiskBadgeClass = (risk) => {
    switch (risk) {
      case 'Critical': return 'badge-critical';
      case 'High': return 'badge-high';
      case 'Medium': return 'badge-medium';
      default: return 'badge-low';
    }
  };

  return (
    <div className="civic-card" style={{ overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table className="civic-table">
          <thead>
            <tr>
              <th>Voucher / Ref ID</th>
              <th>Scheme & Department</th>
              <th>Vendor & GSTIN</th>
              <th>Disbursed Amount</th>
              <th>Budget Envelope</th>
              <th>Date</th>
              <th>Integrity Risk</th>
              <th style={{ textAlign: 'center' }}>Audit Detail</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid #38bdf8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <p style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>Loading civic transaction records...</p>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  No civic transactions found matching the selected criteria.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.82rem', fontFamily: 'JetBrains Mono, monospace' }}>
                      {tx.reference_id}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{tx.source_platform}</span>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.84rem' }}>{tx.scheme_name}</div>
                    <div style={{ fontSize: '0.73rem', color: '#94a3b8' }}>{tx.department}</div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 500, color: '#f1f5f9', fontSize: '0.84rem' }}>{tx.vendor_name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                      GST: {tx.vendor_gst}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.9rem' }}>
                      {formatINR(tx.amount)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {tx.amount ? `₹${Number(tx.amount).toLocaleString('en-IN')}` : ''}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                      {formatINR(tx.allocated_budget)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Sanctioned Limit</div>
                  </td>

                  <td style={{ fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {tx.transaction_date}
                  </td>

                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }} className={getRiskBadgeClass(tx.risk_level)}>
                      {tx.is_anomaly ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                      <span>{tx.risk_level}</span>
                    </div>
                    {tx.is_anomaly && (
                      <div style={{ fontSize: '0.68rem', color: '#fb7185', marginTop: '0.2rem', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tx.anomaly_type}
                      </div>
                    )}
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => setSelectedTx(tx)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        color: '#38bdf8',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Eye size={13} />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
          Showing {transactions.length} of {total} civic records (Page {page} of {totalPages})
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => onPageChange && onPageChange(page - 1)}
            disabled={page <= 1}
            className="btn-secondary"
            style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}
          >
            Previous
          </button>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', padding: '0 0.5rem' }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange && onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="btn-secondary"
            style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
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
          <div className="civic-card" style={{ maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>Civic Audit Inspection</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>
                  {selectedTx.reference_id}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedTx(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Alert Status Banner */}
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                backgroundColor: selectedTx.is_anomaly ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                border: `1px solid ${selectedTx.is_anomaly ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                {selectedTx.is_anomaly ? <AlertTriangle size={20} color="#fb7185" /> : <ShieldCheck size={20} color="#34d399" />}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: selectedTx.is_anomaly ? '#fb7185' : '#34d399' }}>
                    {selectedTx.is_anomaly ? `Anomaly Detected: ${selectedTx.anomaly_type}` : 'Compliant Disbursement Record'}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                    {selectedTx.anomaly_reason}
                  </p>
                </div>
              </div>

              {/* Grid of Transaction Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: '#0d1526', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Disbursed Amount</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
                    {formatINR(selectedTx.amount)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>₹{Number(selectedTx.amount).toLocaleString('en-IN')}</div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: '#0d1526', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Scheme Budget</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                    {formatINR(selectedTx.allocated_budget)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Allocated Envelope</div>
                </div>
              </div>

              {/* Entity Information */}
              <div style={{ padding: '0.85rem', backgroundColor: '#0d1526', borderRadius: '8px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#64748b' }}>Scheme Name:</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{selectedTx.scheme_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#64748b' }}>Ministry / Dept:</span>
                  <span style={{ color: '#e2e8f0' }}>{selectedTx.department}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#64748b' }}>Contractor / Vendor:</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{selectedTx.vendor_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#64748b' }}>GSTIN Identifier:</span>
                  <span style={{ color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>{selectedTx.vendor_gst}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#64748b' }}>State & District:</span>
                  <span style={{ color: '#e2e8f0' }}>{selectedTx.state}, {selectedTx.district}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#64748b' }}>Source Registry:</span>
                  <span style={{ color: '#10b981' }}>{selectedTx.source_platform}</span>
                </div>
              </div>

              {/* Anomaly Score Bar */}
              <div style={{ padding: '0.85rem', backgroundColor: '#0d1526', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>AI Anomaly Probability Score</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: selectedTx.anomaly_score > 50 ? '#fb7185' : '#38bdf8' }}>
                    {selectedTx.anomaly_score}%
                  </span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#1e293b', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${selectedTx.anomaly_score}%`, 
                    backgroundColor: selectedTx.anomaly_score > 60 ? '#f43f5e' : (selectedTx.anomaly_score > 20 ? '#f59e0b' : '#10b981'),
                    transition: 'width 0.4s ease'
                  }}></div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedTx(null)}
                className="btn-primary"
                style={{ padding: '0.45rem 1rem' }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
