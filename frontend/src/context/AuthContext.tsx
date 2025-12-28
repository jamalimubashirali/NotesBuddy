import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getLimits, getMe } from '../services/api';
import { useNavigate } from 'react-router-dom';
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
    usageStats: UsageStats | null;
    refreshUsageStats: () => Promise<void>;
}

interface UsageStats {
    notes_count: number;
    max_notes: number;
    tokens_used: number;
    daily_token_limit: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
    const navigate = useNavigate();
    const initializedRef = React.useRef(false);

    const refreshUsageStats = useCallback(async () => {
        if (isAuthenticated) {
            try {
                const stats = await getLimits();
                setUsageStats(stats);
            } catch (error) {
                console.error('Failed to fetch usage stats:', error);
            }
        }
    }, [isAuthenticated]);

    // Initialize app - fetch auth status and usage stats before showing content
    useEffect(() => {
        // Prevent double initialization
        if (initializedRef.current) return;
        initializedRef.current = true;

        const initializeApp = async () => {
            try {
                // Add a timeout to prevent hanging indefinitely
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Auth check timeout')), 5000)
                );

                const userData = await Promise.race([
                    getMe(),
                    timeoutPromise
                ]);

                setUser(userData as any);
                setIsAuthenticated(true);

                // Fetch usage stats immediately after successful auth
                try {
                    const stats = await getLimits();
                    setUsageStats(stats);
                } catch (error) {
                    console.error('Failed to fetch usage stats:', error);
                    // Continue even if stats fail - don't block the app
                }
            } catch (error) {
                // Not authenticated or timed out
                setUser(null);
                setIsAuthenticated(false);
                setUsageStats(null);
            } finally {
                // Only set loading to false after ALL initial API calls complete
                setIsLoading(false);
            }
        };

        initializeApp();
    }, []);

    const login = async (data: any) => {
        try {
            const response = await apiLogin(data);
            // Response contains message and user object
            setUser(response.user);
            setIsAuthenticated(true);

            // Fetch usage stats after login
            try {
                const stats = await getLimits();
                setUsageStats(stats);
            } catch (error) {
                console.error('Failed to fetch usage stats:', error);
            }

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
        setUsageStats(null);
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
            isLoading,
            usageStats,
            refreshUsageStats
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
