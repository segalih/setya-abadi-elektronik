import api from './api';
import { useAuthStore } from '@/store/authStore';

export const authService = {
  async login(credentials: any) {
    const response = await api.post('/login', credentials);
    return response.data;
  },
  
  async register(data: any) {
    const response = await api.post('/register', data);
    return response.data;
  },
  
  async getMe() {
    const response = await api.get('/me');
    return response.data;
  },

  async logout() {
    // Optional: call API logout if exists
    useAuthStore.getState().logout();
  }
};
