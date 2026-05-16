import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: User | null;
    isAuthenticated: boolean;

    setAuth: (accessToken: string, refreshToken: string, user: User) => void;
    setAccessToken: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,

            setAuth: (accessToken, refreshToken, user) =>
                set({ accessToken, refreshToken, user, isAuthenticated: true }),

            // Solo actualiza los tokens (después de un refresh)
            setAccessToken: (accessToken, refreshToken) =>
                set({ accessToken, refreshToken }),

            logout: () =>
                set({
                    accessToken: null,
                    refreshToken: null,
                    user: null,
                    isAuthenticated: false,
                }),
        }),
        { name: "auth-storage" },
    ),
);
