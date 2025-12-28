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

    useEffect(() => {
        if (isAuthenticated) {
            refreshUsageStats();
        } else {
            setUsageStats(null);
        }
    }, [isAuthenticated, refreshUsageStats]);

    useEffect(() => {
        const checkAuth = async () => {
            console.log('[AuthContext] Starting checkAuth...');
            try {
                // Checking if the User Authenticated or Not
                console.log('[AuthContext] Calling getMe()...');
                const userData = await getMe();
                console.log('[AuthContext] getMe() succeeded:', userData);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.log('[AuthContext] getMe() failed with error:', error);
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                console.log('[AuthContext] Setting isLoading to false');
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
