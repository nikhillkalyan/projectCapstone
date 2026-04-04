import api from './api';

export const loginAdmin = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const logoutAdmin = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
};