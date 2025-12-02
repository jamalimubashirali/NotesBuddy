import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

// Add interceptor to include token in requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface NoteResponse {
  video_id: string;
  notes: string;
}

export const generateNotes = async (url: string): Promise<NoteResponse> => {
  const response = await axios.post(`${API_URL}/notes/generate`, { url });
  return response.data;
};

export const exportToPDF = async (notes: string): Promise<Blob> => {
  const response = await axios.post(`${API_URL}/exports/export/pdf`, { notes }, {
    responseType: 'blob'
  });
  return response.data;
};

export const login = async (data: any) => {
  const formData = new URLSearchParams();
  formData.append('username', data.email); // OAuth2PasswordRequestForm expects 'username'
  formData.append('password', data.password);

  // We need to send as form data for OAuth2PasswordRequestForm
  const response = await axios.post(`${API_URL}/auth/login`, {
    email: data.email,
    password: data.password
  });
  return response.data;
};

export const register = async (data: any) => {
  const response = await axios.post(`${API_URL}/auth/register`, data);
  return response.data;
};
