import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import { SidebarLayout } from "@/components/shared/SidebarLayout";
import i18n from "@/i18n";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/_authenticated")({
    beforeLoad: () => {
        const { accessToken, refreshToken, logout } = useAuthStore.getState();

        if (!refreshToken) {
            logout();
            toast.error(i18n.t("auth.sessionExpired"));
            throw redirect({ to: "/login" });
        }

        if (!accessToken && !refreshToken) {
            logout();
            toast.error(i18n.t("auth.sessionExpired"));
            throw redirect({ to: "/login" });
        }
    },
    component: () => (
        <SidebarLayout>
            <Outlet />
        </SidebarLayout>
    ),
});
