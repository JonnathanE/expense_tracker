package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"

	"github.com/JonnathanE/expense_tracker/backend/internal/model"
)

type UserService struct {
	db *pgxpool.Pool
}

func NewUserService(db *pgxpool.Pool) *UserService {
	return &UserService{db: db}
}

func (s *UserService) Register(
	ctx context.Context,
	name, email, password string,
	accountService *AccountService,
) (*model.User, string, error) {
	var exists bool
	err := s.db.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`, email,
	).Scan(&exists)
	if err != nil {
		return nil, "", fmt.Errorf("server_error")
	}
	if exists {
		return nil, "", fmt.Errorf("email_already_registered")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", fmt.Errorf("server_error")
	}

	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return nil, "", fmt.Errorf("server_error")
	}
	activationToken := hex.EncodeToString(tokenBytes)
	tokenExpires := time.Now().Add(24 * time.Hour)

	var user model.User
	err = s.db.QueryRow(ctx,
		`INSERT INTO users (name, email, password, activation_token, activation_token_expires)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, name, email, is_active, created_at, updated_at`,
		name, email, string(hash), activationToken, tokenExpires,
	).Scan(
		&user.ID, &user.Name, &user.Email,
		&user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, "", fmt.Errorf("create_failed")
	}

	currency := "USD"
	if err := accountService.CreateDefault(ctx, user.ID, currency); err != nil {
		fmt.Printf("⚠️  Error creando cuenta por defecto: %v\n", err)
	}

	return &user, activationToken, nil
}

func (s *UserService) Activate(ctx context.Context, token string) error {
	var userID string
	var expires time.Time
	var isActive bool

	err := s.db.QueryRow(ctx,
		`SELECT id, activation_token_expires, is_active
		 FROM users
		 WHERE activation_token = $1`,
		token,
	).Scan(&userID, &expires, &isActive)

	if err != nil {
		return fmt.Errorf("token_invalid")
	}

	if isActive {
		return fmt.Errorf("account_already_active")
	}

	if time.Now().After(expires) {
		return fmt.Errorf("token_expired")
	}

	_, err = s.db.Exec(ctx,
		`UPDATE users
		 SET is_active = TRUE,
		     activation_token = NULL,
		     activation_token_expires = NULL,
		     updated_at = NOW()
		 WHERE id = $1`,
		userID,
	)
	if err != nil {
		return fmt.Errorf("server_error")
	}

	return nil
}

type LoginResult struct {
	User         *model.User
	AccessToken  string
	RefreshToken string
}

func (s *UserService) Login(
	ctx context.Context,
	email, password string,
	jwtService *JWTService,
	refreshService *RefreshTokenService,
) (*LoginResult, error) {
	var user model.User
	var hashedPassword string

	err := s.db.QueryRow(ctx,
		`SELECT id, name, email, password, is_active, created_at, updated_at
		 FROM users WHERE email = $1`,
		email,
	).Scan(
		&user.ID, &user.Name, &user.Email, &hashedPassword,
		&user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("invalid_credentials")
	}

	if !user.IsActive {
		return nil, fmt.Errorf("account_not_activated")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password)); err != nil {
		return nil, fmt.Errorf("invalid_credentials")
	}

	accessToken, err := jwtService.Generate(user.ID)
	if err != nil {
		return nil, fmt.Errorf("server_error")
	}

	refreshToken, err := refreshService.Generate(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("server_error")
	}

	return &LoginResult{
		User:         &user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *UserService) ForgotPassword(ctx context.Context, email string) (*model.User, string, error) {
	var user model.User
	err := s.db.QueryRow(ctx,
		`SELECT id, name, email FROM users WHERE email = $1 AND is_active = TRUE`,
		email,
	).Scan(&user.ID, &user.Name, &user.Email)

	if err != nil {
		return nil, "", nil
	}

	tokenBytes := make([]byte, 32)
	rand.Read(tokenBytes)
	resetToken := hex.EncodeToString(tokenBytes)
	tokenExpires := time.Now().Add(1 * time.Hour)

	_, err = s.db.Exec(ctx,
		`UPDATE users
     SET activation_token = $1, activation_token_expires = $2, updated_at = NOW()
     WHERE id = $3`,
		resetToken, tokenExpires, user.ID,
	)
	if err != nil {
		return nil, "", fmt.Errorf("server_error")
	}

	return &user, resetToken, nil
}

func (s *UserService) ResetPassword(ctx context.Context, token, newPassword string) error {
	var userID string
	var expires time.Time

	err := s.db.QueryRow(ctx,
		`SELECT id, activation_token_expires FROM users WHERE activation_token = $1`,
		token,
	).Scan(&userID, &expires)

	if err != nil {
		return fmt.Errorf("token_invalid")
	}

	if time.Now().After(expires) {
		return fmt.Errorf("token_expired")
	}

	if len(newPassword) < 6 {
		return fmt.Errorf("password_too_short")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("server_error")
	}

	_, err = s.db.Exec(ctx,
		`UPDATE users
     SET password = $1, activation_token = NULL,
         activation_token_expires = NULL, updated_at = NOW()
     WHERE id = $2`,
		string(hash), userID,
	)

	return err
}
