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
import { ProtectedRoute } from './components/ProtectedRoute';
import GeneratingView from './components/GeneratingView';
import { AppLoader } from './components/AppLoader';

function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGenerateNotes = (url: string, language: string, style: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/generating', { state: { url, language, style } });
  };

  return (
    <>
      <Hero onSubmit={handleGenerateNotes} isLoading={false} />
      <Features />
      <Footer />
    </>
  );
}

function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <AppLoader />;
  }

  return (
    <Layout>
      <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generating" element={<ProtectedRoute><GeneratingView /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/notes/:id" element={<ProtectedRoute><NoteView /></ProtectedRoute>} />
        <Route path="/how-it-works" element={<Features />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="notesbuddy-theme">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
