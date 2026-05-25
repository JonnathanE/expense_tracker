import { useQuery } from "@tanstack/react-query";
import { summaryApi } from "@/api/summary";
import { useFilterStore } from "@/store/filterStore";

export function useSummary() {
    const getDateRange = useFilterStore((s) => s.getDateRange);
    const periodType = useFilterStore((s) => s.periodType);
    const selectedMonth = useFilterStore((s) => s.selectedMonth);
    const customFrom = useFilterStore((s) => s.customFrom);
    const customTo = useFilterStore((s) => s.customTo);

    const query = useQuery({
        queryKey: ["summary", periodType, selectedMonth, customFrom, customTo],
        queryFn: () => {
            const { dateFrom, dateTo } = getDateRange();
            return summaryApi.get(dateFrom, dateTo);
        },
    });

    return { ...query };
}
