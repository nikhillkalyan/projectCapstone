import axiosInstance from '../lib/api';

export const getStudentMarks = (courseId) =>
  axiosInstance.get(`/marks/student/course/${courseId}`);

export const getApprovedFinalMarks = (courseId) =>
  axiosInstance.get(`/marks/student/course/${courseId}/final-sheet/approved`);

export const getInstructorFinalMarksSheet = (courseId) =>
  axiosInstance.get(`/marks/instructor/course/${courseId}/final-sheet`);

export const saveInstructorFinalMarksSheet = (courseId, rows) =>
  axiosInstance.put(`/marks/instructor/course/${courseId}/final-sheet`, { rows });

export const submitInstructorFinalMarksSheet = (courseId) =>
  axiosInstance.post(`/marks/instructor/course/${courseId}/final-sheet/submit`);
