import api from './api';

export const getFinalMarksSheets = (status) =>
  api.get('/marks/uni-admin/final-sheets', {
    params: status && status !== 'ALL' ? { status } : {},
  });

export const getFinalMarksSheetDetail = (courseId) =>
  api.get(`/marks/uni-admin/course/${courseId}/final-sheet`);

export const approveFinalMarksSheet = (courseId) =>
  api.post(`/marks/uni-admin/course/${courseId}/final-sheet/approve`);

export const returnFinalMarksSheet = (courseId, reason) =>
  api.post(`/marks/uni-admin/course/${courseId}/final-sheet/return`, { reason });

export const getCertificateRecords = () =>
  api.get('/marks/uni-admin/certificates');

export const getFinalMarksHistory = () =>
  api.get('/marks/uni-admin/final-sheets/history');
