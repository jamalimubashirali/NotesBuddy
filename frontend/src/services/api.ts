import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/v1';

// Enable cookies for all requests
axios.defaults.withCredentials = true;

// Remove Authorization header interceptor as we use cookies now
// axios.interceptors.request.use((config) => { ... });

// Add interceptor to handle 401 errors and refresh token
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await axios.post(`${API_URL}/auth/refresh-token`);

        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export interface NoteResponse {
  id: number;
  video_id: string;
  title: string;
  notes: string;
  transcript?: string;
  language: string;
  style: string;
  created_at: string;
}

export interface NoteSummary {
  id: number;
  title: string;
  video_id: string;
  created_at: string;
  language: string;
  style: string;
  notes_snippet: string;
}

export const generateNotes = async (url: string, language: string = 'en', style: string = 'detailed'): Promise<NoteResponse> => {
  const response = await axios.post<NoteResponse>(`${API_URL}/notes/generate`, {
    url,
    language,
    style
  });
  return response.data;
};

export const getNotes = async (): Promise<NoteSummary[]> => {
  const response = await axios.get<NoteSummary[]>(`${API_URL}/notes/`);
  return response.data;
};

export const getNoteById = async (id: number): Promise<NoteResponse> => {
  const response = await axios.get<NoteResponse>(`${API_URL}/notes/${id}`);
  return response.data;
};

export const exportToPDF = async (notes: string): Promise<Blob> => {
  const response = await axios.post(`${API_URL}/exports/export/pdf`, { notes }, {
    responseType: 'blob'
  });
  return response.data;
};

export const login = async (data: any) => {
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

export const logout = async () => {
  const response = await axios.post(`${API_URL}/auth/logout`);
  return response.data;
};

export const chatWithNote = async (noteId: number, message: string): Promise<ReadableStream<Uint8Array>> => {
  const response = await fetch(`${API_URL}/notes/${noteId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Send cookies
    body: JSON.stringify({ message })
  });

  if (response.status === 401) {
    // Try to refresh token if fetch fails (fetch doesn't use axios interceptors)
    try {
      await axios.post(`${API_URL}/auth/refresh-token`);
      // Retry the fetch (recursive call)
      return chatWithNote(noteId, message);
    } catch (e) {
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  return response.body;
};

// Chat History
export const getChatHistory = async (noteId: number) => {
  const response = await axios.get(`${API_URL}/notes/${noteId}/chat/history`);
  return response.data;
};

// Token Usage
export const getTokenUsage = async () => {
  const response = await axios.get(`${API_URL}/auth/token-usage`);
  return response.data;
};
