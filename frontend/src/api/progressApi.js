import axiosInstance from '../lib/api';

export const getCourseProgress = (courseId) =>
    axiosInstance.get(`/progress/${courseId}`);

export const markChapterComplete = (courseId, chapterId) =>
    axiosInstance.post(`/progress/${courseId}/chapters/${chapterId}/complete`);

export const submitChapterAssessment = (courseId, chapterId, data) =>
    axiosInstance.post(`/progress/${courseId}/chapters/${chapterId}/assessment`, data);

export const submitGrandAssessment = (courseId, data) =>
    axiosInstance.post(`/progress/${courseId}/grand-assessment`, data);

export const getStudentsProgress = (courseId) =>
    axiosInstance.get(`/progress/instructor/${courseId}`);
