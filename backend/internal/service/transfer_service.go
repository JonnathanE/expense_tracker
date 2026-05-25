package service

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/JonnathanE/expense_tracker/backend/internal/model"
)

type TransferService struct {
	db *pgxpool.Pool
}

func NewTransferService(db *pgxpool.Pool) *TransferService {
	return &TransferService{db: db}
}

type CreateTransferParams struct {
	UserID        string
	FromAccountID string
	ToAccountID   string
	Amount        float64
	Fee           float64
	Description   string
	Date          string
}

func (s *TransferService) Create(ctx context.Context, p CreateTransferParams) (*model.Transfer, error) {
	parsedDate, err := time.Parse("2006-01-02", p.Date)
	if err != nil {
		return nil, fmt.Errorf("invalid_date_format")
	}

	// Verificar que ambas cuentas pertenecen al usuario
	var count int
	s.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM accounts
     WHERE id IN ($1, $2) AND user_id = $3`,
		p.FromAccountID, p.ToAccountID, p.UserID,
	).Scan(&count)

	if count != 2 {
		return nil, fmt.Errorf("account_not_found")
	}

	// Verificar saldo suficiente en la cuenta origen
	var fromBalance float64
	s.db.QueryRow(ctx,
		`SELECT balance FROM accounts WHERE id = $1`, p.FromAccountID,
	).Scan(&fromBalance)

	totalDebit := p.Amount + p.Fee
	if fromBalance < totalDebit {
		return nil, fmt.Errorf("insufficient_balance")
	}

	// Usar una transacción DB para garantizar consistencia
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("error iniciando transacción: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. Crear el fee como transaction PRIMERO y obtener su ID
	var feeTransactionID *string
	if p.Fee > 0 {
		feeDescription := "Comisión de transferencia"
		if p.Description != "" {
			feeDescription = fmt.Sprintf("Comisión: %s", p.Description)
		}

		var feeID string
		err = tx.QueryRow(ctx,
			`INSERT INTO transactions
         (user_id, account_id, amount, type, description, date)
       VALUES ($1, $2, $3, 'expense', $4, $5)
       RETURNING id`,
			p.UserID, p.FromAccountID, p.Fee, feeDescription, parsedDate,
		).Scan(&feeID)
		if err != nil {
			return nil, fmt.Errorf("error registrando comisión: %w", err)
		}
		feeTransactionID = &feeID
	}

	// 2. Crear la transferencia guardando el fee_transaction_id
	var transfer model.Transfer
	err = tx.QueryRow(ctx,
		`INSERT INTO transfers
       (user_id, from_account_id, to_account_id, amount, fee, fee_transaction_id, description, date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, user_id, from_account_id, to_account_id,
               amount, fee, fee_transaction_id, description, date, created_at`,
		p.UserID, p.FromAccountID, p.ToAccountID,
		p.Amount, p.Fee, feeTransactionID, p.Description, parsedDate,
	).Scan(
		&transfer.ID, &transfer.UserID,
		&transfer.FromAccountID, &transfer.ToAccountID,
		&transfer.Amount, &transfer.Fee, &transfer.FeeTransactionID,
		&transfer.Description, &transfer.Date, &transfer.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("error creando transferencia: %w", err)
	}

	// 3. Debitar cuenta origen (amount + fee)
	tx.Exec(ctx,
		`UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2`,
		totalDebit, p.FromAccountID,
	)

	// 4. Acreditar cuenta destino
	tx.Exec(ctx,
		`UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2`,
		p.Amount, p.ToAccountID,
	)

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("error confirmando transferencia: %w", err)
	}

	return &transfer, nil
}

func (s *TransferService) List(ctx context.Context, userID, dateFrom, dateTo string) ([]model.Transfer, error) {
	query := `
    SELECT t.id, t.user_id, t.from_account_id, t.to_account_id,
           t.amount, t.fee, t.description, t.date, t.created_at,
           fa.name AS from_account_name,
           ta.name AS to_account_name
    FROM transfers t
    JOIN accounts fa ON fa.id = t.from_account_id
    JOIN accounts ta ON ta.id = t.to_account_id
    WHERE t.user_id = $1
  `
	args := []any{userID}

	if dateFrom != "" && dateTo != "" {
		query += ` AND t.date BETWEEN $2 AND $3`
		args = append(args, dateFrom, dateTo)
	} else if dateFrom != "" {
		query += ` AND t.date >= $2`
		args = append(args, dateFrom)
	} else if dateTo != "" {
		query += ` AND t.date <= $2`
		args = append(args, dateTo)
	}

	query += ` ORDER BY t.date DESC, t.created_at DESC`

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("error consultando transferencias: %w", err)
	}
	defer rows.Close()

	var transfers []model.Transfer
	for rows.Next() {
		var t model.Transfer
		if err := rows.Scan(
			&t.ID, &t.UserID, &t.FromAccountID, &t.ToAccountID,
			&t.Amount, &t.Fee, &t.Description, &t.Date, &t.CreatedAt,
			&t.FromAccountName, &t.ToAccountName,
		); err != nil {
			return nil, fmt.Errorf("error leyendo transferencia: %w", err)
		}
		transfers = append(transfers, t)
	}

	if transfers == nil {
		transfers = []model.Transfer{}
	}

	return transfers, nil
}

func (s *TransferService) Delete(ctx context.Context, id, userID string) error {
	// Obtener datos antes de eliminar para revertir saldos
	var fromAccountID, toAccountID string
	var amount, fee float64
	var date time.Time
	var feeTransactionID *string

	err := s.db.QueryRow(ctx,
		`SELECT from_account_id, to_account_id, amount, fee, fee_transaction_id, date
     FROM transfers WHERE id = $1 AND user_id = $2`,
		id, userID,
	).Scan(&fromAccountID, &toAccountID, &amount, &fee, &feeTransactionID, &date)
	if err != nil {
		return fmt.Errorf("transfer_not_found")
	}

	tx, err := s.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("error iniciando transacción: %w", err)
	}
	defer tx.Rollback(ctx)

	// Eliminar la transferencia
	tx.Exec(ctx, `DELETE FROM transfers WHERE id = $1`, id)

	// Revertir saldo cuenta destino siempre
	tx.Exec(ctx,
		`UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2`,
		amount, toAccountID,
	)

	// Verificar si el fee_transaction aún existe
	// Si existe → eliminarlo y revertir amount+fee
	// Si no existe → el fee ya fue revertido, solo revertir amount
	if fee > 0 && feeTransactionID != nil {
		var feeExists bool
		tx.QueryRow(ctx,
			`SELECT EXISTS(SELECT 1 FROM transactions WHERE id = $1)`,
			*feeTransactionID,
		).Scan(&feeExists)

		if feeExists {
			// El fee transaction aún existe → eliminarlo y revertir todo
			tx.Exec(ctx,
				`DELETE FROM transactions WHERE id = $1`, *feeTransactionID,
			)
			// Revertir amount + fee en cuenta origen
			tx.Exec(ctx,
				`UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2`,
				amount+fee, fromAccountID,
			)
		} else {
			// El fee transaction ya fue eliminado manualmente
			// Su saldo ya fue revertido por TransactionService
			// Solo revertir el amount
			tx.Exec(ctx,
				`UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2`,
				amount, fromAccountID,
			)
		}
	} else {
		// No había fee → revertir solo el amount
		tx.Exec(ctx,
			`UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2`,
			amount, fromAccountID,
		)
	}

	return tx.Commit(ctx)
}
