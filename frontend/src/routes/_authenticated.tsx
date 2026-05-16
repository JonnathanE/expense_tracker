import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import { SidebarLayout } from "@/components/shared/SidebarLayout";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/_authenticated")({
    beforeLoad: () => {
        const { accessToken, refreshToken, logout } = useAuthStore.getState();

        if (!refreshToken) {
            logout();
            toast.error("Tu sesión ha expirado. Inicia sesión nuevamente.");
            throw redirect({ to: "/login" });
        }

        if (!accessToken && !refreshToken) {
            logout();
            toast.error("Tu sesión ha expirado. Inicia sesión nuevamente.");
            throw redirect({ to: "/login" });
        }
    },
    component: () => (
        <SidebarLayout>
            <Outlet />
        </SidebarLayout>
    ),
});
