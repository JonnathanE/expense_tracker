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

    activate: async (token: string): Promise<{ message: string }> => {
        const res = await api.get(`/auth/activate?token=${token}`);
        return res.data;
    },
};
