import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountsApi, type CreateAccountData } from "@/api/accounts";

export function useAccounts() {
    return useQuery({
        queryKey: ["accounts"],
        queryFn: () => accountsApi.list(),
    });
}

export function useCreateAccount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateAccountData) => accountsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
        },
    });
}

export function useUpdateAccount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateAccountData }) =>
            accountsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
        },
    });
}

export function useDeleteAccount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => accountsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
        },
    });
}
