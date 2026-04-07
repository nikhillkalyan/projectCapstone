import api from './api';

export const getInstructorStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
};

export const getInstructors = async (status = '', search = '') => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const response = await api.get(`/admin/instructors?${params.toString()}`);
    return response.data;
};

export const getInstructor = async (id) => {
    const response = await api.get(`/admin/instructors/${id}`);
    return response.data;
};

export const approveInstructor = async (id) => {
    const response = await api.put(`/admin/instructors/${id}/approve`);
    return response.data;
};

export const rejectInstructor = async (id, reason) => {
    const response = await api.put(`/admin/instructors/${id}/reject`, { reason });
    return response.data;
};

export const flagInstructor = async (id, message, documentIds) => {
    const response = await api.put(`/admin/instructors/${id}/flag`, { message, documentIds });
    return response.data;
};

export const getMessages = async (id) => {
    const response = await api.get(`/admin/instructors/${id}/messages`);
    return response.data;
};

export const sendMessage = async (id, message) => {
    const response = await api.post(`/admin/instructors/${id}/messages`, { message });
    return response.data;
};

export const saveNote = async (id, note) => {
    const response = await api.post(`/admin/instructors/${id}/notes`, { note });
    return response.data;
};

export const getAuditLog = async (id) => {
    const response = await api.get(`/admin/instructors/${id}/audit`);
    return response.data;
};