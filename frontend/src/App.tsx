import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { InputSection } from './components/InputSection';
import { NotesDisplay } from './components/NotesDisplay';
import { HowItWorks } from './pages/HowItWorks';
import { Features } from './pages/Features';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { generateNotes } from './services/api';
import { Toaster, toast } from 'react-hot-toast';
import { BookOpen, Github, LogIn, UserPlus, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';

function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState<string>('');
  const { isAuthenticated } = useAuth();

  const handleGenerateNotes = async (url: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to generate notes');
      return;
    }
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
    <>
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
    </>
  );
}

function Navigation() {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path ? "text-blue-600 dark:text-blue-400" : "text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400";
  };

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            NotesBuddy
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/how-it-works" className={`text-sm font-medium transition-colors ${isActive('/how-it-works')}`}>How it works</Link>
          <Link to="/features" className={`text-sm font-medium transition-colors ${isActive('/features')}`}>Features</Link>
          <a href="https://github.com/jamalimubashirali/NotesBuddy" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
            <Github className="w-4 h-4" />
            GitHub
          </a>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>

          {isAuthenticated ? (
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className={`text-sm font-medium transition-colors ${isActive('/login')} flex items-center gap-1`}>
                <LogIn className="w-4 h-4" />
                Login
              </Link>
              <Link to="/signup" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                <UserPlus className="w-4 h-4" />
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 font-sans">
        <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />

        <Navigation />

        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/features" element={<Features />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>

        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">NotesBuddy AI</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} NotesBuddy. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
