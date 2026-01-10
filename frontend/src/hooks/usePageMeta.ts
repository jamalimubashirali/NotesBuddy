import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const usePageMeta = () => {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        let title = 'NotesBuddy';
        let favicon = '/favicons/home.svg';

        if (path === '/') {
            title = 'Home | NotesBuddy';
            favicon = '/favicons/home.svg';
        } else if (path === '/dashboard') {
            title = 'Dashboard | NotesBuddy';
            favicon = '/favicons/dashboard.svg';
        } else if (path === '/login') {
            title = 'Login | NotesBuddy';
            favicon = '/favicons/login.svg';
        } else if (path === '/signup') {
            title = 'Sign Up | NotesBuddy';
            favicon = '/favicons/signup.svg';
        } else if (path === '/generating') {
            title = 'Generating Notes... | NotesBuddy';
            favicon = '/favicons/generating.svg';
        } else if (path.startsWith('/notes/')) {
            title = 'View Note | NotesBuddy';
            favicon = '/favicons/notes.svg';
        } else if (path === '/how-it-works') {
            title = 'How It Works | NotesBuddy';
            favicon = '/favicons/features.svg';
        }

        document.title = title;

        // Update favicon
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = favicon;

    }, [location]);
};

export default usePageMeta;
