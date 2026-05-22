import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useFilterStore } from "@/store/filterStore";

export function MonthPicker() {
    const { selectedMonth, setMonth } = useFilterStore();
    const { i18n } = useTranslation();

    const [year, month] = selectedMonth.split("-").map(Number);

    // Usar el idioma activo de i18n para el formato de fecha
    const locale = i18n.language === "en" ? "en-US" : "es-EC";
    const formatted = new Date(year, month - 1).toLocaleString(locale, {
        month: "long",
        year: "numeric",
    });

    const navigate = (direction: "prev" | "next") => {
        const date = new Date(year, month - 1);
        date.setMonth(date.getMonth() + (direction === "next" ? 1 : -1));
        const newMonth = date.toISOString().slice(0, 7);
        setMonth(newMonth);
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigate("prev")}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm font-medium text-foreground capitalize w-36 text-center">
                {formatted}
            </span>

            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigate("next")}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
