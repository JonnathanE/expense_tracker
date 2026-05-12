import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeftRight, LayoutDashboard, LogOut, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    const { user, logout } = useAuthStore();
    const routerState = useRouterState();
    const currentPath = routerState.location.pathname;

    return (
        <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
            {/* ── Sidebar ───────────────────────────────────────────────── */}
            <aside className="w-56 shrink-0 border-r border-zinc-800 flex flex-col">
                {/* Brand */}
                <div className="flex items-center gap-3 px-5 py-6 border-b border-zinc-800">
                    <span className="text-2xl">💰</span>
                    <span className="font-bold text-white text-lg">
                        Expense
                    </span>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                        const isActive = currentPath === to;
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-150
                  ${
                      isActive
                          ? "bg-indigo-600 text-white"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
}
                `}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer: usuario + logout */}
                <div className="px-4 py-4 border-t border-zinc-800 space-y-3">
                    <div className="px-1">
                        <p className="text-sm font-medium text-zinc-200 truncate">
                            {user?.name}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                            {user?.email}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-zinc-800 gap-2"
                        onClick={logout}
                    >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                    </Button>
                </div>
            </aside>

            {/* ── Contenido principal ───────────────────────────────────── */}
            <main className="flex-1 overflow-auto">{children}</main>
        </div>
    );
}
