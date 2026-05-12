import type { Transaction } from "@/types";
import { api } from "./client";

export interface CreateTransactionData {
    category_id: string | null;
    amount: number;
    type: "income" | "expense";
    description: string;
    date: string;
}

export interface TransactionFilters {
    month?: string;
    type?: "income" | "expense";
}

export const transactionsApi = {
    list: async (filters?: TransactionFilters): Promise<Transaction[]> => {
        const res = await api.get("/transactions", { params: filters });
        return res.data;
    },

    create: async (data: CreateTransactionData): Promise<Transaction> => {
        const res = await api.post("/transactions", data);
        return res.data;
    },

    update: async (
        id: string,
        data: CreateTransactionData,
    ): Promise<Transaction> => {
        const res = await api.put(`/transactions/${id}`, data);
        return res.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/transactions/${id}`);
    },
};
