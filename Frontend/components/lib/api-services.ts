import api from './api';

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

// NGO services
export const ngoService = {
  getAll: async () => {
    const response = await api.get('/ngos');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/ngos/${id}`);
    return response.data;
  },
};

// Campaign services
export const campaignService = {
  getAll: async () => {
    const response = await api.get('/campaigns');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  },
};

// Donation services
export const donationService = {
  create: async (donationData: any) => {
    const response = await api.post('/donations', donationData);
    return response.data;
  },
  getByUser: async () => {
    const response = await api.get('/donations/user');
    return response.data;
  },
};

// Event services
export const eventService = {
  getAll: async () => {
    const response = await api.get('/events');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
}; 