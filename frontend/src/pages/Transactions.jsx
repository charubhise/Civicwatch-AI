import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import TransactionTable, { formatINR } from '../components/TransactionTable';
import { api } from '../services/api';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [anomalyOnly, setAnomalyOnly] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [page, department, riskLevel, anomalyOnly]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        department: department || undefined,
        risk_level: riskLevel || undefined,
        is_anomaly: anomalyOnly ? true : undefined
      };
      const data = await api.getTransactions(params);
      setTransactions(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const exportToCSV = () => {
    if (transactions.length === 0) return;
    const headers = ["Reference ID", "Scheme", "Department", "Vendor", "GSTIN", "Amount (INR)", "Sanctioned Budget", "Date", "Risk Level", "Is Anomaly", "Anomaly Type"];
    const rows = transactions.map(t => [
      t.reference_id,
      `"${t.scheme_name}"`,
      `"${t.department}"`,
      `"${t.vendor_name}"`,
      t.vendor_gst,
      t.amount,
      t.allocated_budget,
      t.transaction_date,
      t.risk_level,
      t.is_anomaly ? "YES" : "NO",
      `"${t.anomaly_type}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `civicwatch_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Top Filter Bar */}
      <div className="civic-card" style={{ padding: '1.25rem 1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <input
              type="text"
              placeholder="Search voucher #, vendor name, scheme, or GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="civic-input"
              style={{ width: '100%', paddingLeft: '2.2rem' }}
            />
            <Search size={15} color="#64748b" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Department Filter */}
          <select
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
            className="civic-input"
            style={{ flex: '0 1 200px' }}
          >
            <option value="">All Ministries / Depts</option>
            <option value="Ministry of Housing & Urban Affairs">Housing & Urban Affairs</option>
            <option value="Ministry of Rural Development">Rural Development</option>
            <option value="Ministry of Jal Shakti">Jal Shakti (Water)</option>
            <option value="Ministry of Health & Family Welfare">Health & Family Welfare</option>
            <option value="Ministry of Heavy Industries">Heavy Industries</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskLevel}
            onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }}
            className="civic-input"
            style={{ flex: '0 1 150px' }}
          >
            <option value="">All Risk Levels</option>
            <option value="Critical">Critical Risk</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk (Compliant)</option>
          </select>

          {/* Toggle Anomaly Only */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={anomalyOnly}
              onChange={(e) => { setAnomalyOnly(e.target.checked); setPage(1); }}
              style={{ accentColor: '#f43f5e', width: '16px', height: '16px' }}
            />
            <span>Flagged Anomalies Only</span>
          </label>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
            <button type="submit" className="btn-primary" style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}>
              <Search size={14} />
              <span>Filter</span>
            </button>

            <button
              type="button"
              onClick={exportToCSV}
              className="btn-secondary"
              style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <TransactionTable
        transactions={transactions}
        loading={loading}
        total={total}
        limit={limit}
        page={page}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
