import api from './axios';

export const getRecords = (params) => api.get('/records', { params });
export const getRecord = (id) => api.get(`/records/${id}`);
export const createRecord = (data) => api.post('/records', data);
export const updateRecord = (id, data) => api.put(`/records/${id}`, data);
export const deleteRecord = (id) => api.delete(`/records/${id}`);
export const exportRecordsCSV = (params) =>
  api.get('/records/export', { params, responseType: 'blob' });
