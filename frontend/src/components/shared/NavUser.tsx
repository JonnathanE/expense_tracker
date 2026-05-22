import { useNavigate } from "@tanstack/react-router";
import { ChevronsUpDown, LogOut, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { authApi } from "@/api/auth";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types";

interface NavUserProps {
    user: User | null;
}

function getUserInitials(name: string | undefined): string {
    if (!name) return "?";
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join("");
}

export function NavUser({ user }: NavUserProps) {
    const { isMobile } = useSidebar();
    const { logout } = useAuthStore();
    const { theme, toggle } = useTheme();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch {
            // Si falla igual limpiamos el estado local
        } finally {
            logout();
            toast.success(t("navUser.loggedOut"));
            navigate({ to: "/login" });
        }
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarFallback className="rounded-lg">
                                    {getUserInitials(user?.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {user?.name}
                                </span>
                                <span className="truncate text-xs">
                                    {user?.email}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarFallback className="rounded-lg">
                                        {getUserInitials(user?.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {user?.name}
                                    </span>
                                    <span className="truncate text-xs">
                                        {user?.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={toggle}>
                                {theme === "dark" ? <Sun /> : <Moon />}
                                <span>
                                    {theme === "dark"
                                        ? t("theme.light")
                                        : t("theme.dark")}
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <LanguageSwitcher variant="sidebar" />
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut />
                            <span>{t("navUser.logout")}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
