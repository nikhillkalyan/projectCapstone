import axiosInstance from '../lib/api';

export const getAllCourses = (params) =>
    axiosInstance.get('/courses', { params });
    // params = { category, level, search }

export const getCourseById = (courseId) =>
    axiosInstance.get(`/courses/${courseId}`);

export const createCourse = (data) =>
    axiosInstance.post('/courses', data);

export const updateCourse = (courseId, data) =>
    axiosInstance.put(`/courses/${courseId}`, data);

export const deleteCourse = (courseId) =>
    axiosInstance.delete(`/courses/${courseId}`);

export const getCoursesByInstructor = (instructorId) =>
    axiosInstance.get(`/courses/instructor/${instructorId}`);

export const getChapters = (courseId) =>
    axiosInstance.get(`/courses/${courseId}/chapters`);

export const addChapter = (courseId, data) =>
    axiosInstance.post(`/courses/${courseId}/chapters`, data);

export const updateChapter = (courseId, chapterId, data) =>
    axiosInstance.put(`/courses/${courseId}/chapters/${chapterId}`, data);

export const addChapterAssessment = (courseId, chapterId, data) =>
    axiosInstance.post(`/courses/${courseId}/chapters/${chapterId}/assessment`, data);

export const addGrandAssessment = (courseId, data) =>
    axiosInstance.post(`/courses/${courseId}/chapters/grand-assessment`, data);

export const submitReview = (courseId, data) =>
    axiosInstance.post(`/courses/${courseId}/reviews`, data);
