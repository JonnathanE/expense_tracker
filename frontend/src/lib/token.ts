import { jwtDecode } from "jwt-decode";

interface JWTPayload {
    user_id: string;
    exp: number;
    iat: number;
}

export function isTokenValid(token: string | null): boolean {
    if (!token) return false;
    try {
        const { exp } = jwtDecode<JWTPayload>(token);
        return exp > Math.floor(Date.now() / 1000);
    } catch {
        return false;
    }
}

export function tokenExpiresIn(token: string): number {
    try {
        const { exp } = jwtDecode<JWTPayload>(token);
        return exp - Math.floor(Date.now() / 1000);
    } catch {
        return 0;
    }
}
