import type { Category } from "@/types";
import { api } from "./client";

export interface CreateCategoryData {
    name: string;
    type: "income" | "expense";
    icon: string;
    color: string;
}

export const categoriesApi = {
    list: async (): Promise<Category[]> => {
        const res = await api.get("/categories");
        return res.data;
    },

    create: async (data: CreateCategoryData): Promise<Category> => {
        const res = await api.post("/categories", data);
        return res.data;
    },

    update: async (
        id: string,
        data: Partial<CreateCategoryData>,
    ): Promise<Category> => {
        const res = await api.put(`/categories/${id}`, data);
        return res.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/categories/${id}`);
    },
};
