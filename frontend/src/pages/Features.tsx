import React from 'react';
import { CheckCircle2, Zap, Shield, Layout } from 'lucide-react';

export const Features: React.FC = () => {
    const features = [
        {
            icon: <Zap className="w-6 h-6 text-yellow-500" />,
            title: "Lightning Fast",
            description: "Generate comprehensive notes from long videos in seconds, not hours."
        },
        {
            icon: <Layout className="w-6 h-6 text-blue-500" />,
            title: "Structured Format",
            description: "Get notes in perfect Markdown format with headers, bullet points, and summaries."
        },
        {
            icon: <Shield className="w-6 h-6 text-green-500" />,
            title: "Content Filtering",
            description: "Smart AI automatically detects and rejects non-academic content to keep you focused."
        },
        {
            icon: <CheckCircle2 className="w-6 h-6 text-indigo-500" />,
            title: "Accuracy",
            description: "Powered by Azure OpenAI GPT-4 for high-quality, accurate summarization."
        }
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Powerful Features</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">Everything you need to master your studies.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                    <div key={index} className="flex gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex-shrink-0">
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                {feature.icon}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
