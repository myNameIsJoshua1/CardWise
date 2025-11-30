import api from './api';

export const sessionService = {
  async sessionLogin(email, password, role = 'user') {
    const response = await api.post('/session/login', {
      email,
      password,
      role
    });
    return response.data;
  },

  async sessionLogout() {
    const response = await api.post('/session/logout');
    // Clear localStorage after logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
  },

  async validateSession() {
    const response = await api.get('/session/validate');
    return response.data;
  },

  async getSessionInfo() {
    const response = await api.get('/session/info');
    return response.data;
  },

  isSessionActive() {
    const user = localStorage.getItem('user');
    return user !== null;
  },

  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
  }
};
