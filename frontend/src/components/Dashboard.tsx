import React, { useEffect, useState } from 'react';
import { getNotes, type NoteResponse } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const [notes, setNotes] = useState<NoteResponse[]>([]);
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

    console.log(notes);

    if (loading) return <div className="text-center mt-10 text-white">Loading notes...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">My Notes</h1>

            {notes.length === 0 ? (
                <div className="text-center text-gray-400">
                    <p>You haven't generated any notes yet.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Generate Your First Note
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notes.map((note) => (
                        <div
                            key={note.id}
                            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all cursor-pointer"
                            onClick={() => navigate(`/notes/${note.id}`)}
                        >
                            <h2 className="text-xl font-semibold text-white mb-2 truncate">{note.title}</h2>
                            <div className="flex justify-between text-sm text-gray-400 mb-4">
                                <span>{new Date(note.created_at).toLocaleDateString()}</span>
                                <span className="px-2 py-0.5 bg-gray-700 rounded text-xs uppercase">{note.language}</span>
                            </div>
                            <p className="text-gray-300 line-clamp-3 text-sm">
                                {note.notes.substring(0, 150)}...
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
