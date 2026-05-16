import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

export const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// ── Request: adjunta access token ────────────────────────────────────────────
api.interceptors.request.use((config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// ── Response: maneja 401 intentando refresh ───────────────────────────────────
let isRefreshing = false;
let pendingQueue: Array<{
    resolve: (token: string | null) => void;
    reject: (error: unknown) => void;
}> = [];

const processPendingQueue = (error: unknown, token: string | null) => {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    pendingQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si no es 401 o ya reintentamos → propagar error
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        const { refreshToken, setAccessToken, logout } =
            useAuthStore.getState();

        // Si no hay refresh token → ruta pública, propagar el error sin redirigir
        if (!refreshToken) {
            return Promise.reject(error);
        }

        // Si ya hay un refresh en curso, encolar la petición
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingQueue.push({ resolve, reject });
            }).then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            });
        }

        // Iniciar el proceso de refresh
        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const res = await axios.post(`${BASE_URL}/auth/refresh`, {
                refresh_token: refreshToken,
            });

            const { access_token, refresh_token } = res.data;

            setAccessToken(access_token, refresh_token);
            processPendingQueue(null, access_token);

            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return api(originalRequest);
        } catch (refreshError) {
            processPendingQueue(refreshError, null);
            logout();
            window.location.href = "/login";
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);
