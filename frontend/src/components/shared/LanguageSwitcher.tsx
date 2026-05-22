import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGUAGES = [
    { code: "es", flag: "🇪🇸", label: "Español" },
    { code: "en", flag: "🇺🇸", label: "English" },
] as const;

interface LanguageSwitcherProps {
    /** Variant used inside the sidebar dropdown — renders as a plain DropdownMenuItem row */
    variant?: "sidebar" | "footer";
}

export function LanguageSwitcher({
    variant = "footer",
}: LanguageSwitcherProps) {
    const { i18n, t } = useTranslation();

    const current =
        LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

    const handleChange = (code: string) => {
        i18n.changeLanguage(code);
    };

    if (variant === "sidebar") {
        // Inline row inside an existing DropdownMenu — renders a sub-dropdown
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 px-2 h-8 font-normal text-sm"
                    >
                        <Languages className="h-4 w-4" />
                        <span className="flex-1 text-left">
                            {t("language.switch")}
                        </span>
                        <span className="text-base leading-none">
                            {current.flag}
                        </span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    side="right"
                    align="start"
                    className="min-w-36"
                >
                    {LANGUAGES.map((lang) => (
                        <DropdownMenuItem
                            key={lang.code}
                            onClick={() => handleChange(lang.code)}
                            className={`gap-2 ${i18n.language === lang.code ? "font-semibold" : ""}`}
                        >
                            <span className="text-base leading-none">
                                {lang.flag}
                            </span>
                            <span>{lang.label}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    // Footer variant — standalone dropdown button
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                    <span className="text-base leading-none">
                        {current.flag}
                    </span>
                    <span>{current.label}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-36">
                {LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleChange(lang.code)}
                        className={`gap-2 ${i18n.language === lang.code ? "font-semibold" : ""}`}
                    >
                        <span className="text-base leading-none">
                            {lang.flag}
                        </span>
                        <span>{lang.label}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
