import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface User {
    email: string;
    username: string;
    full_name?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            // Optionally fetch user details here if needed
            // For now, we'll assume if token exists, user is authenticated
        }
        setIsLoading(false);
    }, []);

    const login = async (data: any) => {
        try {
            const response = await apiLogin(data);
            localStorage.setItem('token', response.access_token);
            setToken(response.access_token);
            toast.success('Successfully logged in!');
            navigate('/');
        } catch (error: any) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (data: any) => {
        try {
            await apiRegister(data);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (error: any) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!token,
            login,
            register,
            logout,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
