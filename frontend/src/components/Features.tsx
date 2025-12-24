import React, { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Features: React.FC = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // 1. Process Section Animations (Vertical Entrance)
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

            // 2. Horizontal Scroll Animation for Features
            const scrollContainer = scrollContainerRef.current;
            if (scrollContainer) {
                const scrollWidth = scrollContainer.scrollWidth;
                const clientWidth = scrollContainer.clientWidth;

                // Only animate if content overflows
                if (scrollWidth > clientWidth) {
                    gsap.to(scrollContainer, {
                        x: () => -(scrollWidth - window.innerWidth + 100), // Scroll full width
                        ease: "none",
                        scrollTrigger: {
                            trigger: triggerRef.current,
                            pin: true,
                            scrub: 1,
                            start: "top top",
                            end: () => `+=${scrollWidth}`,
                            invalidateOnRefresh: true,
                        }
                    });
                }
            }

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const features = [
        {
            icon: "solar:soundwave-square-bold-duotone",
            color: "text-teal-500",
            bg: "bg-teal-500/10",
            title: "AI Transcription",
            description: "High-fidelity audio processing captures every nuance."
        },
        {
            icon: "solar:document-add-bold-duotone",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            title: "Smart Summarization",
            description: "AI identifies key themes and structural hierarchy."
        },
        {
            icon: "solar:chat-round-line-bold-duotone",
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            title: "Interactive Chat",
            description: "Ask questions about specific details in the video."
        },
        {
            icon: "solar:global-bold-duotone",
            color: "text-pink-500",
            bg: "bg-pink-500/10",
            title: "Multi-language",
            description: "Generate notes in over 50 languages instantly."
        },
        {
            icon: "solar:file-download-bold-duotone",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            title: "PDF Export",
            description: "Download beautifully formatted notes."
        },
        {
            icon: "solar:moon-stars-bold-duotone",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            title: "Dark Mode",
            description: "Easy on the eyes for late-night study sessions."
        }
    ];

    return (
        <section ref={sectionRef} id="how-it-works" className="bg-zinc-50 dark:bg-[#050505] transition-colors duration-300 relative overflow-hidden">

            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-64 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* SECTION 1: THE PROCESS (Vertical Scroll) */}
            <div className="max-w-7xl mx-auto relative z-10 py-32 px-6 md:px-24">
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
                                    <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-relaxed">High-fidelity audio processing.</p>
                                </div>
                            </div>
                            <div className="process-step flex gap-4 group cursor-default">
                                <div className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-zinc-900 group-hover:border-purple-500/50 transition-colors">
                                    <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">02</span>
                                </div>
                                <div>
                                    <h3 className="text-zinc-900 dark:text-white font-medium mb-1">Contextualization</h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-relaxed">AI identifies key themes.</p>
                                </div>
                            </div>
                            <div className="process-step flex gap-4 group cursor-default">
                                <div className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-zinc-900 group-hover:border-indigo-500/50 transition-colors">
                                    <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">03</span>
                                </div>
                                <div>
                                    <h3 className="text-zinc-900 dark:text-white font-medium mb-1">Formatting</h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-relaxed">Beautiful markdown output.</p>
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
                            </div>
                            <div className="flex-1 p-8 relative bg-zinc-50 dark:bg-zinc-900/50 transition-colors duration-300 overflow-hidden font-serif text-sm leading-relaxed text-zinc-800 dark:text-zinc-300">
                                <div className="absolute inset-0 p-8 opacity-50 select-none pointer-events-none">
                                    <h1 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">The Quantum Nature of Light</h1>
                                    <p className="mb-4">Light behaves as both a <span className="bg-teal-500/20 text-teal-700 dark:text-teal-300 px-1 rounded">particle</span> and a <span className="bg-purple-500/20 text-purple-700 dark:text-purple-300 px-1 rounded">wave</span>.</p>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-transparent to-transparent dark:from-[#0a0a0a] dark:via-transparent dark:to-transparent"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: HORIZONTAL SCROLL FEATURES */}
            <div ref={triggerRef} className="h-screen flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-10 left-6 md:left-24 z-20 max-w-xl">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
                        Everything <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-500">you need</span>
                    </h2>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        Scroll to explore the toolkit.
                    </p>
                </div>

                <div ref={scrollContainerRef} className="flex gap-8 px-6 md:px-24 w-fit items-center pt-32">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="w-[300px] md:w-[400px] h-[400px] md:h-[500px] flex-shrink-0 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 p-8 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-white/20 transition-all duration-300 group"
                        >
                            <div>
                                <div className={`w-16 h-16 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon icon={feature.icon} width="32" />
                                </div>
                                <h3 className="text-3xl font-semibold text-zinc-900 dark:text-white mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                            <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
                            </div>
                        </div>
                    ))}
                    {/* Extra padding at end */}
                    <div className="w-24 flex-shrink-0"></div>
                </div>
            </div>

        </section>
    );
};

export default Features;
