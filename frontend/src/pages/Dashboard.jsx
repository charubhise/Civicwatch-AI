import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  AlertTriangle, 
  ShieldCheck, 
  Building2, 
  TrendingUp, 
  BarChart3, 
  MapPin, 
  RefreshCw,
  ArrowUpRight,
  PieChart
} from 'lucide-react';
import StatCard from '../components/StatCard';
import TransactionTable, { formatINR } from '../components/TransactionTable';
import { api } from '../services/api';

export default function Dashboard({ onOpenSync, onOpenUpload }) {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, txData] = await Promise.all([
        api.getStats(),
        api.getTransactions({ page: 1, limit: 6 })
      ]);
      setStats(statsData);
      setRecentTransactions(txData.items || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunReconciliation = async () => {
    setReconciling(true);
    try {
      await api.triggerReconciliation();
      await loadDashboardData();
    } catch (err) {
      console.error('Reconciliation error:', err);
    } finally {
      setReconciling(false);
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Top Banner / Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '12px',
        padding: '1.5rem 1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              NATIONAL PUBLIC EXPENDITURE AUDIT ENGINE
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Civic Watchdog & Fiscal Reconciliation
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '680px', marginTop: '0.25rem' }}>
            Auditing continuous civic funds from <strong>data.gov.in (OGD Platform India)</strong> against statutory General Financial Rules (GFR), GST registries, and scheme budget envelopes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleRunReconciliation}
            disabled={reconciling}
            className="btn-secondary"
            style={{ fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} className={reconciling ? 'animate-spin' : ''} />
            <span>{reconciling ? 'Auditing Ledgers...' : 'Run Reconciliation'}</span>
          </button>
          <button
            onClick={onOpenSync}
            className="btn-primary"
            style={{ fontSize: '0.8rem' }}
          >
            <span>Sync data.gov.in</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="TOTAL MONITORED FUNDS"
          value={formatINR(stats?.total_monitored_amount || 0)}
          subtitle={`${stats?.total_transactions || 0} active civic vouchers`}
          icon={DollarSign}
          variant="blue"
          badgeText="Verified Outflow"
        />

        <StatCard
          title="SANCTIONED BUDGET"
          value={formatINR(stats?.total_budget_allocated || 0)}
          subtitle={`Across ${stats?.schemes_count || 0} Union & State schemes`}
          icon={Building2}
          variant="emerald"
          badgeText="Fiscal Ceiling"
        />

        <StatCard
          title="FLAGGED ANOMALIES"
          value={stats?.flagged_anomalies_count || 0}
          subtitle={`${stats?.critical_risk_count || 0} Critical / ${stats?.high_risk_count || 0} High`}
          icon={AlertTriangle}
          variant="rose"
          badgeText={stats?.flagged_anomaly_amount ? formatINR(stats.flagged_anomaly_amount) : '₹0'}
        />

        <StatCard
          title="FISCAL INTEGRITY RATE"
          value={`${stats?.reconciliation_rate || 94.2}%`}
          subtitle="Compliant vs unverified variance"
          icon={ShieldCheck}
          variant={stats?.reconciliation_rate > 90 ? 'emerald' : 'amber'}
          badgeText="Audited"
        />
      </div>

      {/* Scheme Reconciliation Comparison & Anomaly Distribution Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Scheme Reconciliation Bar Chart */}
        <div className="civic-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Scheme Budget vs Actual Outlay</h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Allocated budget (Grey) vs Verified disbursement (Cyan)</p>
            </div>
            <BarChart3 size={18} color="#38bdf8" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {(stats?.top_discrepancy_schemes || []).slice(0, 5).map((scheme, idx) => {
              const pct = scheme.allocated_budget > 0 
                ? Math.min(100, Math.round((scheme.disbursed_amount / scheme.allocated_budget) * 100))
                : 0;
              const isOverrun = scheme.disbursed_amount > scheme.allocated_budget;

              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{scheme.scheme_name}</span>
                    <span style={{ fontWeight: 700, color: isOverrun ? '#fb7185' : '#38bdf8' }}>
                      {formatINR(scheme.disbursed_amount)} / {formatINR(scheme.allocated_budget)} ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#1e293b', borderRadius: '9999px', overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      backgroundColor: isOverrun ? '#f43f5e' : (pct > 85 ? '#f59e0b' : '#38bdf8'),
                      borderRadius: '9999px',
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.7rem', color: '#64748b' }}>
                    <span>{scheme.department}</span>
                    <span style={{ color: isOverrun ? '#fb7185' : '#10b981' }}>{scheme.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Anomaly Breakdown by Rule */}
        <div className="civic-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>AI Anomaly Classification</h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Algorithmic red flags detected in procurement records</p>
            </div>
            <PieChart size={18} color="#fb7185" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats?.anomaly_type_distribution && Object.keys(stats.anomaly_type_distribution).length > 0 ? (
              Object.entries(stats.anomaly_type_distribution).map(([type, count], idx) => (
                <div key={idx} style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#0d1526',
                  borderRadius: '8px',
                  border: '1px solid #1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f43f5e' }}></div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>{type}</span>
                  </div>
                  <span style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: 'rgba(244, 63, 94, 0.15)',
                    color: '#fb7185'
                  }}>
                    {count} Flagged
                  </span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.85rem' }}>
                No active anomalies identified in current dataset.
              </div>
            )}
          </div>

          {/* Geographic Outflow Snapshot */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={13} color="#38bdf8" />
              <span>State-wise Disbursal Distribution</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {(stats?.state_expenditure || []).slice(0, 6).map((st, i) => (
                <span key={i} style={{
                  fontSize: '0.72rem',
                  padding: '0.3rem 0.6rem',
                  backgroundColor: '#131d33',
                  border: '1px solid #1e2d4d',
                  borderRadius: '6px',
                  color: '#cbd5e1'
                }}>
                  {st.state}: <strong style={{ color: '#38bdf8' }}>{formatINR(st.amount)}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Audited Transactions Table */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>Recent Monitored Transactions</h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Latest public spending records ingested from data.gov.in and e-procurement portals</p>
          </div>
        </div>

        <TransactionTable
          transactions={recentTransactions}
          loading={loading}
          total={stats?.total_transactions || 0}
          limit={6}
          page={1}
        />
      </div>
    </div>
  );
}
