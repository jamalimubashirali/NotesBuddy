import React from 'react';
import { Icon } from '@iconify/react';

const Footer: React.FC = () => {
    return (
        <footer className="border-t border-zinc-200 dark:border-white/5 py-12 px-6 md:px-24 bg-zinc-50 dark:bg-[#030303] text-sm transition-colors duration-300">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-black/5 dark:bg-white/10 flex items-center justify-center">
                        <Icon icon="solar:notes-minimalistic-bold-duotone" className="text-teal-600 dark:text-teal-500 text-xs" />
                    </div>
                    <span className="text-zinc-600 dark:text-zinc-400 font-medium">NotesBuddy</span>
                </div>
                <div className="flex gap-6 text-zinc-500 dark:text-zinc-600">
                    <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Terms</a>
                    <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Privacy</a>
                    <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Twitter</a>
                </div>
                <div className="text-zinc-400 dark:text-zinc-700">
                    © 2024 NotesBuddy.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
