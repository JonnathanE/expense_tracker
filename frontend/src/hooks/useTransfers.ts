import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type CreateTransferData, transfersApi } from "@/api/transfers";
import { handleApiError } from "@/lib/apiError";
import { useFilterStore } from "@/store/filterStore";

export function useTransfers() {
    const getDateRange = useFilterStore((s) => s.getDateRange);
    const periodType = useFilterStore((s) => s.periodType);
    const selectedMonth = useFilterStore((s) => s.selectedMonth);
    const customFrom = useFilterStore((s) => s.customFrom);
    const customTo = useFilterStore((s) => s.customTo);

    return useQuery({
        queryKey: [
            "transfers",
            periodType,
            selectedMonth,
            customFrom,
            customTo,
        ],
        queryFn: () => {
            const { dateFrom, dateTo } = getDateRange();
            return transfersApi.list({ date_from: dateFrom, date_to: dateTo });
        },
    });
}

export function useCreateTransfer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateTransferData) => transfersApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transfers"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
            queryClient.invalidateQueries({ queryKey: ["summary-daily"] });
        },
        onError: (err) => handleApiError(err, "create"),
    });
}

export function useDeleteTransfer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => transfersApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transfers"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
            queryClient.invalidateQueries({ queryKey: ["summary-daily"] });
        },
        onError: (err) => handleApiError(err, "delete"),
    });
}
