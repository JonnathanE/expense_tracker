import type { AuthResponse } from "@/types";
import { api } from "./client";

export const authApi = {
    register: async (data: {
        name: string;
        email: string;
        password: string;
    }): Promise<{ message: string; user_id: string }> => {
        const res = await api.post("/auth/register", data);
        return res.data;
    },

    login: async (data: {
        email: string;
        password: string;
    }): Promise<AuthResponse> => {
        const res = await api.post("/auth/login", data);
        return res.data;
    },

    refresh: async (
        refreshToken: string,
    ): Promise<{
        access_token: string;
        refresh_token: string;
    }> => {
        const res = await api.post("/auth/refresh", {
            refresh_token: refreshToken,
        });
        return res.data;
    },

    logout: async (): Promise<void> => {
        await api.post("/auth/logout");
    },

    activate: async (token: string): Promise<{ message: string }> => {
        const res = await api.get(`/auth/activate?token=${token}`);
        return res.data;
    },

    forgotPassword: async (email: string): Promise<{ message: string }> => {
        const res = await api.post("/auth/forgot-password", { email });
        return res.data;
    },

    resetPassword: async (data: {
        token: string;
        new_password: string;
    }): Promise<{ message: string }> => {
        const res = await api.post("/auth/reset-password", data);
        return res.data;
    },
};
