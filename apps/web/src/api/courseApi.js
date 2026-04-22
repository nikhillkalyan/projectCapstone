import axiosInstance from '../lib/api';

export const getAllCourses = (params) =>
    axiosInstance.get('/courses', { params });

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

export const deleteChapter = (courseId, chapterId) =>
    axiosInstance.delete(`/courses/${courseId}/chapters/${chapterId}`);

export const addChapterAssessment = (courseId, chapterId, data) =>
    axiosInstance.post(`/courses/${courseId}/chapters/${chapterId}/assessment`, data);

export const addGrandAssessment = (courseId, data) =>
    axiosInstance.post(`/courses/${courseId}/chapters/grand-assessment`, data);

export const submitReview = (courseId, data) =>
    axiosInstance.post(`/courses/${courseId}/reviews`, data);

/* ── University Course APIs ── */
export const createUniversityCourse = (data) =>
    axiosInstance.post('/uni-courses', data);

export const getMyUniversityCourses = () =>
    axiosInstance.get('/uni-courses/my-courses');

export const deleteUniversityCourse = (courseId) =>
    axiosInstance.delete(`/uni-courses/${courseId}`);

export const getStudentAllocatedCourses = () =>
    axiosInstance.get('/uni-courses/student/allocated');

export const getUniversityBranches = () =>
    axiosInstance.get('/uni-courses/branches').catch(() =>
        axiosInstance.get('/uni-admin/context/branches')
    );
