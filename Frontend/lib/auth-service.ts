import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth'; // Change port if your backend runs on a different port

export const authService = {
  // Register a new user
  register: async (data: { name: string; email: string; password: string }) => {
    const response = await axios.post(`${API_URL}/register`, data);
    return response.data;
  },

  // Login user
  login: async (data: { email: string; password: string }) => {
    const response = await axios.post(`${API_URL}/login`, data);
    return response.data;
  },

  // (Optional) Get user profile if you want to use it
  getProfile: async (token: string) => {
    const response = await axios.get(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};