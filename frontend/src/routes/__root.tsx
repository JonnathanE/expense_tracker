import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@/components/ui/sonner";

const RootLayout = () => (
    <>
        <HeadContent />
        <Outlet />
        <Toaster position="top-right" />
        {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
);

export const Route = createRootRoute({ component: RootLayout });
