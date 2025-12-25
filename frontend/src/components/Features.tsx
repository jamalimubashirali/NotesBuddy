import React, { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Features: React.FC = () => {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Process Section Animations - Triggered by scroll
            gsap.from(".process-step", {
                scrollTrigger: {
                    trigger: ".process-section-trigger",
                    start: "top 80%",
                    toggleActions: "play none none none",
                    once: true
                },
                opacity: 0,
                x: -30,
                duration: 0.6,
                stagger: 0.15,
                ease: "power2.out"
            });

            gsap.from(".process-visual", {
                scrollTrigger: {
                    trigger: ".process-section-trigger",
                    start: "top 80%",
                    toggleActions: "play none none none",
                    once: true
                },
                opacity: 0,
                x: 30,
                duration: 0.8,
                ease: "power2.out",
                delay: 0.2
            });

            // Toolkit Section - Header
            gsap.from(".toolkit-header", {
                scrollTrigger: {
                    trigger: ".toolkit-section-trigger",
                    start: "top 85%",
                    toggleActions: "play none none none",
                    once: true
                },
                opacity: 0,
                y: 20,
                duration: 0.5,
                ease: "power2.out"
            });

            // Toolkit Section - Cards
            gsap.from(".feature-card", {
                scrollTrigger: {
                    trigger: ".features-grid-trigger",
                    start: "top 95%",
                    toggleActions: "play none none none",
                    once: true
                },
                opacity: 0,
                y: 30,
                duration: 0.4,
                stagger: 0.05,
                ease: "power2.out",
                clearProps: "all"
            });

        }, sectionRef);

        // Force refresh to ensure start/end positions are correct after layout
        setTimeout(() => ScrollTrigger.refresh(), 100);

        return () => ctx.revert();
    }, []);

    const features = [
        {
            icon: "solar:soundwave-square-bold-duotone",
            color: "text-teal-500",
            bg: "bg-teal-500/10",
            title: "AI Transcription",
            description: "High-fidelity audio processing captures every nuance of the lecture with near-perfect accuracy."
        },
        {
            icon: "solar:document-add-bold-duotone",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            title: "Smart Summarization",
            description: "AI identifies key themes, arguments, and structural hierarchy to create academic-grade notes."
        },
        {
            icon: "solar:chat-round-line-bold-duotone",
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            title: "Interactive Chat (RAG)",
            description: "Ask questions about specific details in the video. Our RAG pipeline indexes the full transcript for precise answers."
        },
        {
            icon: "solar:global-bold-duotone",
            color: "text-pink-500",
            bg: "bg-pink-500/10",
            title: "Multi-language Support",
            description: "Generate notes in over 50 languages. Break down language barriers and learn from global content."
        },
        {
            icon: "solar:file-download-bold-duotone",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            title: "PDF Export",
            description: "Download beautifully formatted notes with a single click. Perfect for offline study and sharing."
        },
        {
            icon: "solar:moon-stars-bold-duotone",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            title: "Dark Mode",
            description: "A carefully crafted dark mode that's easy on the eyes for those late-night study sessions."
        }
    ];

    return (
        <section ref={sectionRef} id="how-it-works" className="py-32 px-6 md:px-24 border-t border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-[#050505] transition-colors duration-300 relative overflow-visible">

            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-64 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10 space-y-40">

                {/* SECTION 1: THE PROCESS */}
                <div className="process-section-trigger flex flex-col md:flex-row gap-20 items-center">
                    {/* Text Side */}
                    <div className="w-full md:w-1/3 space-y-8">
                        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                            The Art of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-500">Synthesis</span>
                        </h2>
                        <div className="space-y-6">
                            <div className="process-step flex gap-4 group cursor-default">
                                <div className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-zinc-900 group-hover:border-teal-500/50 transition-colors">
                                    <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">01</span>
                                </div>
                                <div>
                                    <h3 className="text-zinc-900 dark:text-white font-medium mb-1">Transcription</h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-relaxed">High-fidelity audio processing captures every nuance of the lecture.</p>
                                </div>
                            </div>
                            <div className="process-step flex gap-4 group cursor-default">
                                <div className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-zinc-900 group-hover:border-purple-500/50 transition-colors">
                                    <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">02</span>
                                </div>
                                <div>
                                    <h3 className="text-zinc-900 dark:text-white font-medium mb-1">Contextualization</h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-relaxed">AI identifies key themes, arguments, and structural hierarchy.</p>
                                </div>
                            </div>
                            <div className="process-step flex gap-4 group cursor-default">
                                <div className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-zinc-900 group-hover:border-indigo-500/50 transition-colors">
                                    <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">03</span>
                                </div>
                                <div>
                                    <h3 className="text-zinc-900 dark:text-white font-medium mb-1">Formatting</h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-relaxed">Output is rendered into beautiful, readable markdown with citations.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual Side */}
                    <div className="process-visual w-full md:w-2/3 relative">
                        <div className="glass-panel rounded-xl overflow-hidden aspect-video relative flex flex-col shadow-2xl">
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
                                <div className="absolute bottom-8 right-8 flex items-center gap-2 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-full shadow-lg border border-zinc-200 dark:border-white/10 animate-bounce">
                                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">AI Generating...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: THE TOOLKIT */}
                <div>
                    <div className="toolkit-section-trigger toolkit-header text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            Everything you need to <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-500">master your content</span>
                        </h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                            A complete suite of tools designed to transform passive watching into active learning.
                        </p>
                    </div>

                    <div className="features-grid-trigger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="feature-card group p-8 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 transition duration-300 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none hover:-translate-y-1"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon icon={feature.icon} width="28" />
                                </div>
                                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Features;
