import React, { useEffect, useState } from 'react';
import { getNotes, type NoteSummary } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

const Dashboard: React.FC = () => {
    const [notes, setNotes] = useState<NoteSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const data = await getNotes();
                setNotes(data);
            } catch (err) {
                setError('Failed to load notes');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
    );

    if (error) return (
        <div className="text-center mt-10 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            {error}
        </div>
    );

    return (
        <section id="demo" className="min-h-screen py-24 px-6 md:px-24 bg-transparent relative">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">Your Library</h2>
                        <p className="text-sm text-zinc-500 mt-2">Recently generated knowledge bases.</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-900 dark:text-white transition-colors">
                            <Icon icon="solar:list-linear" width="20" />
                        </button>
                        <button className="p-2 rounded-lg bg-black/10 dark:bg-white/10 text-zinc-900 dark:text-white border border-black/10 dark:border-white/10">
                            <Icon icon="solar:widget-2-linear" width="20" />
                        </button>
                    </div>
                </div>

                {notes.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm backdrop-blur-sm">
                        <div className="bg-teal-50 dark:bg-teal-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Icon icon="solar:notes-minimalistic-bold-duotone" className="text-teal-600 dark:text-teal-400 text-3xl" />
                        </div>
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">No notes yet</h3>
                        <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-8">
                            Get started by pasting a YouTube URL to generate your first comprehensive academic notes.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all hover:scale-105 font-medium"
                        >
                            <Icon icon="solar:magic-stick-3-linear" className="text-lg" />
                            Generate Your First Note
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {notes.map((note) => (
                            <div
                                key={note.id}
                                className="group relative rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 transition-all duration-300 overflow-hidden hover:-translate-y-1 cursor-pointer shadow-sm hover:shadow-md"
                                onClick={() => navigate(`/notes/${note.id}`)}
                            >
                                <div className="p-6">
                                    <div className="flex gap-2 mb-4">
                                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 uppercase tracking-wider">
                                            {note.language}
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 capitalize">
                                            {note.style}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white leading-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors line-clamp-2">
                                        {note.title}
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-4 line-clamp-2">
                                        {note.notes_snippet.replace(/[#*`]/g, '')}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-white/5">
                                        <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
                                            {new Date(note.created_at).toLocaleDateString()}
                                        </span>
                                        <button className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                            <Icon icon="solar:chat-round-line-linear" width="18" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Dashboard;
