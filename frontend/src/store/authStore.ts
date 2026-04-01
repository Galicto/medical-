import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/services/api';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    registerAction: (data: { name: string; email: string; password: string; role: string }) => Promise<boolean>;
    logout: () => Promise<void>;
    clearError: () => void;
}

// Demo users for when backend is not running
const DEMO_USERS: Record<string, User & { password: string }> = {
    'admin@medlife.com': { id: '1', name: 'Super Admin', email: 'admin@medlife.com', role: 'ADMIN', password: 'admin123' },
    'doctor@medlife.com': { id: '2', name: 'Dr. John Doe', email: 'doctor@medlife.com', role: 'DOCTOR', password: 'doctor123' },
    'patient@medlife.com': { id: '3', name: 'Jane Smith', email: 'patient@medlife.com', role: 'PATIENT', password: 'patient123' },
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email: string, password: string): Promise<boolean> => {
                set({ isLoading: true, error: null });
                try {
                    // Try real backend first
                    const res = await authApi.login(email, password);
                    const user = res.data;
                    set({ user, isAuthenticated: true, isLoading: false });
                    return true;
                } catch (err: any) {
                    // If backend is down, use demo credentials
                    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
                        const demoUser = DEMO_USERS[email];
                        if (demoUser && demoUser.password === password) {
                            const { password: _, ...user } = demoUser;
                            set({ user, isAuthenticated: true, isLoading: false });
                            return true;
                        }
                        set({ error: 'Invalid email or password', isLoading: false });
                        return false;
                    }
                    const message = err.response?.data?.message || 'Login failed. Please try again.';
                    set({ error: message, isLoading: false });
                    return false;
                }
            },

            registerAction: async (data): Promise<boolean> => {
                set({ isLoading: true, error: null });
                try {
                    const res = await authApi.register(data);
                    const user = res.data.user;
                    set({ user, isAuthenticated: true, isLoading: false });
                    return true;
                } catch (err: any) {
                    const message = err.response?.data?.message || 'Registration failed. Please try again.';
                    set({ error: message, isLoading: false });
                    return false;
                }
            },

            logout: async () => {
                try {
                    await authApi.logout();
                } catch {
                    // Ignore
                }
                set({ user: null, isAuthenticated: false });
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
