import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

export const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Adjunta el token JWT en cada request automáticamente
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Si el token expira, cierra la sesión automáticamente
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const { token, logout } = useAuthStore.getState();
            // Solo redirigir si había una sesión activa (token expirado)
            // Si no había token, es un login fallido — dejar que el componente maneje el error
            if (token) {
                logout();
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    },
);
