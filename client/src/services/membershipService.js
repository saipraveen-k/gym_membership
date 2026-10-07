import api from './api';

/**
 * Public membership endpoints.
 * params: { search, category, minPrice, maxPrice, duration, sort }
 */
export const getMemberships = (params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== '' && v !== 'all'
    )
  );
  return api.get('/memberships', { params: clean }).then((r) => r.data);
};

export const getMembershipById = (id) =>
  api.get(`/memberships/${id}`).then((r) => r.data);

/** Admin CRUD */
export const getAdminMemberships = (params = {}) =>
  api.get('/admin/memberships', { params }).then((r) => r.data);

export const createMembership = (data) =>
  api.post('/admin/memberships', data).then((r) => r.data);

export const updateMembership = (id, data) =>
  api.put(`/admin/memberships/${id}`, data).then((r) => r.data);

export const deleteMembership = (id) =>
  api.delete(`/admin/memberships/${id}`).then((r) => r.data);

export default {
  getMemberships,
  getMembershipById,
  getAdminMemberships,
  createMembership,
  updateMembership,
  deleteMembership,
};
