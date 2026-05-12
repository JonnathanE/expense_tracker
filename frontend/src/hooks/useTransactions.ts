import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    type CreateTransactionData,
    transactionsApi,
} from "@/api/transactions";
import { useFilterStore } from "@/store/filterStore";

export function useTransactions() {
    const selectedMonth = useFilterStore((s) => s.selectedMonth);
    return useQuery({
        queryKey: ["transactions", selectedMonth],
        queryFn: () => transactionsApi.list({ month: selectedMonth }),
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
        },
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
        },
    });
}

export function useDeleteTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => transactionsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
        },
    });
}
