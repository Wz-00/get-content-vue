// src/services/api.js
import axios from 'axios';
const base = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
const api = axios.create({ baseURL: base, timeout: 60000, headers: { 'Content-Type': 'application/json' } });

export async function fetchInfo(url, provider = 'auto') {
  const resp = await api.post('/info', { url, provider });
  return resp.data;
}

export async function postDownload(url, itag, filename, output = 'mp4', provider = 'auto') {
  const body = { url, itag, filename, output, provider };
  const resp = await api.post('/download', body);
  return resp.data;
}

export async function getJobStatus(jobId) {
  const resp = await api.get(`/job/${encodeURIComponent(jobId)}`);
  return resp.data;
}

export default api;
