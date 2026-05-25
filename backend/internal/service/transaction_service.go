package service

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/JonnathanE/expense_tracker/backend/internal/model"
)

type TransactionService struct {
	db *pgxpool.Pool
}

func NewTransactionService(db *pgxpool.Pool) *TransactionService {
	return &TransactionService{db: db}
}

type TransactionFilters struct {
	DateFrom   string // "2025-05-01"
	DateTo     string // "2025-05-31"
	Type       string // "income" | "expense"
	AccountID  string
	CategoryID string
	Sort       string // "desc" | "asc"  (default: desc)
}

func (s *TransactionService) List(ctx context.Context, userID string, filters TransactionFilters) ([]model.Transaction, error) {
	sort := "DESC"
	if filters.Sort == "asc" {
		sort = "ASC"
	}

	query := `
		SELECT t.id, t.user_id,
		       t.account_id,  a.name  AS account_name,
		       t.category_id, c.name  AS category_name,
		       t.amount, t.type, t.description, t.date,
		       t.created_at, t.updated_at
		FROM transactions t
		LEFT JOIN accounts   a ON a.id = t.account_id
		LEFT JOIN categories c ON c.id = t.category_id
		WHERE t.user_id = $1
	`
	args := []any{userID}
	idx := 2

	if filters.DateFrom != "" && filters.DateTo != "" {
		query += fmt.Sprintf(" AND t.date BETWEEN $%d AND $%d", idx, idx+1)
		args = append(args, filters.DateFrom, filters.DateTo)
		idx += 2
	} else if filters.DateFrom != "" {
		query += fmt.Sprintf(" AND t.date >= $%d", idx)
		args = append(args, filters.DateFrom)
		idx++
	} else if filters.DateTo != "" {
		query += fmt.Sprintf(" AND t.date <= $%d", idx)
		args = append(args, filters.DateTo)
		idx++
	}

	if filters.Type != "" {
		query += fmt.Sprintf(" AND t.type = $%d", idx)
		args = append(args, filters.Type)
		idx++
	}
	if filters.AccountID != "" {
		query += fmt.Sprintf(" AND t.account_id = $%d", idx)
		args = append(args, filters.AccountID)
		idx++
	}
	if filters.CategoryID != "" {
		query += fmt.Sprintf(" AND t.category_id = $%d", idx)
		args = append(args, filters.CategoryID)
		idx++
	}

	query += fmt.Sprintf(" ORDER BY t.date %s, t.created_at %s", sort, sort)

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("error consultando transacciones: %w", err)
	}
	defer rows.Close()

	var transactions []model.Transaction
	for rows.Next() {
		var t model.Transaction
		if err := rows.Scan(
			&t.ID, &t.UserID,
			&t.AccountID, &t.AccountName,
			&t.CategoryID, &t.CategoryName,
			&t.Amount, &t.Type, &t.Description, &t.Date,
			&t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error leyendo transacción: %w", err)
		}
		transactions = append(transactions, t)
	}

	if transactions == nil {
		transactions = []model.Transaction{}
	}

	return transactions, nil
}

func (s *TransactionService) Create(
	ctx context.Context,
	userID string,
	accountID *string,
	categoryID *string,
	amount float64,
	txType, description, date string,
	accountService *AccountService,
) (*model.Transaction, error) {
	if txType != "income" && txType != "expense" {
		return nil, fmt.Errorf("tipo debe ser 'income' o 'expense'")
	}
	if amount <= 0 {
		return nil, fmt.Errorf("el monto debe ser mayor a 0")
	}

	parsedDate, err := time.Parse("2006-01-02", date)
	if err != nil {
		return nil, fmt.Errorf("fecha inválida, usa formato YYYY-MM-DD")
	}

	var t model.Transaction
	err = s.db.QueryRow(ctx,
		`INSERT INTO transactions
       (user_id, account_id, category_id, amount, type, description, date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, user_id, account_id, category_id, amount,
               type, description, date, created_at, updated_at`,
		userID, accountID, categoryID, amount, txType, description, parsedDate,
	).Scan(
		&t.ID, &t.UserID, &t.AccountID, &t.CategoryID,
		&t.Amount, &t.Type, &t.Description, &t.Date,
		&t.CreatedAt, &t.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("error creando transacción: %w", err)
	}

	// Actualizar saldo de la cuenta
	if accountID != nil {
		accountService.UpdateBalance(ctx, *accountID, amount, txType, "add")
	}

	return &t, nil
}

func (s *TransactionService) Update(
	ctx context.Context,
	id, userID string,
	accountID *string,
	categoryID *string,
	amount float64,
	txType, description, date string,
	accountService *AccountService,
) (*model.Transaction, error) {
	parsedDate, err := time.Parse("2006-01-02", date)
	if err != nil {
		return nil, fmt.Errorf("fecha inválida, usa formato YYYY-MM-DD")
	}

	// 1. Obtener datos actuales antes de modificar
	var oldAmount float64
	var oldType string
	var oldAccountID *string

	err = s.db.QueryRow(ctx,
		`SELECT amount, type, account_id
			 FROM transactions WHERE id = $1 AND user_id = $2`,
		id, userID,
	).Scan(&oldAmount, &oldType, &oldAccountID)
	if err != nil {
		return nil, fmt.Errorf("transaction_not_found")
	}

	// 2. Revertir el saldo de la cuenta anterior
	if oldAccountID != nil {
		accountService.UpdateBalance(ctx, *oldAccountID, oldAmount, oldType, "subtract")
	}

	// 3. Actualizar la transacción (incluyendo account_id)
	var t model.Transaction
	err = s.db.QueryRow(ctx,
		`UPDATE transactions
			 SET account_id = $1, category_id = $2, amount = $3, type = $4,
			     description = $5, date = $6, updated_at = NOW()
			 WHERE id = $7 AND user_id = $8
			 RETURNING id, user_id, account_id, category_id,
			           amount, type, description, date, created_at, updated_at`,
		accountID, categoryID, amount, txType, description, parsedDate, id, userID,
	).Scan(
		&t.ID, &t.UserID, &t.AccountID, &t.CategoryID,
		&t.Amount, &t.Type, &t.Description, &t.Date,
		&t.CreatedAt, &t.UpdatedAt,
	)
	if err != nil {
		// Revertir el subtract si el UPDATE falla
		if oldAccountID != nil {
			accountService.UpdateBalance(ctx, *oldAccountID, oldAmount, oldType, "add")
		}
		return nil, fmt.Errorf("error actualizando transacción")
	}

	// 4. Aplicar el saldo en la cuenta nueva
	if accountID != nil {
		accountService.UpdateBalance(ctx, *accountID, amount, txType, "add")
	}

	// 5. Si esta transaction es el fee de alguna transfer → actualizar transfers.fee
	if oldAmount != amount {
		s.db.Exec(ctx,
			`UPDATE transfers
				 SET fee = $1, updated_at = NOW()
				 WHERE fee_transaction_id = $2`,
			amount, id,
		)
	}

	return &t, nil
}

func (s *TransactionService) Delete(
	ctx context.Context,
	id, userID string,
	accountService *AccountService,
) error {
	var accountID *string
	var amount float64
	var txType string

	s.db.QueryRow(ctx,
		`SELECT account_id, amount, type FROM transactions WHERE id = $1 AND user_id = $2`,
		id, userID,
	).Scan(&accountID, &amount, &txType)

	result, err := s.db.Exec(ctx,
		`DELETE FROM transactions WHERE id = $1 AND user_id = $2`, id, userID,
	)
	if err != nil || result.RowsAffected() == 0 {
		return fmt.Errorf("transaction_not_found")
	}

	// Revertir saldo
	if accountID != nil {
		accountService.UpdateBalance(ctx, *accountID, amount, txType, "subtract")
	}

	return nil
}
