import axios from 'axios';
import type {
  DiabetesInput,
  HeartInput,
  ParkinsonsInput,
  CancerInput,
  KidneyInput,
  PredictionResponse,
  HealthResponse,
  ChatResponse,
} from './types';

// This will use the value from .env (VITE_API_URL) or fallback to localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkHealth = () => apiClient.get<HealthResponse>('/health');
export const predictDiabetes = (data: DiabetesInput) => apiClient.post<PredictionResponse>('/predict/diabetes', data);
export const predictHeart = (data: HeartInput) => apiClient.post<PredictionResponse>('/predict/heart', data);
export const predictParkinsons = (data: ParkinsonsInput) => apiClient.post<PredictionResponse>('/predict/parkinsons', data);
export const predictCancer = (data: CancerInput) => apiClient.post<PredictionResponse>('/predict/cancer', data);
export const predictKidney = (data: KidneyInput) => apiClient.post<PredictionResponse>('/predict/kidney', data);
export const sendChatMessage = (message: string) => apiClient.post<ChatResponse>('/chat', { message });

export default apiClient;
