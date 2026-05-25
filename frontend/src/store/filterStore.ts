import { create } from "zustand";

export type PeriodType = "month" | "week" | "year" | "custom";
export type FilterType = "all" | "income" | "expense";
export type SortOrder = "desc" | "asc";

interface FilterState {
    // Period
    periodType: PeriodType;
    selectedMonth: string; // "YYYY-MM" — used when periodType === "month"
    customFrom: string; // "YYYY-MM-DD"
    customTo: string; // "YYYY-MM-DD"

    // Filters
    filterType: FilterType;
    filterAccountId: string;
    filterCategoryId: string;
    sortOrder: SortOrder;

    // Setters
    setPeriodType: (type: PeriodType) => void;
    setMonth: (month: string) => void;
    setCustomRange: (from: string, to: string) => void;
    setFilterType: (type: FilterType) => void;
    setFilterAccountId: (id: string) => void;
    setFilterCategoryId: (id: string) => void;
    setSortOrder: (order: SortOrder) => void;

    // Computed
    getDateRange: () => { dateFrom: string; dateTo: string };
}

const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

function startOfWeek(d: Date): Date {
    const day = d.getDay(); // 0=Sun
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Mon
    return new Date(d.getFullYear(), d.getMonth(), diff);
}

export const useFilterStore = create<FilterState>((set, get) => ({
    periodType: "month",
    selectedMonth: currentMonth,
    customFrom: "",
    customTo: "",

    filterType: "all",
    filterAccountId: "",
    filterCategoryId: "",
    sortOrder: "desc",

    setPeriodType: (type) => set({ periodType: type }),
    setMonth: (month) => set({ selectedMonth: month }),
    setCustomRange: (from, to) => set({ customFrom: from, customTo: to }),
    setFilterType: (type) => set({ filterType: type }),
    setFilterAccountId: (id) => set({ filterAccountId: id }),
    setFilterCategoryId: (id) => set({ filterCategoryId: id }),
    setSortOrder: (order) => set({ sortOrder: order }),

    getDateRange: () => {
        const { periodType, selectedMonth, customFrom, customTo } = get();
        const now = new Date();

        switch (periodType) {
            case "month": {
                const [y, m] = selectedMonth.split("-").map(Number);
                const first = new Date(y, m - 1, 1);
                const last = new Date(y, m, 0);
                return {
                    dateFrom: first.toISOString().slice(0, 10),
                    dateTo: last.toISOString().slice(0, 10),
                };
            }
            case "week": {
                const mon = startOfWeek(now);
                const sun = new Date(mon);
                sun.setDate(mon.getDate() + 6);
                return {
                    dateFrom: mon.toISOString().slice(0, 10),
                    dateTo: sun.toISOString().slice(0, 10),
                };
            }
            case "year": {
                const y = now.getFullYear();
                return {
                    dateFrom: `${y}-01-01`,
                    dateTo: `${y}-12-31`,
                };
            }
            case "custom":
                return { dateFrom: customFrom, dateTo: customTo };
        }
    },
}));
