import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TooltipProvider } from "@/components/ui/tooltip";

// import App from "./App.tsx";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import "./index.css";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 1000 * 60, // 1 minuto
        },
    },
});

const router = createRouter({ routeTree });

// Tipado global del router (requerido por TanStack Router)
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <RouterProvider router={router} />
                {import.meta.env.DEV && (
                    <ReactQueryDevtools initialIsOpen={false} />
                )}
            </TooltipProvider>
        </QueryClientProvider>
    </StrictMode>,
);
