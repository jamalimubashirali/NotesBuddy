import React from 'react';
import { Youtube, Brain, FileText, Download } from 'lucide-react';

export const HowItWorks: React.FC = () => {
    const steps = [
        {
            icon: <Youtube className="w-8 h-8 text-red-500" />,
            title: "1. Paste URL",
            description: "Find a YouTube video you want to study. Copy the URL and paste it into NotesBuddy."
        },
        {
            icon: <Brain className="w-8 h-8 text-purple-500" />,
            title: "2. AI Analysis",
            description: "Our advanced AI analyzes the transcript, identifying key concepts, summaries, and important details."
        },
        {
            icon: <FileText className="w-8 h-8 text-blue-500" />,
            title: "3. Get Notes",
            description: "Instantly receive comprehensive, structured markdown notes ready for study."
        },
        {
            icon: <Download className="w-8 h-8 text-green-500" />,
            title: "4. Export",
            description: "Download your notes as a Markdown file to use in Notion, Obsidian, or any other tool."
        }
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How NotesBuddy Works</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">Turn hours of video content into minutes of reading.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {steps.map((step, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
                        <div className="bg-gray-50 dark:bg-gray-700/50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                            {step.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {step.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
