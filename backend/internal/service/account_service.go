package service

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/JonnathanE/expense_tracker/backend/internal/model"
)

type AccountService struct {
	db *pgxpool.Pool
}

func NewAccountService(db *pgxpool.Pool) *AccountService {
	return &AccountService{db: db}
}

func (s *AccountService) List(ctx context.Context, userID string) ([]model.Account, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, user_id, name, icon, color, balance, currency,
            exclude_from_stats, created_at, updated_at
     FROM accounts
     WHERE user_id = $1
     ORDER BY created_at ASC`,
		userID,
	)
	if err != nil {
		return nil, fmt.Errorf("error consultando cuentas: %w", err)
	}
	defer rows.Close()

	var accounts []model.Account
	for rows.Next() {
		var a model.Account
		if err := rows.Scan(
			&a.ID, &a.UserID, &a.Name, &a.Icon, &a.Color,
			&a.Balance, &a.Currency, &a.ExcludeFromStats,
			&a.CreatedAt, &a.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("error leyendo cuenta: %w", err)
		}
		accounts = append(accounts, a)
	}

	if accounts == nil {
		accounts = []model.Account{}
	}

	return accounts, nil
}

func (s *AccountService) Create(
	ctx context.Context,
	userID, name, icon, color, currency string,
	initialBalance float64,
	excludeFromStats bool,
) (*model.Account, error) {
	var a model.Account
	err := s.db.QueryRow(ctx,
		`INSERT INTO accounts
       (user_id, name, icon, color, balance, currency, exclude_from_stats)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, user_id, name, icon, color, balance, currency,
               exclude_from_stats, created_at, updated_at`,
		userID, name, icon, color, initialBalance, currency, excludeFromStats,
	).Scan(
		&a.ID, &a.UserID, &a.Name, &a.Icon, &a.Color,
		&a.Balance, &a.Currency, &a.ExcludeFromStats,
		&a.CreatedAt, &a.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("error creando cuenta: %w", err)
	}
	return &a, nil
}

// CreateDefault crea la cuenta Cash por defecto al registrarse
func (s *AccountService) CreateDefault(ctx context.Context, userID, currency string) error {
	_, err := s.db.Exec(ctx,
		`INSERT INTO accounts (user_id, name, icon, color, currency)
     VALUES ($1, 'Cash', 'wallet', '#6366f1', $2)`,
		userID, currency,
	)
	return err
}

func (s *AccountService) Update(
	ctx context.Context,
	id, userID, name, icon, color string,
	balance float64,
	excludeFromStats bool,
) (*model.Account, error) {
	var a model.Account
	err := s.db.QueryRow(ctx,
		`UPDATE accounts
     SET name = $1, icon = $2, color = $3, balance = $4,
         exclude_from_stats = $5, updated_at = NOW()
     WHERE id = $6 AND user_id = $7
     RETURNING id, user_id, name, icon, color, balance, currency,
               exclude_from_stats, created_at, updated_at`,
		name, icon, color, balance, excludeFromStats, id, userID,
	).Scan(
		&a.ID, &a.UserID, &a.Name, &a.Icon, &a.Color,
		&a.Balance, &a.Currency, &a.ExcludeFromStats,
		&a.CreatedAt, &a.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("cuenta no encontrada")
	}
	return &a, nil
}

func (s *AccountService) Delete(ctx context.Context, id, userID string) error {
	// Verificar que no sea la última cuenta
	var count int
	s.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM accounts WHERE user_id = $1`, userID,
	).Scan(&count)

	if count <= 1 {
		return fmt.Errorf("cannot_delete_last_account")
	}

	result, err := s.db.Exec(ctx,
		`DELETE FROM accounts WHERE id = $1 AND user_id = $2`, id, userID,
	)
	if err != nil || result.RowsAffected() == 0 {
		return fmt.Errorf("account_not_found")
	}
	return nil
}

// UpdateBalance ajusta el saldo cuando se crea/edita/elimina una transacción
func (s *AccountService) UpdateBalance(
	ctx context.Context,
	accountID string,
	amount float64,
	txType string, // "income" | "expense"
	operation string, // "add" | "subtract"
) error {
	var delta float64
	if txType == "income" {
		delta = amount
	} else {
		delta = -amount
	}

	if operation == "subtract" {
		delta = -delta
	}

	_, err := s.db.Exec(ctx,
		`UPDATE accounts
     SET balance = balance + $1, updated_at = NOW()
     WHERE id = $2`,
		delta, accountID,
	)
	return err
}
