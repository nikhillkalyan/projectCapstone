import axiosInstance from '../lib/api';

export const enrollInCourse = (courseId) =>
    axiosInstance.post(`/student/enroll/${courseId}`);

export const getEnrolledCourses = () =>
    axiosInstance.get('/student/enrolled');

export const toggleFavorite = (courseId) =>
    axiosInstance.post(`/student/favorites/${courseId}`);

export const getFavoriteCourses = () =>
    axiosInstance.get('/student/favorites');
