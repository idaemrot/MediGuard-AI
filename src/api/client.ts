import axios from 'axios';

// Use environment variable with a fallback for local development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mediguard-ai-xibh.onrender.com/';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkHealth = () => apiClient.get('/health');
export const predictDiabetes = (data: any) => apiClient.post('/predict/diabetes', data);
export const predictHeart = (data: any) => apiClient.post('/predict/heart', data);
export const predictParkinsons = (data: any) => apiClient.post('/predict/parkinsons', data);
export const sendChatMessage = (message: string) => apiClient.post('/chat', { message });

export default apiClient;