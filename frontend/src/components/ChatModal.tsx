import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatInterface from './ChatInterface';

interface ChatModalProps {
    noteId: number;
}

const ChatModal: React.FC<ChatModalProps> = ({ noteId }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <>
            {/* Floating Chat Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-40 group"
                aria-label="Open chat"
            >
                <MessageCircle className="w-6 h-6" />
                <span className="absolute -top-12 right-0 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                    Chat with AI
                </span>
            </button>

            {/* Modal Overlay & Content */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <MessageCircle className="w-6 h-6" />
                                Chat with your Notes
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                                aria-label="Close chat"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Interface */}
                        <div className="flex-1 overflow-hidden">
                            <ChatInterface noteId={noteId} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatModal;
