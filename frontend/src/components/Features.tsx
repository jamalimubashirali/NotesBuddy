import React from 'react';
import { Icon } from '@iconify/react';

const Features: React.FC = () => {


    return (
        <section id="how-it-works" className="py-32 px-6 md:px-24 border-t border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-[#050505] transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row gap-20 items-center">

                    {/* Text Side */}
                    <div className="w-full md:w-1/3 space-y-8">
                        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">The Art of <br /><span className="text-aura">Synthesis</span></h2>
                        <div className="space-y-6">
                            <div className="flex gap-4 group cursor-default">
                                <div className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-zinc-900 group-hover:border-teal-500/50 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors">
                                    <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 group-hover:text-teal-500 dark:group-hover:text-teal-400">01</span>
                                </div>
                                <div>
                                    <h3 className="text-zinc-900 dark:text-white font-medium mb-1">Transcription</h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-relaxed">High-fidelity audio processing captures every nuance of the lecture.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 group cursor-default">
                                <div className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-zinc-900 group-hover:border-purple-500/50 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
                                    <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 group-hover:text-purple-500 dark:group-hover:text-purple-400">02</span>
                                </div>
                                <div>
                                    <h3 className="text-zinc-900 dark:text-white font-medium mb-1">Contextualization</h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-relaxed">AI identifies key themes, arguments, and structural hierarchy.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 group cursor-default">
                                <div className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-zinc-900 group-hover:border-indigo-500/50 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                                    <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400">03</span>
                                </div>
                                <div>
                                    <h3 className="text-zinc-900 dark:text-white font-medium mb-1">Formatting</h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-relaxed">Output is rendered into beautiful, readable markdown with citations.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual Side */}
                    <div className="w-full md:w-2/3 relative">
                        {/* Glass Window */}
                        <div className="glass-panel rounded-xl overflow-hidden aspect-video relative flex flex-col shadow-2xl">
                            {/* Window Header */}
                            <div className="h-10 border-b border-white/10 bg-zinc-900/90 flex items-center px-4 gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                                </div>
                                <div className="ml-4 px-3 py-1 bg-black/40 rounded text-[10px] text-zinc-500 font-mono w-64 flex items-center gap-2">
                                    <Icon icon="solar:lock-keyhole-minimalistic-linear" />
                                    notesbuddy.ai/processing
                                </div>
                            </div>
                            {/* Content */}
                            <div className="flex-1 p-8 relative bg-zinc-50 dark:bg-zinc-900/50 transition-colors duration-300 overflow-hidden font-serif text-sm leading-relaxed text-zinc-800 dark:text-zinc-300">
                                <div className="absolute inset-0 p-8 opacity-50 select-none pointer-events-none">
                                    <h1 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">The Quantum Nature of Light</h1>
                                    <p className="mb-4">Light behaves as both a <span className="bg-teal-500/20 text-teal-700 dark:text-teal-300 px-1 rounded">particle</span> and a <span className="bg-purple-500/20 text-purple-700 dark:text-purple-300 px-1 rounded">wave</span>. This duality is fundamental to quantum mechanics.</p>
                                    <h2 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-white">Key Concepts</h2>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><strong>Photons:</strong> Discrete packets of energy.</li>
                                        <li><strong>Interference:</strong> Wave-like behavior observed in the double-slit experiment.</li>
                                        <li><strong>Photoelectric Effect:</strong> Evidence of particle nature.</li>
                                    </ul>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-transparent to-transparent dark:from-[#0a0a0a] dark:via-transparent dark:to-transparent"></div>

                                {/* Typing Cursor Overlay */}
                                <div className="absolute bottom-8 right-8 flex items-center gap-2 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-full shadow-lg border border-zinc-200 dark:border-white/10 animate-bounce">
                                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">AI Generating...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
