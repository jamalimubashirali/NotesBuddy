import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Coins } from 'lucide-react';
import { chatWithNote, getChatHistory, getTokenUsage } from '../services/api';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}

interface ChatInterfaceProps {
    noteId: number;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ noteId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const [tokensRemaining, setTokensRemaining] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingContent]);

    // Load chat history and token usage
    useEffect(() => {
        const loadData = async () => {
            try {
                const history = await getChatHistory(noteId);
                setMessages(history.map((msg: any) => ({
                    role: msg.role,
                    content: msg.content,
                    timestamp: new Date(msg.created_at)
                })));

                const tokenData = await getTokenUsage();
                setTokensRemaining(tokenData.tokens_remaining);
            } catch (error) {
                console.error('Failed to load chat history:', error);
            }
        };
        loadData();
    }, [noteId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || tokensRemaining === 0) return;

        const userMessage = input.trim();
        setInput('');

        const newUserMessage: Message = {
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);
        setStreamingContent('');

        try {
            const stream = await chatWithNote(noteId, userMessage);
            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                fullResponse += chunk;
                setStreamingContent(fullResponse);
            }

            const assistantMessage: Message = {
                role: 'assistant',
                content: fullResponse,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
            setStreamingContent('');

            try {
                const tokenData = await getTokenUsage();
                setTokensRemaining(tokenData.tokens_remaining);
            } catch (error) {
                console.error('Failed to refresh token usage:', error);
            }
        } catch (error: any) {
            console.error('Chat error:', error);

            if (error.response?.status === 429) {
                const errorMessage: Message = {
                    role: 'assistant',
                    content: '⚠️ **Daily token limit exceeded!**\n\nYou\'ve reached your daily limit of 5,000 tokens. Your limit will reset tomorrow. Thank you for using NotesBuddy!',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, errorMessage]);
                setTokensRemaining(0);
            } else {
                const errorMessage: Message = {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error. Please try again.',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, errorMessage]);
            }
            setStreamingContent('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && !isLoading && (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                        <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium">Ask me anything about these notes!</p>
                        <p className="text-sm mt-2">I'll use AI-powered search to find relevant information</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={`${idx}-${msg.timestamp?.getTime()}`}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                        )}

                        <div
                            className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 shadow-sm'
                                }`}
                        >
                            <div className={`prose ${msg.role === 'user' ? 'prose-invert' : 'dark:prose-invert'} prose-sm max-w-none`}>
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-white" />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && streamingContent && (
                    <div className="flex gap-3 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="max-w-[80%] rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 shadow-sm">
                            <div className="prose dark:prose-invert prose-sm max-w-none">
                                <ReactMarkdown>{streamingContent}</ReactMarkdown>
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading && !streamingContent && (
                    <div className="flex gap-3 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="max-w-[80%] rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 shadow-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Searching through notes...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-transparent">
                {tokensRemaining !== null && (
                    <div className="mb-2 flex items-center justify-end gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Coins className="w-4 h-4" />
                        <span>{tokensRemaining.toLocaleString()} tokens remaining today</span>
                    </div>
                )}

                {/* Token Limit Warning */}
                {tokensRemaining !== null && tokensRemaining <= 0 && (
                    <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <div className="flex items-start gap-2">
                            <div className="text-orange-600 dark:text-orange-400 text-lg">⚠️</div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                                    Daily Token Limit Reached
                                </p>
                                <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                                    You've used all 5,000 tokens for today. Your limit will reset tomorrow at midnight.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={tokensRemaining === 0 ? "Token limit reached - try again tomorrow" : "Ask a question about these notes..."}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading || tokensRemaining === 0}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim() || tokensRemaining === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        title={tokensRemaining === 0 ? "Daily token limit reached" : "Send message"}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatInterface;
