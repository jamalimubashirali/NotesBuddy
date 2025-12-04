import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface InputSectionProps {
    onSubmit: (url: string, language: string, style: string) => void;
    isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onSubmit, isLoading }) => {
    const [url, setUrl] = useState('');
    const [language, setLanguage] = useState('en');
    const [style, setStyle] = useState('detailed');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            onSubmit(url, language, style);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-gray-900/5 p-2">
                    <div className="flex items-center">
                        <div className="flex items-center pl-4 pointer-events-none">
                            <Search className={`w-5 h-5 ${isLoading ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
                        </div>
                        <input
                            type="text"
                            className="block w-full p-4 pl-4 text-base text-gray-900 bg-transparent border-none focus:ring-0 placeholder-gray-400 dark:text-white dark:placeholder-gray-500"
                            placeholder="Paste YouTube Video URL here..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 p-2 border-t border-gray-100 dark:border-gray-700">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            disabled={isLoading}
                            className="block w-full sm:w-auto px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="it">Italian</option>
                            <option value="pt">Portuguese</option>
                            <option value="hi">Hindi</option>
                            <option value="zh">Chinese</option>
                            <option value="ja">Japanese</option>
                        </select>

                        <select
                            value={style}
                            onChange={(e) => setStyle(e.target.value)}
                            disabled={isLoading}
                            className="block w-full sm:w-auto px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        >
                            <option value="detailed">Detailed Notes</option>
                            <option value="summary">Summary</option>
                            <option value="bullet points">Bullet Points</option>
                        </select>

                        <button
                            type="submit"
                            disabled={isLoading || !url.trim()}
                            className="ml-auto inline-flex items-center justify-center px-6 py-2 text-sm font-semibold text-white transition-all duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg w-full sm:w-auto"
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
