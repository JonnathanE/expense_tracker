import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeftRight, LayoutDashboard, Tag, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import logo from "@/assets/logo.png";
import { NavUser } from "@/components/shared/NavUser";
import { QuickActions } from "@/components/shared/QuickActions";
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
    useSidebar,
} from "@/components/ui/sidebar";
import { APP_NAME_SHORT } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types";

const NAV_ITEMS = [
    { to: "/", labelKey: "nav.dashboard", icon: LayoutDashboard },
    { to: "/transactions", labelKey: "nav.transactions", icon: ArrowLeftRight },
    { to: "/accounts", labelKey: "nav.accounts", icon: Wallet },
    { to: "/categories", labelKey: "nav.categories", icon: Tag },
] as const;

interface SidebarLayoutProps {
    children: React.ReactNode;
}

function AppSidebar({ user }: { user: User | null }) {
    const routerState = useRouterState();
    const currentPath = routerState.location.pathname;
    const { setOpenMobile, isMobile } = useSidebar();
    const { t } = useTranslation();

    const handleNavClick = () => {
        if (isMobile) setOpenMobile(false);
    };

    return (
        <Sidebar collapsible="icon" side="left">
            {/* Brand */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to="/" onClick={handleNavClick}>
                                <img
                                    src={logo}
                                    alt="Logo"
                                    className="w-6 h-6 rounded-md"
                                />
                                <span className="font-bold">
                                    {APP_NAME_SHORT}
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Nav */}
            <SidebarContent>
                <SidebarMenu>
                    {NAV_ITEMS.map(({ to, labelKey, icon: Icon }) => {
                        const label = t(labelKey);
                        return (
                            <SidebarMenuItem key={to}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={currentPath === to}
                                    tooltip={label}
                                    className="py-7"
                                >
                                    <Link to={to} onClick={handleNavClick}>
                                        <Icon />
                                        <span>{label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
    const { user } = useAuthStore();

    return (
        <SidebarProvider>
            <AppSidebar user={user} />

            {/* Contenido principal */}
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                    </div>
                    <div className="ml-auto flex items-center gap-2 px-4">
                        <QuickActions />
                    </div>
                </header>
                <main className="flex-1 overflow-auto">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
