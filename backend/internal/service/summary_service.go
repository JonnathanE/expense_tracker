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

// Get calcula totales y breakdown por categoría para el rango [dateFrom, dateTo].
// Solo incluye transacciones cuya cuenta tenga exclude_from_stats = FALSE
// (o que no tengan cuenta asignada).
func (s *SummaryService) Get(ctx context.Context, userID, dateFrom, dateTo string) (*model.Summary, error) {
	summary := &model.Summary{Month: dateFrom[:7]} // conservamos YYYY-MM para compatibilidad

	// 1. Totales por tipo — excluir cuentas con exclude_from_stats = TRUE
	rows, err := s.db.Query(ctx,
		`SELECT t.type, COALESCE(SUM(t.amount), 0)
		 FROM transactions t
		 LEFT JOIN accounts a ON a.id = t.account_id
		 WHERE t.user_id = $1
		   AND t.date BETWEEN $2 AND $3
		   AND (t.account_id IS NULL OR a.exclude_from_stats = FALSE)
		 GROUP BY t.type`,
		userID, dateFrom, dateTo,
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

	// 2. Breakdown por categoría — misma condición exclude_from_stats
	catRows, err := s.db.Query(ctx,
		`SELECT
		     c.id, c.name, c.icon, c.color, c.type,
		     COALESCE(SUM(t.amount), 0) AS total,
		     COUNT(t.id)                AS tx_count
		 FROM categories c
		 LEFT JOIN transactions t
		     ON t.category_id = c.id
		     AND t.user_id = $1
		     AND t.date BETWEEN $2 AND $3
		     AND (t.account_id IS NULL OR EXISTS (
		             SELECT 1 FROM accounts a
		             WHERE a.id = t.account_id AND a.exclude_from_stats = FALSE
		         ))
		 WHERE c.user_id = $1
		 GROUP BY c.id, c.name, c.icon, c.color, c.type

		 UNION ALL

		 SELECT
		     NULL, NULL, NULL, NULL, t.type,
		     COALESCE(SUM(t.amount), 0),
		     COUNT(t.id)
		 FROM transactions t
		 LEFT JOIN accounts a ON a.id = t.account_id
		 WHERE t.user_id = $1
		   AND t.category_id IS NULL
		   AND t.date BETWEEN $2 AND $3
		   AND (t.account_id IS NULL OR a.exclude_from_stats = FALSE)
		 GROUP BY t.type

		 ORDER BY total DESC`,
		userID, dateFrom, dateTo,
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
