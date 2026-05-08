package service

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/JonnathanE/expense_tracker/backend/internal/model"
)

type SummaryService struct {
	db *pgxpool.Pool
}

func NewSummaryService(db *pgxpool.Pool) *SummaryService {
	return &SummaryService{db: db}
}

func (s *SummaryService) Get(ctx context.Context, userID, month string) (*model.Summary, error) {
	summary := &model.Summary{Month: month}

	// ── 1. Totales de ingresos y gastos ──────────────────────────────────────
	// Una sola query agrupa por type y nos da ambos totales de una vez
	rows, err := s.db.Query(ctx,
		`SELECT type, COALESCE(SUM(amount), 0)
		 FROM transactions
		 WHERE user_id = $1
		   AND TO_CHAR(date, 'YYYY-MM') = $2
		 GROUP BY type`,
		userID, month,
	)
	if err != nil {
		return nil, fmt.Errorf("error calculando totales: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var txType string
		var total float64
		if err := rows.Scan(&txType, &total); err != nil {
			return nil, fmt.Errorf("error leyendo totales: %w", err)
		}
		if txType == "income" {
			summary.TotalIncome = total
		} else {
			summary.TotalExpense = total
		}
	}

	summary.Balance = summary.TotalIncome - summary.TotalExpense

	// ── 2. Desglose por categoría ─────────────────────────────────────────────
	// LEFT JOIN para incluir categorías aunque no tengan transacciones ese mes
	catRows, err := s.db.Query(ctx,
		`SELECT
		     c.id,
		     c.name,
		     c.icon,
		     c.color,
		     c.type,
		     COALESCE(SUM(t.amount), 0)  AS total,
		     COUNT(t.id)                 AS tx_count
		 FROM categories c
		 LEFT JOIN transactions t
		     ON t.category_id = c.id
		     AND t.user_id = $1
		     AND TO_CHAR(t.date, 'YYYY-MM') = $2
		 WHERE c.user_id = $1
		 GROUP BY c.id, c.name, c.icon, c.color, c.type
		 ORDER BY total DESC`,
		userID, month,
	)
	if err != nil {
		return nil, fmt.Errorf("error calculando categorías: %w", err)
	}
	defer catRows.Close()

	summary.ByCategory = []model.CategorySummary{}
	for catRows.Next() {
		var cs model.CategorySummary
		if err := catRows.Scan(
			&cs.CategoryID, &cs.CategoryName, &cs.Icon,
			&cs.Color, &cs.Type, &cs.Total, &cs.TxCount,
		); err != nil {
			return nil, fmt.Errorf("error leyendo categorías: %w", err)
		}
		summary.ByCategory = append(summary.ByCategory, cs)
	}

	return summary, nil
}
