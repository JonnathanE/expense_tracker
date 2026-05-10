import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { SidebarLayout } from "@/components/shared/SidebarLayout";

export const Route = createFileRoute("/_authenticated")({
    // beforeLoad se ejecuta antes de renderizar la ruta
    // Si no hay sesión, redirige al login
    beforeLoad: () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
            throw redirect({ to: "/login" });
        }
    },
    component: () => (
        <SidebarLayout>
            <Outlet />
        </SidebarLayout>
    ),
});
