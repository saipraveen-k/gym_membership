import api from './api';

export const getDashboardStats = () =>
  api.get('/admin/dashboard/stats').then((r) => r.data);

export const getUsers = (params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== '' && v !== 'all'
    )
  );
  return api.get('/admin/users', { params: clean }).then((r) => r.data);
};

export const getUserById = (id) => api.get(`/admin/users/${id}`).then((r) => r.data);

export default { getDashboardStats, getUsers, getUserById };
