import axiosInstance from '../lib/api';

export const getChatHistory = (courseId, otherUserId) =>
    axiosInstance.get(`/messages/${courseId}/${otherUserId}`);

export const sendMessage = (data) =>
    axiosInstance.post('/messages', data);
