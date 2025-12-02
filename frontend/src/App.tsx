import { useState } from 'react';
import { InputSection } from './components/InputSection';
import { NotesDisplay } from './components/NotesDisplay';
import { generateNotes } from './services/api';
import { Toaster, toast } from 'react-hot-toast';
import { BookOpen } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState<string>('');

  const handleGenerateNotes = async (url: string) => {
    setIsLoading(true);
    setNotes('');
    try {
      const response = await generateNotes(url);
      setNotes(response.notes);
      toast.success('Notes generated successfully!');
    } catch (error: any) {
      console.error('Error generating notes:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to generate notes. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 font-sans">
      <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />

      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              NotesBuddy
            </span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">How it works</a>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">GitHub</a>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mr-2 animate-pulse"></span>
            AI-Powered Note Taking
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 text-gray-900 dark:text-white">
            Turn YouTube Videos into <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Smart Academic Notes
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Stop pausing and rewinding. Paste a YouTube URL and let our advanced AI generate comprehensive, structured notes for you in seconds.
          </p>
        </div>

        <InputSection onSubmit={handleGenerateNotes} isLoading={isLoading} />

        <NotesDisplay notes={notes} />
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">NotesBuddy AI</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} NotesBuddy. Built with React, FastAPI & Azure OpenAI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
