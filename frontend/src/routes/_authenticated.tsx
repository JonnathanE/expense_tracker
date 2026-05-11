import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SidebarLayout } from "@/components/shared/SidebarLayout";
import { useAuthStore } from "@/store/authStore";

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
