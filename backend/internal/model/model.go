package model

import "time"

type User struct {
	ID                     string     `json:"id"`
	Name                   string     `json:"name"`
	Email                  string     `json:"email"`
	ProfileURL             *string    `json:"profile_url"`
	IsActive               bool       `json:"is_active"`
	ActivationToken        *string    `json:"-"` // nunca exponer en JSON
	ActivationTokenExpires *time.Time `json:"-"`
	CreatedAt              time.Time  `json:"created_at"`
	UpdatedAt              time.Time  `json:"updated_at"`
}

type Account struct {
	ID               string    `json:"id"`
	UserID           string    `json:"user_id"`
	Name             string    `json:"name"`
	Icon             string    `json:"icon"`
	Color            string    `json:"color"`
	Balance          float64   `json:"balance"`
	Currency         string    `json:"currency"`
	ExcludeFromStats bool      `json:"exclude_from_stats"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type Category struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Name      string    `json:"name"`
	Type      string    `json:"type"`
	Icon      string    `json:"icon"`
	Color     string    `json:"color"`
	CreatedAt time.Time `json:"created_at"`
}

type Transaction struct {
	ID           string    `json:"id"`
	UserID       string    `json:"user_id"`
	AccountID    *string   `json:"account_id"`
	AccountName  *string   `json:"account_name,omitempty"`
	CategoryID   *string   `json:"category_id"`
	CategoryName *string   `json:"category_name,omitempty"`
	Amount       float64   `json:"amount"`
	Type         string    `json:"type"`
	Description  *string   `json:"description"`
	Date         time.Time `json:"date"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Transfer struct {
	ID               string    `json:"id"`
	UserID           string    `json:"user_id"`
	FromAccountID    string    `json:"from_account_id"`
	ToAccountID      string    `json:"to_account_id"`
	FromAccountName  *string   `json:"from_account_name,omitempty"`
	ToAccountName    *string   `json:"to_account_name,omitempty"`
	Amount           float64   `json:"amount"`
	Fee              float64   `json:"fee"`
	FeeTransactionID *string   `json:"fee_transaction_id"`
	Description      *string   `json:"description"`
	Date             time.Time `json:"date"`
	CreatedAt        time.Time `json:"created_at"`
}

type Budget struct {
	ID         string    `json:"id"`
	UserID     string    `json:"user_id"`
	CategoryID string    `json:"category_id"`
	Amount     float64   `json:"amount"`
	Month      string    `json:"month"`
	CreatedAt  time.Time `json:"created_at"`
}

type Summary struct {
	Month        string            `json:"month"`
	TotalIncome  float64           `json:"total_income"`
	TotalExpense float64           `json:"total_expense"`
	Balance      float64           `json:"balance"`
	ByCategory   []CategorySummary `json:"by_category"`
}

type CategorySummary struct {
	CategoryID   *string `json:"category_id"`
	CategoryName *string `json:"category_name"`
	Icon         *string `json:"icon"`
	Color        *string `json:"color"`
	Type         *string `json:"type"`
	Total        float64 `json:"total"`
	TxCount      int     `json:"tx_count"` // cuántas transacciones tiene
}

type DailySummary struct {
	Date    string  `json:"date"`    // YYYY-MM-DD
	Balance float64 `json:"balance"` // balance acumulado hasta este día
}
