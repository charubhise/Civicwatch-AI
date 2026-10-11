import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  RefreshCw,
  Download,
  Key,
  Globe
} from 'lucide-react';
import { api } from '../services/api';

export default function UploadPanel({ isOpen, onClose, mode = 'sync', onSuccess }) {
  const [activeTab, setActiveTab] = useState(mode); // 'sync' | 'upload'
  const [loading, setLoading] = useState(false);
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setActiveTab(mode);
    setFeedback(null);
    if (isOpen) {
      loadDatasets();
    }
  }, [isOpen, mode]);

  const loadDatasets = async () => {
    try {
      const data = await api.getDataGovDatasets();
      setDatasets(data);
      if (data.length > 0 && !selectedDatasetId) {
        setSelectedDatasetId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load datasets:', err);
    }
  };

  if (!isOpen) return null;

  const handleSync = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const selected = datasets.find(d => d.id === selectedDatasetId);
      const res = await api.syncDataGov({
        api_key: apiKey.trim() || undefined,
        resource_id: selected ? selected.resource_id : undefined,
        dataset_title: selected ? selected.title : undefined,
        records_limit: 15
      });
      setFeedback({
        type: 'success',
        message: res.message,
        details: `Synced ${res.records_synced} items with ${res.anomalies_detected} anomalies flagged.`
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to sync with data.gov.in.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.uploadFile(formData);
      setFeedback({
        type: 'success',
        message: res.message,
        details: `Imported ${res.records_imported} transactions. Found ${res.anomalies_detected} anomalies.`
      });
      setFile(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to process dataset file.'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = `reference_id,department,scheme_name,vendor_name,vendor_gst,amount,allocated_budget,transaction_date,category,state,district
PWD/2026/091,Ministry of Road Transport & Highways,National Highway Upgrades,Apex Infrabuild Ltd,27AAACA9921D1Z2,14500000,40000000,2026-03-01,Highways,Maharashtra,Nashik
PWD/2026/092,Ministry of Road Transport & Highways,National Highway Upgrades,Apex Infrabuild Ltd,27AAACA9921D1Z2,14500000,40000000,2026-03-01,Highways,Maharashtra,Nashik
UDD/2026/110,Ministry of Housing & Urban Affairs,Smart City Drainage,Kaveri Sanitation Corp,29AAACK3321N1Z5,498000,20000000,2026-03-02,Sanitation,Karnataka,Bengaluru
UDD/2026/111,Ministry of Housing & Urban Affairs,Smart City Drainage,Kaveri Sanitation Corp,29AAACK3321N1Z5,495000,20000000,2026-03-03,Sanitation,Karnataka,Bengaluru
MOH/2026/301,Ministry of Health & Family Welfare,District Hospital ICU,Zenith Meditech,99INVALIDGST999,6200000,15000000,2026-03-04,Healthcare,Delhi,New Delhi`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_civic_expenditure_data_gov.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
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
      <div className="civic-card" style={{ maxWidth: '620px', width: '100%', padding: '1.5rem', border: '1px solid #334155' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
              Civic Data Ingestion Gateway
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Direct connection with https://data.gov.in & CSV/JSON audit ledgers
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', margin: '1.25rem 0 1rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => { setActiveTab('sync'); setFeedback(null); }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: activeTab === 'sync' ? '#1e293b' : 'transparent',
              color: activeTab === 'sync' ? '#38bdf8' : '#94a3b8',
              border: activeTab === 'sync' ? '1px solid #334155' : '1px solid transparent',
              cursor: 'pointer'
            }}
          >
            <Globe size={15} />
            <span>data.gov.in Live Sync</span>
          </button>

          <button
            onClick={() => { setActiveTab('upload'); setFeedback(null); }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: activeTab === 'upload' ? '#1e293b' : 'transparent',
              color: activeTab === 'upload' ? '#38bdf8' : '#94a3b8',
              border: activeTab === 'upload' ? '1px solid #334155' : '1px solid transparent',
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={15} />
            <span>Upload CSV / JSON File</span>
          </button>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            backgroundColor: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem'
          }}>
            {feedback.type === 'success' ? <CheckCircle2 size={18} color="#34d399" /> : <AlertCircle size={18} color="#fb7185" />}
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: feedback.type === 'success' ? '#34d399' : '#fb7185' }}>
                {feedback.message}
              </div>
              {feedback.details && (
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                  {feedback.details}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sync Tab Form */}
        {activeTab === 'sync' ? (
          <form onSubmit={handleSync} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                Select Open Government Dataset (data.gov.in)
              </label>
              <select
                value={selectedDatasetId}
                onChange={(e) => setSelectedDatasetId(e.target.value)}
                className="civic-input"
                style={{ width: '100%' }}
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id} style={{ backgroundColor: '#0f172a' }}>
                    {d.title} ({d.ministry})
                  </option>
                ))}
              </select>
              <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.35rem' }}>
                {datasets.find(d => d.id === selectedDatasetId)?.description || ''}
              </p>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                <span>data.gov.in API Key (Optional)</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 400 }}>Auto-fallback to verified OGD dataset enabled</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="e.g. 579b464db66ec23bdd000001..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="civic-input"
                  style={{ width: '100%', paddingLeft: '2.2rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}
                />
                <Key size={14} color="#64748b" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#0d1526', borderRadius: '8px', border: '1px solid #1e293b', fontSize: '0.75rem', color: '#94a3b8' }}>
              <strong>Automated Anomaly Audit:</strong> Ingested data will immediately undergo Benford's first-digit distribution check, GSTIN validation, GFR split-billing audit, and scheme budget reconciliation.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary">
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                <span>{loading ? 'Connecting & Syncing...' : 'Sync From data.gov.in'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* File Upload Tab */
          <form onSubmit={handleFileUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              border: '2px dashed #2d3e5f',
              borderRadius: '10px',
              padding: '2rem 1rem',
              textAlign: 'center',
              backgroundColor: '#0c1322',
              cursor: 'pointer',
              position: 'relative'
            }}>
              <input
                type="file"
                accept=".csv,.json"
                onChange={(e) => setFile(e.target.files[0])}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%'
                }}
              />
              <Upload size={32} color="#38bdf8" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
                {file ? file.name : 'Click or drag public expenditure CSV or JSON'}
              </div>
              <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>
                Supports standard data.gov.in schemas or custom public vouchers
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', backgroundColor: '#0d1526', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Need an audit template?</span>
              <button
                type="button"
                onClick={downloadSampleCSV}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <Download size={13} />
                <span>Download Sample CSV</span>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={!file || loading} className="btn-primary">
                <Upload size={15} />
                <span>{loading ? 'Processing Ledger...' : 'Upload & Reconcile'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
