import { useQuery } from "@tanstack/react-query";
import { summaryApi } from "@/api/summary";
import { useFilterStore } from "@/store/filterStore";

export function useSummary() {
    const selectedMonth = useFilterStore((s) => s.selectedMonth);

    const query = useQuery({
        queryKey: ["summary", selectedMonth],
        queryFn: () => summaryApi.get(selectedMonth),
    });

    return { ...query, selectedMonth };
}
