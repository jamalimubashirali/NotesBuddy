import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNoteById, exportToPDF } from '../services/api';
import type { NoteResponse } from '../services/api';
import { Icon } from '@iconify/react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { toast } from 'react-hot-toast';
import ChatInterface from './ChatInterface';
import Footer from './Footer';

const NoteView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [note, setNote] = useState<NoteResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);

    const [sidebarWidth, setSidebarWidth] = useState(450);
    const [isResizing, setIsResizing] = useState(false);

    const startResizing = React.useCallback((mouseDownEvent: React.MouseEvent) => {
        mouseDownEvent.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = React.useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = React.useCallback(
        (mouseMoveEvent: MouseEvent) => {
            if (isResizing) {
                const newWidth = window.innerWidth - mouseMoveEvent.clientX;
                if (newWidth > 300 && newWidth < 800) {
                    setSidebarWidth(newWidth);
                }
            }
        },
        [isResizing]
    );

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing]);

    useEffect(() => {
        const fetchNote = async () => {
            if (!id) return;
            try {
                const data = await getNoteById(parseInt(id));
                setNote(data);
            } catch (err) {
                setError('Failed to load note');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNote();
    }, [id]);

    const handleExport = async () => {
        if (!note) return;
        try {
            const blob = await exportToPDF(note.notes);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `notes-${note.video_id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            toast.success('Notes exported successfully');
        } catch (err) {
            console.error('Export failed:', err);
            toast.error('Failed to export notes');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
    );

    if (error || !note) return <div className="text-center mt-10 text-red-500">{error || 'Note not found'}</div>;

    return (
        <div className="w-full h-screen relative flex overflow-hidden bg-zinc-50 dark:bg-[#080808] pt-24">
            {/* Main Content Area */}
            <div className="flex-1 h-full overflow-y-auto flex flex-col relative transition-all duration-300 ease-in-out">
                <div className="flex-1 p-8 md:p-12 font-serif">
                    <div className="max-w-3xl mx-auto min-h-[60vh]">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white mb-8 transition-colors text-sm font-sans"
                        >
                            <Icon icon="solar:arrow-left-linear" />
                            Back to Library
                        </button>

                        <div className="flex items-center justify-between mb-8">
                            <span className="text-xs font-sans font-medium text-zinc-500 uppercase tracking-widest">
                                {new Date(note.created_at).toLocaleDateString()} • {note.language}
                            </span>
                            <button
                                onClick={handleExport}
                                className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 transition-colors"
                                title="Export PDF"
                            >
                                <Icon icon="solar:download-minimalistic-linear" width="20" />
                            </button>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-10 leading-tight">
                            {note.title}
                        </h1>

                        <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-12 mb-6" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-10 mb-5 flex items-center gap-2" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-xl font-medium mt-8 mb-4 text-teal-600 dark:text-teal-400" {...props} />,
                                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-teal-500 pl-6 italic my-8 text-zinc-600 dark:text-zinc-400" {...props} />,
                                    p: ({ node, ...props }) => <p className="mb-6 leading-relaxed text-zinc-700 dark:text-zinc-300" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-6 space-y-2" {...props} />,
                                    li: ({ node, ...props }) => <li className="text-zinc-700 dark:text-zinc-300" {...props} />,
                                }}
                            >
                                {note.notes}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>

                {/* Footer inside the scrollable area */}
                <Footer />
            </div>

            {/* Chat Toggle Button (Visible when chat is closed) */}
            {!isChatOpen && (
                <div className="fixed bottom-8 right-8 z-50">
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="group flex items-center gap-3 pl-4 pr-2 py-2 bg-white dark:bg-zinc-900 rounded-full shadow-2xl border border-zinc-200 dark:border-white/10 hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all duration-300 hover:scale-105"
                    >
                        <span className="text-sm font-medium font-display bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-teal-500 group-hover:to-indigo-500 transition-all">
                            Ask AI
                        </span>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:shadow-teal-500/25 transition-all">
                            <Icon icon="solar:stars-bold" className="w-5 h-5 animate-pulse" />
                        </div>
                    </button>
                </div>
            )}

            {/* Resizable Chat Sidebar */}
            {isChatOpen && (
                <>
                    {/* Resizer Handle */}
                    <div
                        className="w-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-teal-500 dark:hover:bg-teal-500 cursor-col-resize transition-colors z-20 flex items-center justify-center"
                        onMouseDown={startResizing}
                    >
                        <div className="h-8 w-1 bg-zinc-400 rounded-full"></div>
                    </div>

                    {/* Chat Panel */}
                    <div
                        style={{ width: sidebarWidth }}
                        className="h-full bg-white dark:bg-[#0a0a0a] border-l border-zinc-200 dark:border-white/5 flex flex-col shadow-2xl z-10"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white">
                                    <Icon icon="solar:stars-bold" className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-zinc-900 dark:text-white font-display">Chat with your Notes</span>
                            </div>
                            <button
                                onClick={() => setIsChatOpen(false)}
                                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-white/5"
                                title="Close Chat"
                            >
                                <Icon icon="solar:close-circle-linear" width="24" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden relative">
                            <ChatInterface noteId={note.id} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NoteView;
