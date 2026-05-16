export type TransactionType = "income" | "expense";

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: User;
}

export interface Category {
    id: string;
    user_id: string;
    name: string;
    type: TransactionType;
    icon: string;
    color: string;
    created_at: string;
}

export interface Transaction {
    id: string;
    user_id: string;
    category_id: string | null;
    category_name: string | null;
    amount: number;
    type: TransactionType;
    description: string | null;
    date: string;
    created_at: string;
    updated_at: string;
}

export interface CategorySummary {
    category_id: string;
    category_name: string;
    icon: string;
    color: string;
    type: TransactionType;
    total: number;
    tx_count: number;
}

export interface Summary {
    month: string;
    total_income: number;
    total_expense: number;
    balance: number;
    by_category: CategorySummary[];
}
