package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type RefreshTokenService struct {
	db *pgxpool.Pool
}

func NewRefreshTokenService(db *pgxpool.Pool) *RefreshTokenService {
	return &RefreshTokenService{db: db}
}

// Generate crea un refresh token para el usuario y lo guarda en la DB
func (s *RefreshTokenService) Generate(ctx context.Context, userID string) (string, error) {
	// Token aleatorio de 64 bytes → 128 caracteres hex
	bytes := make([]byte, 64)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("error generando token: %w", err)
	}
	token := hex.EncodeToString(bytes)

	expires := time.Now().Add(30 * 24 * time.Hour) // 30 días

	_, err := s.db.Exec(ctx,
		`INSERT INTO refresh_tokens (user_id, token, expires_at)
		 VALUES ($1, $2, $3)`,
		userID, token, expires,
	)
	if err != nil {
		return "", fmt.Errorf("error guardando refresh token: %w", err)
	}

	return token, nil
}

// Rotate valida el token actual, lo elimina y genera uno nuevo
// Devuelve el userID y el nuevo refresh token
func (s *RefreshTokenService) Rotate(ctx context.Context, token string) (string, string, error) {
	// Buscar el token en la DB
	var userID string
	var expires time.Time

	err := s.db.QueryRow(ctx,
		`SELECT user_id, expires_at FROM refresh_tokens WHERE token = $1`,
		token,
	).Scan(&userID, &expires)

	if err != nil {
		return "", "", fmt.Errorf("refresh token inválido")
	}

	// Verificar que no haya expirado
	if time.Now().After(expires) {
		// Limpiar el token expirado
		s.db.Exec(ctx, `DELETE FROM refresh_tokens WHERE token = $1`, token)
		return "", "", fmt.Errorf("refresh token expirado")
	}

	// Eliminar el token usado (rotación)
	_, err = s.db.Exec(ctx,
		`DELETE FROM refresh_tokens WHERE token = $1`,
		token,
	)
	if err != nil {
		return "", "", fmt.Errorf("error rotando token: %w", err)
	}

	// Generar nuevo refresh token
	newToken, err := s.Generate(ctx, userID)
	if err != nil {
		return "", "", err
	}

	return userID, newToken, nil
}

// RevokeAll elimina todos los refresh tokens de un usuario (logout)
func (s *RefreshTokenService) RevokeAll(ctx context.Context, userID string) error {
	_, err := s.db.Exec(ctx,
		`DELETE FROM refresh_tokens WHERE user_id = $1`,
		userID,
	)
	return err
}
