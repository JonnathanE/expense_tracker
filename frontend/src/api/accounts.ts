import type { Account } from "@/types";
import { api } from "./client";

export interface CreateAccountData {
    name: string;
    icon: string;
    color: string;
    balance: number;
    currency: string;
    exclude_from_stats: boolean;
}

export const accountsApi = {
    list: async (): Promise<Account[]> => {
        const res = await api.get("/accounts");
        return res.data;
    },

    create: async (data: CreateAccountData): Promise<Account> => {
        const res = await api.post("/accounts", data);
        return res.data;
    },

    update: async (id: string, data: CreateAccountData): Promise<Account> => {
        const res = await api.put(`/accounts/${id}`, data);
        return res.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/accounts/${id}`);
    },
};
