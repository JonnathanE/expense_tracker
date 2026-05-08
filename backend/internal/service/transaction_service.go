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
	Month string // "2024-03"
	Type  string // "income" | "expense"
}

func (s *TransactionService) List(ctx context.Context, userID string, filters TransactionFilters) ([]model.Transaction, error) {
	query := `
		SELECT t.id, t.user_id, t.category_id, c.name,
		       t.amount, t.type, t.description, t.date,
		       t.created_at, t.updated_at
		FROM transactions t
		LEFT JOIN categories c ON c.id = t.category_id
		WHERE t.user_id = $1
	`
	args := []any{userID}
	idx := 2

	if filters.Month != "" {
		query += fmt.Sprintf(" AND TO_CHAR(t.date, 'YYYY-MM') = $%d", idx)
		args = append(args, filters.Month)
		idx++
	}
	if filters.Type != "" {
		query += fmt.Sprintf(" AND t.type = $%d", idx)
		args = append(args, filters.Type)
		idx++
	}

	query += " ORDER BY t.date DESC, t.created_at DESC"

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("error consultando transacciones: %w", err)
	}
	defer rows.Close()

	var transactions []model.Transaction
	for rows.Next() {
		var t model.Transaction
		if err := rows.Scan(
			&t.ID, &t.UserID, &t.CategoryID, &t.CategoryName,
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

func (s *TransactionService) Create(ctx context.Context, userID string, categoryID *string, amount float64, txType, description, date string) (*model.Transaction, error) {
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
		`INSERT INTO transactions (user_id, category_id, amount, type, description, date)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, user_id, category_id, amount, type, description, date, created_at, updated_at`,
		userID, categoryID, amount, txType, description, parsedDate,
	).Scan(
		&t.ID, &t.UserID, &t.CategoryID,
		&t.Amount, &t.Type, &t.Description, &t.Date,
		&t.CreatedAt, &t.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("error creando transacción: %w", err)
	}

	return &t, nil
}

func (s *TransactionService) Update(ctx context.Context, id, userID string, categoryID *string, amount float64, txType, description, date string) (*model.Transaction, error) {
	parsedDate, err := time.Parse("2006-01-02", date)
	if err != nil {
		return nil, fmt.Errorf("fecha inválida, usa formato YYYY-MM-DD")
	}

	var t model.Transaction
	err = s.db.QueryRow(ctx,
		`UPDATE transactions
		 SET category_id = $1, amount = $2, type = $3,
		     description = $4, date = $5, updated_at = NOW()
		 WHERE id = $6 AND user_id = $7
		 RETURNING id, user_id, category_id, amount, type, description, date, created_at, updated_at`,
		categoryID, amount, txType, description, parsedDate, id, userID,
	).Scan(
		&t.ID, &t.UserID, &t.CategoryID,
		&t.Amount, &t.Type, &t.Description, &t.Date,
		&t.CreatedAt, &t.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("transacción no encontrada")
	}

	return &t, nil
}

func (s *TransactionService) Delete(ctx context.Context, id, userID string) error {
	result, err := s.db.Exec(ctx,
		`DELETE FROM transactions WHERE id = $1 AND user_id = $2`,
		id, userID,
	)
	if err != nil || result.RowsAffected() == 0 {
		return fmt.Errorf("transacción no encontrada")
	}
	return nil
}
