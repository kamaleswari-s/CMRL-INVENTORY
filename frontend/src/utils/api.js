import axios from 'axios';

const API = axios.create({
  baseURL: 'https://cmrl-inventory-production.up.railway.app/api',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);

export const getComponents = () => API.get('/components');
export const getComponentsByCategory = (category) => API.get(`/components/category/${category}`);
export const getComponent = (id) => API.get(`/components/${id}`);
export const createComponent = (data) => API.post('/components', data);
export const updateComponent = (id, data) => API.put(`/components/${id}`, data);
export const deleteComponent = (id) => API.delete(`/components/${id}`);

export const createTransaction = (data) => API.post('/transactions', data);
export const getComponentTransactions = (id) => API.get(`/transactions/component/${id}`);
export const getAllTransactions = () => API.get('/transactions/audit/all');

export const searchComponents = (q) => API.get(`/search?q=${q}`);

export const getDashboardStats = () => API.get('/dashboard/stats');

export const getUsers = () => API.get('/users');
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const updatePassword = (id, data) => API.put(`/users/${id}/password`, data);

export default API;