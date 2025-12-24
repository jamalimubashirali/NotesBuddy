import React from 'react';
import { Icon } from '@iconify/react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const { isAuthenticated, logout } = useAuth();

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 px-6 md:px-24 py-6 flex justify-between items-center bg-gradient-to-b from-[#050505] to-transparent dark:from-[#050505] from-white/80 pointer-events-auto">
            <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-black/10 dark:bg-white/10 flex items-center justify-center backdrop-blur-md border border-black/10 dark:border-white/10">
                    <Icon icon="solar:notes-minimalistic-bold-duotone" className="text-teal-600 dark:text-teal-300 text-lg" />
                </div>
                <span className="text-lg font-medium tracking-tight text-zinc-900 dark:text-white font-display">NotesBuddy</span>
            </Link>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex gap-6 text-sm text-zinc-600 dark:text-zinc-400">
                    <Link to="/how-it-works" className="hover:text-black dark:hover:text-white transition-colors">Method</Link>
                    {isAuthenticated && (
                        <Link to="/dashboard" className="hover:text-black dark:hover:text-white transition-colors">My Notes</Link>
                    )}
                </div>

                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative w-9 h-9 flex items-center justify-center"
                >
                    {theme === 'dark' ? (
                        <Moon className="h-5 w-5 text-white" />
                    ) : (
                        <Sun className="h-5 w-5 text-zinc-900" />
                    )}
                </button>

                {isAuthenticated ? (
                    <button
                        onClick={() => logout()}
                        className="gradient-border-mask px-4 py-2 rounded-full text-xs font-medium text-zinc-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2 group border border-zinc-200 dark:border-transparent"
                    >
                        <span>Logout</span>
                        <LogOut className="w-4 h-4" />
                    </button>
                ) : (
                    <Link to="/login" className="gradient-border-mask px-4 py-2 rounded-full text-xs font-medium text-zinc-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2 group border border-zinc-200 dark:border-transparent">
                        <span>Sign In</span>
                        <Icon icon="solar:arrow-right-linear" className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
