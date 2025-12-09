import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Copy, Check, Download, FileText, File, AlertTriangle, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportToPDF, getNotes } from '../services/api';
import { toast } from 'react-hot-toast';

interface NotesDisplayProps {
    notes: string;
    isLoading?: boolean;
}

export const NotesDisplay: React.FC<NotesDisplayProps> = ({ notes, isLoading = false }) => {
    const [copied, setCopied] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const navigate = useNavigate();
    const [showExportMenu, setShowExportMenu] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(notes);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadMarkdown = () => {
        const element = document.createElement("a");
        const file = new Blob([notes], { type: 'text/markdown' });
        element.href = URL.createObjectURL(file);
        element.download = "notes.md";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        setShowExportMenu(false);
        toast.success('Downloaded as Markdown');
    };

    const handleDownloadPDF = async () => {
        setIsExporting(true);
        try {
            const blob = await exportToPDF(notes);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'notes.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            toast.success('Downloaded as PDF');
        } catch (error) {
            console.error('PDF Export failed:', error);
            toast.error('Failed to export PDF');
        } finally {
            setIsExporting(false);
            setShowExportMenu(false);
        }
    };

    const handleOpenInChatView = async () => {
        try {
            // Fetch the most recent note
            const allNotes = await getNotes();
            if (allNotes.length > 0) {
                // Navigate to the most recent note
                navigate(`/notes/${allNotes[0].id}`);
            } else {
                toast.error('No notes found. Please try again.');
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            toast.error('Failed to open note. Please try again.');
        }
    };

    if (!notes) return null;

    return (
        <div className="w-full max-w-4xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                        Generated Notes
                    </h2>
                    <div className="flex gap-2 relative">
                        <div className="relative">
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Export</span>
                            </button>

                            {showExportMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10 border border-gray-100 dark:border-gray-700">
                                    <div className="py-1">
                                        <button
                                            onClick={handleDownloadMarkdown}
                                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Markdown (.md)
                                        </button>
                                        <button
                                            onClick={handleDownloadPDF}
                                            disabled={isExporting}
                                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                                        >
                                            <File className="w-4 h-4" />
                                            {isExporting ? 'Generating PDF...' : 'PDF (.pdf)'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleCopy}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                    </div>
                </div>
                <div className="p-8 bg-white dark:bg-gray-800">
                    <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-a:text-blue-600 hover:prose-a:text-blue-500">
                        <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                        >
                            {notes}
                        </ReactMarkdown>
                    </article>

                    {/* AI Disclaimer */}
                    {!isLoading && (
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <span>This content is AI-generated and may contain errors. Please verify important information.</span>
                            </div>
                        </div>
                    )}

                    {/* Quick Action Button */}
                    {!isLoading && (
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={handleOpenInChatView}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105 shadow-lg font-medium"
                            >
                                <MessageSquare className="w-5 h-5" />
                                Open in Chat View
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
