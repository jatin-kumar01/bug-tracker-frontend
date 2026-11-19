import axiosClient from './axiosClient';

export const authApi = {
  register: (data) => axiosClient.post('/auth/register', data),
  login: (data) => axiosClient.post('/auth/login', data),
  logout: () => axiosClient.post('/auth/logout'),
  me: () => axiosClient.get('/auth/me'),
};

export const userApi = {
  getAll: () => axiosClient.get('/users'),
  getById: (id) => axiosClient.get(`/users/${id}`),
  create: (data) => axiosClient.post('/users', data),
  update: (id, data) => axiosClient.put(`/users/${id}`, data),
  updateRole: (id, role) => axiosClient.patch(`/users/${id}/role`, { role }),
  deactivate: (id) => axiosClient.delete(`/users/${id}`),
};

export const projectApi = {
  getAll: () => axiosClient.get('/projects'),
  getById: (id) => axiosClient.get(`/projects/${id}`),
  create: (data) => axiosClient.post('/projects', data),
  update: (id, data) => axiosClient.put(`/projects/${id}`, data),
  delete: (id) => axiosClient.delete(`/projects/${id}`),
  getMembers: (id) => axiosClient.get(`/projects/${id}/members`),
  addMember: (id, data) => axiosClient.post(`/projects/${id}/members`, data),
  removeMember: (id, userId) => axiosClient.delete(`/projects/${id}/members/${userId}`),
  getBoard: (projectId) => axiosClient.get(`/projects/${projectId}/board`),
};

export const issueApi = {
  getAll: (params) => axiosClient.get('/issues', { params }),
  getById: (id) => axiosClient.get(`/issues/${id}`),
  create: (data) => axiosClient.post('/issues', data),
  update: (id, data) => axiosClient.put(`/issues/${id}`, data),
  updateStatus: (id, status) => axiosClient.patch(`/issues/${id}/status`, { status }),
  assign: (id, assigneeId) => axiosClient.patch(`/issues/${id}/assignee`, { assigneeId }),
  delete: (id) => axiosClient.delete(`/issues/${id}`),
};

export const commentApi = {
  getByIssue: (issueId) => axiosClient.get(`/issues/${issueId}/comments`),
  add: (issueId, content) => axiosClient.post(`/issues/${issueId}/comments`, { content }),
  update: (commentId, content) => axiosClient.put(`/comments/${commentId}`, { content }),
  delete: (commentId) => axiosClient.delete(`/comments/${commentId}`),
};

export const attachmentApi = {
  getByIssue: (issueId) => axiosClient.get(`/issues/${issueId}/attachments`),
  upload: (issueId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(`/issues/${issueId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  download: (attachmentId) =>
    axiosClient.get(`/attachments/${attachmentId}/download`, { responseType: 'blob' }),
};
