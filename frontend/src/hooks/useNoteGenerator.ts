import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { generateNotes as apiGenerateNotes } from '../services/api';

interface UseNoteGeneratorReturn {
    isLoading: boolean;
    notes: string;
    generateNotes: (url: string, language: string, style: string) => Promise<void>;
    resetNotes: () => void;
    generatedNoteId: number | null;
    error: string | null;
}

export const useNoteGenerator = (): UseNoteGeneratorReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [notes, setNotes] = useState<string>('');
    const [generatedNoteId, setGeneratedNoteId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();

    const resetNotes = () => {
        setNotes('');
        setGeneratedNoteId(null);
        setError(null);
    };

    const generateNotes = async (url: string, language: string, style: string) => {
        if (!isAuthenticated) {
            toast.error('Please login to generate notes');
            return;
        }
        setIsLoading(true);
        setNotes('');
        setError(null);

        try {
            // Use the centralized API function from api.ts
            const stream = await apiGenerateNotes(url, language, style);
            const reader = stream.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);

                // Check for Note ID
                const idMatch = chunk.match(/<!-- NOTE_ID: (\d+) -->/);
                if (idMatch) {
                    setGeneratedNoteId(parseInt(idMatch[1]));
                    // Remove the ID comment from the visible notes
                    const cleanChunk = chunk.replace(/<!-- NOTE_ID: \d+ -->/, '');
                    setNotes(prev => prev + cleanChunk);
                } else {
                    setNotes(prev => prev + chunk);
                }
            }

            toast.success('Notes generated successfully!');
        } catch (error: any) {
            console.error('Error generating notes:', error);

            let errorMessage = error.message || 'Failed to generate notes. Please try again.';

            // Handle specific "Video too long" error from backend
            if (errorMessage.includes('Video is too long') || (error.response?.data?.detail && error.response.data.detail.includes('Video is too long'))) {
                errorMessage = 'Video is too long (> 30 mins). Please use a shorter video.';
            }

            setError(errorMessage);
            toast.error(errorMessage);

            // Don't redirect here - let axios interceptor handle token refresh first
            // If refresh also fails, ProtectedRoute will handle the redirect automatically
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, notes, generateNotes, resetNotes, generatedNoteId, error };
};
