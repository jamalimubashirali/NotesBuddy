import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Enable cookies for all requests
axios.defaults.withCredentials = true;

// Token refresh queue to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let refreshSubscribers: Array<(error?: any) => void> = [];
let refreshFailed = false; // Track if refresh token is invalid

// Subscribe to token refresh completion
const subscribeTokenRefresh = (callback: (error?: any) => void) => {
  refreshSubscribers.push(callback);
};

// Notify all subscribers when refresh completes
const onRefreshed = (error?: any) => {
  refreshSubscribers.forEach((callback) => callback(error));
  refreshSubscribers = [];
};

// Add interceptor to handle 401 errors and refresh token
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      // If we already know refresh token is invalid, fail immediately
      if (refreshFailed) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((error) => {
            if (error) {
              reject(error);
            } else {
              resolve(axios(originalRequest));
            }
          });
        });
      }

      isRefreshing = true;

      try {
        // Try to refresh the token
        await axios.post(`${API_URL}/auth/refresh-token`);
        isRefreshing = false;
        refreshFailed = false; // Reset flag on success
        onRefreshed();
        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshFailed = true; // Mark that refresh token is invalid
        onRefreshed(refreshError); // Notify all queued requests with error
        // Let React Router handle navigation via AuthContext
        // Don't use window.location.href as it conflicts with React state
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

// Type definitions for auth
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  message: string;
  user: {
    email: string;
    username: string;
  };
}

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

export const generateNotes = async (
  url: string,
  language: string = "en",
  style: string = "detailed",
  retryCount = 0,
): Promise<ReadableStream<Uint8Array>> => {
  const response = await fetch(`${API_URL}/notes/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Send cookies for authentication
    body: JSON.stringify({ url, language, style }),
  });

  // Handle 401 with single retry
  if (response.status === 401 && retryCount === 0) {
    try {
      // Wait if refresh is already in progress
      if (isRefreshing) {
        await new Promise<void>((resolve) => {
          subscribeTokenRefresh(() => resolve());
        });
      } else {
        // Refresh the token
        isRefreshing = true;
        await axios.post(`${API_URL}/auth/refresh-token`);
        isRefreshing = false;
        onRefreshed();
      }
      // Retry once with incremented counter
      return generateNotes(url, language, style, retryCount + 1);
    } catch (e) {
      isRefreshing = false;
      refreshSubscribers = [];
      throw new Error("Unauthorized");
    }
  }

  // Handle other HTTP errors
  if (!response.ok) {
    let errorMessage = "An error occurred while generating notes";
    try {
      const errorData = await response.json();
      // Extract detail message if available
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (e) {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  if (!response.body) {
    throw new Error("No response body");
  }

  return response.body;
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
  const response = await axios.post(
    `${API_URL}/exports/export/pdf`,
    { notes },
    {
      responseType: "blob",
    },
  );
  return response.data;
};

export const login = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(
    `${API_URL}/auth/login`,
    credentials,
  );
  // Reset refresh failure state on successful login
  refreshFailed = false;
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(
    `${API_URL}/auth/register`,
    data,
  );
  return response.data;
};

export const logout = async () => {
  const response = await axios.post(`${API_URL}/auth/logout`);
  return response.data;
};

export const chatWithNote = async (
  noteId: number,
  message: string,
  retryCount = 0,
): Promise<ReadableStream<Uint8Array>> => {
  const response = await fetch(`${API_URL}/notes/${noteId}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Send cookies
    body: JSON.stringify({ message }),
  });

  // Handle 401 with single retry
  if (response.status === 401 && retryCount === 0) {
    try {
      // Wait if refresh is already in progress
      if (isRefreshing) {
        await new Promise<void>((resolve) => {
          subscribeTokenRefresh(() => resolve());
        });
      } else {
        // Refresh the token
        isRefreshing = true;
        await axios.post(`${API_URL}/auth/refresh-token`);
        isRefreshing = false;
        onRefreshed("refreshed");
      }
      // Retry once with incremented counter
      return chatWithNote(noteId, message, retryCount + 1);
    } catch (e) {
      isRefreshing = false;
      refreshSubscribers = [];
      // Let React Router handle navigation via AuthContext
      throw new Error("Unauthorized");
    }
  }

  // Handle other HTTP errors
  if (!response.ok) {
    let errorMessage = "An error occurred while chatting";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (e) {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  if (!response.body) {
    throw new Error("No response body");
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

export const getLimits = async () => {
  const response = await axios.get(`${API_URL}/notes/limits/usage`);
  return response.data;
};

export const getMe = async () => {
  const response = await axios.get(`${API_URL}/auth/me`);
  return response.data;
};
