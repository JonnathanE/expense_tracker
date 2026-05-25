package handler

import "time"

// ── Request structs ───────────────────────────────────────────────────────────

type registerRequest struct {
	Name     string `json:"name" example:"Juan Pérez"`
	Email    string `json:"email" example:"juan@example.com"`
	Password string `json:"password" example:"secret123"`
}

type loginRequest struct {
	Email    string `json:"email" example:"juan@example.com"`
	Password string `json:"password" example:"secret123"`
}

type refreshRequest struct {
	RefreshToken string `json:"refresh_token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
}

type forgotPasswordRequest struct {
	Email string `json:"email" example:"juan@example.com"`
}

type resetPasswordRequest struct {
	Token       string `json:"token" example:"abc123token"`
	NewPassword string `json:"new_password" example:"newsecret123"`
}

type accountRequest struct {
	Name             string  `json:"name" example:"Cuenta corriente"`
	Icon             string  `json:"icon" example:"wallet"`
	Color            string  `json:"color" example:"#6366f1"`
	Balance          float64 `json:"balance" example:"1500.50"`
	Currency         string  `json:"currency" example:"USD"`
	ExcludeFromStats bool    `json:"exclude_from_stats" example:"false"`
}

type categoryRequest struct {
	Name  string `json:"name" example:"Alimentación"`
	Type  string `json:"type" example:"expense"`
	Icon  string `json:"icon" example:"🍔"`
	Color string `json:"color" example:"#f59e0b"`
}

type transactionRequest struct {
	AccountID   *string `json:"account_id" example:"550e8400-e29b-41d4-a716-446655440000"`
	CategoryID  *string `json:"category_id" example:"550e8400-e29b-41d4-a716-446655440000"`
	Amount      float64 `json:"amount" example:"50.00"`
	Type        string  `json:"type" example:"expense"`
	Description string  `json:"description" example:"Almuerzo"`
	Date        string  `json:"date" example:"2025-05-25"`
}

type transferRequest struct {
	FromAccountID string  `json:"from_account_id" example:"550e8400-e29b-41d4-a716-446655440000"`
	ToAccountID   string  `json:"to_account_id" example:"550e8400-e29b-41d4-a716-446655440001"`
	Amount        float64 `json:"amount" example:"200.00"`
	Fee           float64 `json:"fee" example:"0.00"`
	Description   string  `json:"description" example:"Transferencia mensual"`
	Date          string  `json:"date" example:"2025-05-25"`
}

// ── Response structs ──────────────────────────────────────────────────────────

type errorResponse struct {
	Error string `json:"error" example:"invalid_credentials"`
}

type messageResponse struct {
	Message string `json:"message" example:"operation_success"`
}

type registerResponse struct {
	Message string `json:"message" example:"register_success"`
	UserID  string `json:"user_id" example:"550e8400-e29b-41d4-a716-446655440000"`
}

type loginResponse struct {
	AccessToken  string   `json:"access_token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
	RefreshToken string   `json:"refresh_token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
	User         userInfo `json:"user"`
}

type tokenResponse struct {
	AccessToken  string `json:"access_token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
	RefreshToken string `json:"refresh_token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
}

type userInfo struct {
	ID    string `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	Name  string `json:"name" example:"Juan Pérez"`
	Email string `json:"email" example:"juan@example.com"`
}

type accountResponse struct {
	ID               string    `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	UserID           string    `json:"user_id" example:"550e8400-e29b-41d4-a716-446655440000"`
	Name             string    `json:"name" example:"Cuenta corriente"`
	Icon             string    `json:"icon" example:"wallet"`
	Color            string    `json:"color" example:"#6366f1"`
	Balance          float64   `json:"balance" example:"1500.50"`
	Currency         string    `json:"currency" example:"USD"`
	ExcludeFromStats bool      `json:"exclude_from_stats" example:"false"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type categoryResponse struct {
	ID        string    `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	UserID    string    `json:"user_id" example:"550e8400-e29b-41d4-a716-446655440000"`
	Name      string    `json:"name" example:"Alimentación"`
	Type      string    `json:"type" example:"expense"`
	Icon      string    `json:"icon" example:"🍔"`
	Color     string    `json:"color" example:"#f59e0b"`
	CreatedAt time.Time `json:"created_at"`
}

type transactionResponse struct {
	ID           string    `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	UserID       string    `json:"user_id" example:"550e8400-e29b-41d4-a716-446655440000"`
	AccountID    *string   `json:"account_id" example:"550e8400-e29b-41d4-a716-446655440000"`
	AccountName  *string   `json:"account_name,omitempty" example:"Cuenta corriente"`
	CategoryID   *string   `json:"category_id" example:"550e8400-e29b-41d4-a716-446655440000"`
	CategoryName *string   `json:"category_name,omitempty" example:"Alimentación"`
	Amount       float64   `json:"amount" example:"50.00"`
	Type         string    `json:"type" example:"expense"`
	Description  *string   `json:"description" example:"Almuerzo"`
	Date         time.Time `json:"date"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type transferResponse struct {
	ID              string    `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	UserID          string    `json:"user_id" example:"550e8400-e29b-41d4-a716-446655440000"`
	FromAccountID   string    `json:"from_account_id" example:"550e8400-e29b-41d4-a716-446655440000"`
	ToAccountID     string    `json:"to_account_id" example:"550e8400-e29b-41d4-a716-446655440001"`
	FromAccountName *string   `json:"from_account_name,omitempty" example:"Cuenta corriente"`
	ToAccountName   *string   `json:"to_account_name,omitempty" example:"Ahorros"`
	Amount          float64   `json:"amount" example:"200.00"`
	Fee             float64   `json:"fee" example:"0.00"`
	Description     *string   `json:"description" example:"Transferencia mensual"`
	Date            time.Time `json:"date"`
	CreatedAt       time.Time `json:"created_at"`
}

type summaryResponse struct {
	Month        string                    `json:"month" example:"2025-05"`
	TotalIncome  float64                   `json:"total_income" example:"3000.00"`
	TotalExpense float64                   `json:"total_expense" example:"1200.00"`
	Balance      float64                   `json:"balance" example:"1800.00"`
	ByCategory   []categorySummaryResponse `json:"by_category"`
}

type categorySummaryResponse struct {
	CategoryID   *string `json:"category_id" example:"550e8400-e29b-41d4-a716-446655440000"`
	CategoryName *string `json:"category_name" example:"Alimentación"`
	Icon         *string `json:"icon" example:"🍔"`
	Color        *string `json:"color" example:"#f59e0b"`
	Type         *string `json:"type" example:"expense"`
	Total        float64 `json:"total" example:"350.00"`
	TxCount      int     `json:"tx_count" example:"12"`
}
