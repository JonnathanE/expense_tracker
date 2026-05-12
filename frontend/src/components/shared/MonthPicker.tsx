import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFilterStore } from "@/store/filterStore";

export function MonthPicker() {
    const { selectedMonth, setMonth } = useFilterStore();

    const [year, month] = selectedMonth.split("-").map(Number);

    const formatted = new Date(year, month - 1).toLocaleString("es-EC", {
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
                className="h-8 w-8 border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                onClick={() => navigate("prev")}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm font-medium text-zinc-200 capitalize w-36 text-center">
                {formatted}
            </span>

            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                onClick={() => navigate("next")}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
