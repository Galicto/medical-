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
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    registerAction: (data: { name: string; email: string; password: string; role: string }) => Promise<boolean>;
    logout: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email: string, password: string): Promise<boolean> => {
                set({ isLoading: true, error: null });
                try {
                    const res = await authApi.login(email, password);
                    // Support both cookie-based (local) and token-based (Vercel) backends
                    const { token, user } = res.data.token
                        ? res.data
                        : { token: null, user: res.data };
                    if (token) localStorage.setItem('medlife_token', token);
                    set({ user, token: token || null, isAuthenticated: true, isLoading: false });
                    return true;
                } catch (err: any) {
                    const message = err.response?.data?.message || 'Login failed. Please try again.';
                    set({ error: message, isLoading: false });
                    return false;
                }
            },

            registerAction: async (data): Promise<boolean> => {
                set({ isLoading: true, error: null });
                try {
                    const res = await authApi.register(data);
                    const { token, user } = res.data.token
                        ? res.data
                        : { token: null, user: res.data };
                    if (token) localStorage.setItem('medlife_token', token);
                    set({ user: user || res.data, token: token || null, isAuthenticated: true, isLoading: false });
                    return true;
                } catch (err: any) {
                    const message = err.response?.data?.message || 'Registration failed. Please try again.';
                    set({ error: message, isLoading: false });
                    return false;
                }
            },

            logout: async () => {
                try { await authApi.logout(); } catch { /* Ignore */ }
                localStorage.removeItem('medlife_token');
                set({ user: null, token: null, isAuthenticated: false });
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
