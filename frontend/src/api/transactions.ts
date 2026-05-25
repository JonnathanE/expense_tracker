import type { Transaction } from "@/types";
import { api } from "./client";

export interface CreateTransactionData {
    account_id: string | null;
    category_id: string | null;
    amount: number;
    type: "income" | "expense";
    description: string;
    date: string;
}

export interface TransactionFilters {
    date_from?: string;
    date_to?: string;
    type?: "income" | "expense";
    account_id?: string;
    category_id?: string;
    sort?: "asc" | "desc";
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
