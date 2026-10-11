import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const api = {
  // System Health
  getHealth: async () => {
    const res = await client.get('/health');
    return res.data;
  },

  // Dashboard Statistics
  getStats: async () => {
    const res = await client.get('/stats');
    return res.data;
  },

  // Transactions
  getTransactions: async (params = {}) => {
    const res = await client.get('/transactions', { params });
    return res.data;
  },

  createTransaction: async (data) => {
    const res = await client.post('/transactions', data);
    return res.data;
  },

  // Budget Reconciliation
  getReconciliation: async () => {
    const res = await client.get('/reconciliation');
    return res.data;
  },

  triggerReconciliation: async () => {
    const res = await client.post('/reconciliation/run');
    return res.data;
  },

  // AI Anomalies
  getAnomalies: async () => {
    const res = await client.get('/anomalies');
    return res.data;
  },

  getBenfordAnalysis: async () => {
    const res = await client.get('/anomalies/benford');
    return res.data;
  },

  resolveAnomaly: async (reportId, payload) => {
    const res = await client.post(`/anomalies/${reportId}/resolve`, payload);
    return res.data;
  },

  // Civic Audit Report
  getAuditReport: async () => {
    const res = await client.get('/reports');
    return res.data;
  },

  // data.gov.in Integration
  getDataGovDatasets: async () => {
    const res = await client.get('/datagov/datasets');
    return res.data;
  },

  syncDataGov: async (payload) => {
    const res = await client.post('/datagov/sync', payload);
    return res.data;
  },

  resetDemoData: async () => {
    const res = await client.post('/datagov/seed-demo');
    return res.data;
  },

  // File Upload
  uploadFile: async (formData) => {
    const res = await client.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};

export default api;
