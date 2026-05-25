import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type CreateCategoryData, categoriesApi } from "@/api/categories";
import { handleApiError } from "@/lib/apiError";

export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: categoriesApi.list,
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateCategoryData) => categoriesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
        onError: (err) => handleApiError(err, "create"),
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateCategoryData }) =>
            categoriesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
        },
        onError: (err) => handleApiError(err, "update"),
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => categoriesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
        },
        onError: (err) => handleApiError(err, "delete"),
    });
}
