import type { Summary } from "@/types";
import { api } from "./client";

export const summaryApi = {
    get: async (month: string): Promise<Summary> => {
        const res = await api.get("/summary", { params: { month } });
        return res.data;
    },
};
