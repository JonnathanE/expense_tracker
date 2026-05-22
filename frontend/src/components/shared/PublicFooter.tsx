import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function PublicFooter() {
    const { theme, toggle } = useTheme();
    const { t } = useTranslation();

    return (
        <footer className="flex items-center justify-center gap-1 p-4 border-t border-border">
            <LanguageSwitcher variant="footer" />
            <span className="text-muted-foreground/40 select-none">|</span>
            <Button
                variant="ghost"
                size="sm"
                onClick={toggle}
                className="gap-2"
            >
                {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                ) : (
                    <Moon className="h-4 w-4" />
                )}
                <span>
                    {theme === "dark" ? t("theme.light") : t("theme.dark")}
                </span>
            </Button>
        </footer>
    );
}
