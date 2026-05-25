import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    type CreateTransactionData,
    transactionsApi,
} from "@/api/transactions";
import { handleApiError } from "@/lib/apiError";
import { useFilterStore } from "@/store/filterStore";

export function useTransactions() {
    const getDateRange = useFilterStore((s) => s.getDateRange);
    const periodType = useFilterStore((s) => s.periodType);
    const selectedMonth = useFilterStore((s) => s.selectedMonth);
    const customFrom = useFilterStore((s) => s.customFrom);
    const customTo = useFilterStore((s) => s.customTo);
    const filterType = useFilterStore((s) => s.filterType);
    const filterAccountId = useFilterStore((s) => s.filterAccountId);
    const filterCategoryId = useFilterStore((s) => s.filterCategoryId);
    const sortOrder = useFilterStore((s) => s.sortOrder);

    return useQuery({
        queryKey: [
            "transactions",
            periodType,
            selectedMonth,
            customFrom,
            customTo,
            filterType,
            filterAccountId,
            filterCategoryId,
            sortOrder,
        ],
        queryFn: () => {
            const { dateFrom, dateTo } = getDateRange();
            return transactionsApi.list({
                date_from: dateFrom,
                date_to: dateTo,
                type: filterType === "all" ? undefined : filterType,
                account_id: filterAccountId || undefined,
                category_id: filterCategoryId || undefined,
                sort: sortOrder,
            });
        },
    });
}

export function useCreateTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateTransactionData) =>
            transactionsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
        },
        onError: (err) => handleApiError(err, "create"),
    });
}

export function useUpdateTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: CreateTransactionData;
        }) => transactionsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
        },
        onError: (err) => handleApiError(err, "update"),
    });
}

export function useDeleteTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => transactionsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
        },
        onError: (err) => handleApiError(err, "delete"),
    });
}
