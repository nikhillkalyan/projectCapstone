import axiosInstance from '../lib/api';

export const studentSignup = (data) =>
    axiosInstance.post('/auth/student/signup', data);

export const instructorSignup = (data) =>
    axiosInstance.post('/auth/instructor/signup', data);

export const login = (data) =>
    axiosInstance.post('/auth/login', data);

export const getMyProfile = () =>
    axiosInstance.get('/users/me');

export const updateMyProfile = (data) =>
    axiosInstance.put('/users/me', data);
