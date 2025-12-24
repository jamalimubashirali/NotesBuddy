import 'katex/dist/katex.min.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import NoteView from './components/NoteView';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

import GeneratingView from './components/GeneratingView';

function Home() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleGenerateNotes = (url: string, language: string, style: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/generating', { state: { url, language, style } });
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen bg-white dark:bg-[#050505] text-zinc-900 dark:text-white">Loading...</div>;
  }

  return (
    <>
      <Hero onSubmit={handleGenerateNotes} isLoading={false} />
      <Features />
      <Footer />
    </>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="notesbuddy-theme">
      <AuthProvider>
        <Layout>
          <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/generating" element={<GeneratingView />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notes/:id" element={<NoteView />} />
            <Route path="/how-it-works" element={<Features />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
