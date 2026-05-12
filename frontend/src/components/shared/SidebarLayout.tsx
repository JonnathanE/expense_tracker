import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeftRight, LayoutDashboard, Tag } from "lucide-react";
import { NavUser } from "@/components/shared/NavUser";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";

const NAV_ITEMS = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/transactions", label: "Transacciones", icon: ArrowLeftRight },
    { to: "/categories", label: "Categorías", icon: Tag },
];

interface SidebarLayoutProps {
    children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
    const { user } = useAuthStore();
    const routerState = useRouterState();
    const currentPath = routerState.location.pathname;

    return (
        <SidebarProvider>
            <Sidebar collapsible="icon" side="left">
                {/* Brand */}
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link to="/">
                                    <span className="text-xl">💰</span>
                                    <span className="font-bold">Expense</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                {/* Nav */}
                <SidebarContent>
                    <SidebarMenu>
                        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                            <SidebarMenuItem key={to}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={currentPath === to}
                                    tooltip={label}
                                    className="py-7"
                                >
                                    <Link to={to}>
                                        <Icon />
                                        <span>{label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>

                {/* Footer */}
                <SidebarFooter>
                    <NavUser user={user} />
                </SidebarFooter>
            </Sidebar>

            {/* Contenido principal */}
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                    </div>
                </header>
                <main className="flex-1 overflow-auto">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
