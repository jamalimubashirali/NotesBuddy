import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNoteGenerator } from '../hooks/useNoteGenerator';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Loader2, AlertCircle, Home } from 'lucide-react';

const GeneratingView: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { generateNotes, notes, generatedNoteId, error, isLoading } = useNoteGenerator();
    const hasStartedRef = React.useRef(false);

    const { url, language, style } = location.state || {};

    useEffect(() => {
        if (!url && !hasStartedRef.current) {
            navigate('/');
            return;
        }

        if (!hasStartedRef.current) {
            hasStartedRef.current = true;
            generateNotes(url, language, style);
        }
    }, [url, language, style, generateNotes, navigate]);

    useEffect(() => {
        if (generatedNoteId) {
            navigate(`/notes/${generatedNoteId}`, { replace: true });
        }
    }, [generatedNoteId, navigate]);

    // Show error state instead of auto-redirecting
    if (error) {
        return (
            <div className="min-h-screen pt-24 px-6 md:px-24 bg-zinc-50 dark:bg-[#050505] flex items-center justify-center">
                <div className="max-w-xl w-full">
                    <div className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/30 rounded-2xl p-8 shadow-lg">
                        {/* Error Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20">
                                <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                            </div>
                        </div>

                        {/* Error Title */}
                        <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-white mb-4">
                            Oops! Something went wrong
                        </h2>

                        {/* Error Message */}
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-4 mb-6">
                            <p className="text-sm text-red-800 dark:text-red-300 text-center">
                                {error}
                            </p>
                        </div>

                        {/* Back to Home Button */}
                        <button
                            onClick={() => navigate('/', { replace: true })}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20"
                        >
                            <Home className="w-5 h-5" />
                            Back to Home
                        </button>

                        {/* Help Text */}
                        <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 mt-4">
                            Please try again with a different video or check if it meets our content guidelines.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 px-6 md:px-24 bg-zinc-50 dark:bg-[#050505]">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8 animate-pulse">
                    <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                    <div>
                        <h2 className="text-lg font-medium text-zinc-900 dark:text-white">Generating Notes...</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Analyzing video content and synthesizing knowledge.</p>
                    </div>
                </div>

                <div className="prose prose-zinc dark:prose-invert prose-lg font-serif max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                            h1: ({ node, ...props }) => <h1 className="text-3xl font-sans font-bold mt-8 mb-4" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-2xl font-sans font-semibold mt-8 mb-4 flex items-center gap-2" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-xl font-sans font-medium mt-6 mb-3 text-teal-600 dark:text-teal-400" {...props} />,
                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-teal-500 pl-4 italic my-6 bg-zinc-100 dark:bg-zinc-900/50 p-4 rounded-r-lg" {...props} />,
                        }}
                    >
                        {notes}
                    </ReactMarkdown>
                    {isLoading && <span className="inline-block w-2 h-5 bg-teal-500 ml-1 animate-pulse"></span>}
                </div>
            </div>
        </div>
    );
};

export default GeneratingView;

