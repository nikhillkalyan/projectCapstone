import api from '../../lib/api';

export async function fetchProjectSpace(courseId) {
  const response = await api.get(`/project-space/${courseId}`);
  return response.data;
}

export async function createProjectSpace(courseId, payload) {
  const response = await api.post(`/project-space/${courseId}`, payload);
  return response.data;
}

export async function resetProjectGroups(courseId) {
  const response = await api.delete(`/project-space/${courseId}/groups`);
  return response.data;
}

export async function formGroupsRandomly(courseId, payload) {
  const response = await api.post(`/project-space/${courseId}/groups/random`, payload);
  return response.data;
}

export async function formGroupsManually(courseId, payload) {
  const response = await api.post(`/project-space/${courseId}/groups/manual`, payload);
  return response.data;
}

export async function fetchInstructorCourseStudents(courseId) {
  const response = await api.get(`/marks/instructor/course/${courseId}/students`);
  return response.data;
}

export async function fetchGitHubActivity(courseId, groupId) {
  const response = await api.get(`/project-space/${courseId}/groups/${groupId}/github`);
  return response.data;
}

export async function reviewProposal(courseId, groupId, payload) {
  const response = await api.put(`/project-space/${courseId}/groups/${groupId}/proposal/review`, payload);
  return response.data;
}

export async function assignProject(courseId, groupId, payload) {
  const response = await api.put(`/project-space/${courseId}/groups/${groupId}/assign`, payload);
  return response.data;
}

export async function linkRepo(courseId, groupId, payload) {
  const response = await api.put(`/project-space/${courseId}/groups/${groupId}/repo`, payload);
  return response.data;
}

export async function fetchStudentGroup(courseId) {
  const response = await api.get(`/project-space/${courseId}/my-group`);
  return response.data;
}

export async function submitProposal(courseId, payload) {
  const response = await api.post(`/project-space/${courseId}/proposal`, payload);
  return response.data;
}

export async function submitReport(courseId, payload) {
  const response = await api.post(`/project-space/${courseId}/report`, payload);
  return response.data;
}
