package service

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/JonnathanE/expense_tracker/backend/internal/model"
)

type CategoryService struct {
	db *pgxpool.Pool
}

func NewCategoryService(db *pgxpool.Pool) *CategoryService {
	return &CategoryService{db: db}
}

func (s *CategoryService) List(ctx context.Context, userID string) ([]model.Category, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, user_id, name, type, icon, color, created_at
		 FROM categories
		 WHERE user_id = $1
		 ORDER BY name ASC`,
		userID,
	)
	if err != nil {
		return nil, fmt.Errorf("fetch_failed")
	}
	defer rows.Close()

	var categories []model.Category
	for rows.Next() {
		var c model.Category
		if err := rows.Scan(&c.ID, &c.UserID, &c.Name, &c.Type, &c.Icon, &c.Color, &c.CreatedAt); err != nil {
			return nil, fmt.Errorf("fetch_failed")
		}
		categories = append(categories, c)
	}

	if categories == nil {
		categories = []model.Category{}
	}

	return categories, nil
}

func (s *CategoryService) Create(ctx context.Context, userID, name, catType, icon, color string) (*model.Category, error) {
	if catType != "income" && catType != "expense" {
		return nil, fmt.Errorf("invalid_type")
	}

	var c model.Category
	err := s.db.QueryRow(ctx,
		`INSERT INTO categories (user_id, name, type, icon, color)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, user_id, name, type, icon, color, created_at`,
		userID, name, catType, icon, color,
	).Scan(&c.ID, &c.UserID, &c.Name, &c.Type, &c.Icon, &c.Color, &c.CreatedAt)

	if err != nil {
		return nil, fmt.Errorf("create_failed")
	}

	return &c, nil
}

func (s *CategoryService) Update(ctx context.Context, id, userID, name, icon, color string) (*model.Category, error) {
	var c model.Category
	err := s.db.QueryRow(ctx,
		`UPDATE categories
		 SET name = $1, icon = $2, color = $3
		 WHERE id = $4 AND user_id = $5
		 RETURNING id, user_id, name, type, icon, color, created_at`,
		name, icon, color, id, userID,
	).Scan(&c.ID, &c.UserID, &c.Name, &c.Type, &c.Icon, &c.Color, &c.CreatedAt)

	if err != nil {
		return nil, fmt.Errorf("category_not_found")
	}

	return &c, nil
}

func (s *CategoryService) Delete(ctx context.Context, id, userID string) error {
	result, err := s.db.Exec(ctx,
		`DELETE FROM categories WHERE id = $1 AND user_id = $2`,
		id, userID,
	)
	if err != nil || result.RowsAffected() == 0 {
		return fmt.Errorf("category_not_found")
	}
	return nil
}
