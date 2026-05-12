import { create } from "zustand";

interface FilterState {
    selectedMonth: string;
    setMonth: (month: string) => void;
}

const currentMonth = new Date().toISOString().slice(0, 7); // "2025-05"

export const useFilterStore = create<FilterState>((set) => ({
    selectedMonth: currentMonth,
    setMonth: (month) => set({ selectedMonth: month }),
}));
