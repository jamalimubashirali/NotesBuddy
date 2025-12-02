import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface InputSectionProps {
    onSubmit: (url: string) => void;
    isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onSubmit, isLoading }) => {
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            onSubmit(url);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-gray-900/5">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Search className={`w-5 h-5 ${isLoading ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
                    </div>
                    <input
                        type="text"
                        className="block w-full p-5 pl-12 text-base text-gray-900 bg-transparent border-none rounded-xl focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:text-white dark:placeholder-gray-500"
                        placeholder="Paste YouTube Video URL here (e.g., https://youtube.com/watch?v=...)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isLoading}
                    />
                    <div className="absolute right-2.5">
                        <button
                            type="submit"
                            disabled={isLoading || !url.trim()}
                            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                'Generate Notes'
                            )}
                        </button>
                    </div>
                </div>
            </form>
            <p className="mt-3 text-sm text-center text-gray-500 dark:text-gray-400">
                Supports standard YouTube videos. Shorts and playlists coming soon.
            </p>
        </div>
    );
};
