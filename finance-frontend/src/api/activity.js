import api from './axios';
export const getActivityLogs = () => api.get('/activity');
