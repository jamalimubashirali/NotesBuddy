import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './ui/Navbar';
import Background3D from './ui/Background3D';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const showBackground = ['/', '/login', '/signup', '/how-it-works'].includes(location.pathname);

    return (
        <div className="min-h-screen w-full bg-white dark:bg-[#050505] text-zinc-900 dark:text-white overflow-x-hidden transition-colors duration-300 flex flex-col">
            {showBackground && <Background3D />}

            {/* Guide Lines */}
            <div className="fixed top-0 bottom-0 left-6 md:left-24 w-px bg-gradient-to-b from-transparent via-zinc-200 dark:via-white/5 to-transparent z-0 pointer-events-none" />
            <div className="fixed top-0 bottom-0 right-6 md:right-24 w-px bg-gradient-to-b from-transparent via-zinc-200 dark:via-white/5 to-transparent z-0 pointer-events-none" />
            <div className="fixed top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-zinc-200 dark:via-white/5 to-transparent z-0 pointer-events-none hidden md:block" />

            <Navbar />

            <main className="relative z-10 w-full flex-1 flex flex-col">
                {children}
            </main>
        </div>
    );
};

export default Layout;
