import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import gsap from 'gsap';
import { Loader2 } from 'lucide-react';

interface HeroProps {
    onSubmit: (url: string, language: string, style: string) => void;
    isLoading: boolean;
}

const Hero: React.FC<HeroProps> = ({ onSubmit, isLoading }) => {
    const [url, setUrl] = useState('');
    const [language, setLanguage] = useState('en');
    const [style, setStyle] = useState('detailed');

    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".hero-title", { opacity: 0, y: 30, duration: 1.5, ease: "power4.out", delay: 0.2 });
            gsap.from(".hero-subtitle", { opacity: 0, y: 20, duration: 1.5, ease: "power4.out", delay: 0.4 });
            gsap.from(".input-container", { opacity: 0, scale: 0.9, duration: 1, ease: "back.out(1.7)", delay: 0.6 });
        }, heroRef);

        return () => ctx.revert();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            onSubmit(url, language, style);
        }
    };

    return (
        <section ref={heroRef} id="hero" className="min-h-screen w-full flex flex-col justify-center items-center px-6 relative pt-20">

            <div className="max-w-4xl w-full text-center space-y-10 z-10">

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/5 backdrop-blur-md animate-fade-in-up">
                    <Icon icon="solar:magic-stick-3-linear" className="text-teal-600 dark:text-teal-400 text-sm" />
                    <span className="text-xs font-medium text-teal-700 dark:text-teal-200 tracking-wide uppercase">AI-Powered Research Assistant</span>
                </div>

                <h1 className="hero-title text-5xl md:text-8xl font-semibold tracking-tighter text-zinc-900 dark:text-white leading-[1.1]">
                    Knowledge, <br />
                    <span className="text-zinc-500 font-serif italic pr-2">distilled</span> from noise.
                </h1>

                <p className="hero-subtitle text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto font-light leading-relaxed">
                    Transform hours of YouTube content into succinct, academic-grade notes. Chat with your videos and extract clarity instantly.
                </p>

                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium tracking-wide uppercase">
                    * For academic and educational content only
                </p>

                {/* Interactive Input */}
                <div className="input-container relative max-w-2xl mx-auto w-full group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 via-purple-500 to-indigo-500 rounded-2xl opacity-30 blur-lg transition-opacity duration-500 group-hover:opacity-50"></div>
                    <form onSubmit={handleSubmit} className="relative flex flex-col gap-2 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-2xl p-2 input-glow transition-all duration-300 shadow-xl dark:shadow-none">
                        <div className="flex items-center w-full">
                            <div className="pl-4 pr-3 text-zinc-400 dark:text-zinc-500">
                                <Icon icon="solar:link-circle-linear" width="24" />
                            </div>
                            <input
                                type="text"
                                placeholder="Paste YouTube URL here..."
                                className="w-full bg-transparent border-none outline-none text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 text-lg py-3 font-light"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !url.trim()}
                                className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <Icon icon="solar:stars-minimalistic-bold-duotone" />}
                                <span className="hidden sm:inline font-display">{isLoading ? 'Generating...' : 'Generate Notes'}</span>
                            </button>
                        </div>

                        {/* Options */}
                        <div className="flex gap-4 px-4 pb-2">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-transparent text-xs text-zinc-500 dark:text-zinc-400 border-none outline-none cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200"
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                                <option value="it">Italian</option>
                                <option value="pt">Portuguese</option>
                                <option value="hi">Hindi</option>
                                <option value="zh">Chinese</option>
                                <option value="ja">Japanese</option>
                            </select>
                            <select
                                value={style}
                                onChange={(e) => setStyle(e.target.value)}
                                className="bg-transparent text-xs text-zinc-500 dark:text-zinc-400 border-none outline-none cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200"
                            >
                                <option value="detailed">Detailed Notes</option>
                                <option value="summary">Summary</option>
                                <option value="bullet points">Bullet Points</option>
                            </select>
                        </div>
                    </form>
                </div>


            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-600">
                <span className="text-[10px] tracking-widest uppercase">Scroll</span>
                <div className="w-px h-12 bg-gradient-to-b from-zinc-400 dark:from-zinc-600 to-transparent"></div>
            </div>
        </section>
    );
};

export default Hero;
