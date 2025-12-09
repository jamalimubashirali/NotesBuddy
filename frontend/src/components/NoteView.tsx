import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNoteById, exportToPDF } from '../services/api';
import type { NoteResponse } from '../services/api';
import { ArrowLeft, Download, Calendar, Globe, FileText, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import { toast } from 'react-hot-toast';
import ChatModal from './ChatModal';

const NoteView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [note, setNote] = useState<NoteResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    if (loading) return <div className="text-center mt-10 text-white">Loading note...</div>;
    if (error || !note) return <div className="text-center mt-10 text-red-500">{error || 'Note not found'}</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-8 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{note.title}</h1>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(note.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Globe className="w-4 h-4" />
                                    <span className="uppercase">{note.language}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FileText className="w-4 h-4" />
                                    <span className="capitalize">{note.style}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                        >
                            <Download className="w-4 h-4" />
                            Export PDF
                        </button>
                    </div>
                </div>


                {/* AI Disclaimer */}
                <div className="px-8 pt-6 pb-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium border border-purple-200 dark:border-purple-800">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Generated Content
                    </div>
                </div>

                <div className="p-8 prose dark:prose-invert max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {note.notes}
                    </ReactMarkdown>
                </div>
            </div>

            {/* Floating Chat Modal */}
            <ChatModal noteId={note.id} />
        </div>
    );
};

export default NoteView;
