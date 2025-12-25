import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../services/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface User {
    email: string;
    username: string;
    full_name?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Try to get current user
                // We use axios directly here to avoid circular dependency if we used api.ts functions that might use useAuth
                // But api.ts functions don't use useAuth, so it's fine.
                // However, we need to call the /me endpoint.
                const response = await axios.get('http://127.0.0.1:8000/api/v1/auth/me');
                setUser(response.data);
                setIsAuthenticated(true);
            } catch (error) {
                // If 401, the interceptor in api.ts (which is global) will try to refresh.
                // If refresh fails, it redirects to login.
                // Here we just set state to unauthenticated.
                console.log('Not authenticated');
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (data: any) => {
        try {
            const response = await apiLogin(data);
            // Response contains message and user object
            setUser(response.user);
            setIsAuthenticated(true);
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

    const logout = async () => {
        try {
            await apiLogout();
        } catch (error) {
            console.error('Logout failed', error);
        }
        setUser(null);
        setIsAuthenticated(false);
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
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
