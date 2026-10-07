import api from './api';

/** User endpoints */
export const applyForMembership = (membershipId) =>
  api.post('/applications', { membershipId }).then((r) => r.data);

export const getMyApplications = () => api.get('/applications/my').then((r) => r.data);

export const getApplicationById = (id) =>
  api.get(`/applications/${id}`).then((r) => r.data);

/** Admin endpoints */
export const getAllApplications = (params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== '' && v !== 'all'
    )
  );
  return api.get('/admin/applications', { params: clean }).then((r) => r.data);
};

export const updateApplicationStatus = (id, status) =>
  api.put(`/admin/applications/${id}/status`, { status }).then((r) => r.data);

export const updatePaymentStatus = (id, paymentStatus) =>
  api.put(`/admin/applications/${id}/payment`, { paymentStatus }).then((r) => r.data);

export default {
  applyForMembership,
  getMyApplications,
  getApplicationById,
  getAllApplications,
  updateApplicationStatus,
  updatePaymentStatus,
};
