import api from './api'

export const authService = {
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  getProfile: () => api.get('/users/profile').then((r) => r.data),
  updateProfile: (payload) => api.put('/users/profile', payload).then((r) => r.data),
  changePassword: (payload) => api.put('/users/change-password', payload),
}
