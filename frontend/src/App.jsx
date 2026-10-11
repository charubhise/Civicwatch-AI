import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import UploadPanel from './components/UploadPanel';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Anomalies from './pages/Anomalies';
import Reports from './pages/Reports';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('sync'); // 'sync' | 'upload'
  const [stats, setStats] = useState(null);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [dataVersion, setDataVersion] = useState(1);

  useEffect(() => {
    fetchGlobalStats();
  }, [dataVersion]);

  const fetchGlobalStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load global stats:', err);
    }
  };

  const handleOpenSync = () => {
    setModalMode('sync');
    setIsModalOpen(true);
  };

  const handleOpenUpload = () => {
    setModalMode('upload');
    setIsModalOpen(true);
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset CivicWatch database to baseline data.gov.in public spending datasets?')) {
      return;
    }
    setLoadingDemo(true);
    try {
      await api.resetDemoData();
      setDataVersion(prev => prev + 1);
    } catch (err) {
      console.error('Failed to reset demo:', err);
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleDataChange = () => {
    setDataVersion(prev => prev + 1);
  };

  const pageHeaders = {
    dashboard: {
      title: 'National Civic Spending Oversight Dashboard',
      subtitle: 'Continuous fiscal auditing & Benford anomaly detection over data.gov.in public funds'
    },
    transactions: {
      title: 'Audited Civic Transactions Ledger',
      subtitle: 'Complete registry of government tenders, vouchers, contractors, and GSTIN verifications'
    },
    anomalies: {
      title: 'AI Anomaly & Forensic Fraud Inspector',
      subtitle: 'Benford’s first-digit distribution analysis, split billing red flags, and duplicate detection'
    },
    reports: {
      title: 'Statutory Civic Audit & Reconciliation Dossier',
      subtitle: 'Departmental fiscal governance scorecard, budget variance ledgers, and compliance advisories'
    }
  };

  const currentHeader = pageHeaders[activeTab] || pageHeaders.dashboard;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0f1d' }}>
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSync={handleOpenSync}
        onResetDemo={handleResetDemo}
        loadingDemo={loadingDemo}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        <Header
          title={currentHeader.title}
          subtitle={currentHeader.subtitle}
          onOpenUpload={handleOpenUpload}
          onOpenSync={handleOpenSync}
          stats={stats}
        />

        <main style={{ flex: 1 }}>
          {activeTab === 'dashboard' && (
            <Dashboard 
              key={`dash-${dataVersion}`}
              onOpenSync={handleOpenSync} 
              onOpenUpload={handleOpenUpload} 
            />
          )}
          {activeTab === 'transactions' && (
            <Transactions 
              key={`tx-${dataVersion}`} 
            />
          )}
          {activeTab === 'anomalies' && (
            <Anomalies 
              key={`anom-${dataVersion}`} 
            />
          )}
          {activeTab === 'reports' && (
            <Reports 
              key={`rep-${dataVersion}`} 
            />
          )}
        </main>
      </div>

      {/* Upload & data.gov.in Synchronizer Modal */}
      <UploadPanel
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        onSuccess={() => {
          handleDataChange();
        }}
      />
    </div>
  );
}
