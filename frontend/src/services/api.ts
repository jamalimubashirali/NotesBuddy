import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export interface NoteResponse {
  video_id: string;
  notes: string;
}

export const generateNotes = async (url: string): Promise<NoteResponse> => {
  const response = await axios.post(`${API_URL}/notes/generate`, { url });
  return response.data;
};
