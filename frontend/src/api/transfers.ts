import type { Transfer } from "@/types";
import { api } from "./client";

export interface CreateTransferData {
    from_account_id: string;
    to_account_id: string;
    amount: number;
    fee: number;
    description: string;
    date: string;
}

export interface TransferFilters {
    date_from?: string;
    date_to?: string;
}

export const transfersApi = {
    list: async (filters?: TransferFilters): Promise<Transfer[]> => {
        const res = await api.get("/transfers", { params: filters });
        return res.data;
    },

    create: async (data: CreateTransferData): Promise<Transfer> => {
        const res = await api.post("/transfers", data);
        return res.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/transfers/${id}`);
    },
};
