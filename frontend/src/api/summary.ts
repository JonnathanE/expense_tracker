import type { Summary } from "@/types";
import { api } from "./client";

export const summaryApi = {
    get: async (dateFrom: string, dateTo: string): Promise<Summary> => {
        const res = await api.get("/summary", {
            params: { date_from: dateFrom, date_to: dateTo },
        });
        return res.data;
    },
};
