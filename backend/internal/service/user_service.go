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

// Register crea un usuario nuevo inactivo y devuelve el token de activación
func (s *UserService) Register(ctx context.Context, name, email, password string) (*model.User, string, error) {
	// 1. Verificar si el email ya existe
	var exists bool
	err := s.db.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`, email,
	).Scan(&exists)
	if err != nil {
		return nil, "", fmt.Errorf("error verificando email: %w", err)
	}
	if exists {
		return nil, "", fmt.Errorf("el email ya está registrado")
	}

	// 2. Hashear contraseña
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", fmt.Errorf("error procesando contraseña: %w", err)
	}

	// 3. Generar token de activación (32 bytes aleatorios en hex = 64 caracteres)
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return nil, "", fmt.Errorf("error generando token: %w", err)
	}
	activationToken := hex.EncodeToString(tokenBytes)
	tokenExpires := time.Now().Add(24 * time.Hour)

	// 4. Insertar usuario en la DB
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
		return nil, "", fmt.Errorf("error creando usuario: %w", err)
	}

	return &user, activationToken, nil
}

// Activate verifica el token y activa el usuario
func (s *UserService) Activate(ctx context.Context, token string) error {
	// Buscar usuario con ese token
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
		return fmt.Errorf("token inválido")
	}

	if isActive {
		return fmt.Errorf("la cuenta ya está activa")
	}

	// Verificar que no haya expirado
	if time.Now().After(expires) {
		return fmt.Errorf("el token ha expirado")
	}

	// Activar usuario y limpiar el token
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
		return fmt.Errorf("error activando usuario: %w", err)
	}

	return nil
}

type LoginResult struct {
	User  *model.User
	Token string
}

// Login verifica credenciales y retorna el usuario + JWT
func (s *UserService) Login(ctx context.Context, email, password string, jwtService *JWTService) (*LoginResult, error) {
	// 1. Buscar usuario por email
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
		// No revelar si el email existe o no (seguridad)
		return nil, fmt.Errorf("credenciales inválidas")
	}

	// 2. Verificar que la cuenta esté activa
	if !user.IsActive {
		return nil, fmt.Errorf("cuenta no activada, revisa tu email")
	}

	// 3. Comparar contraseña
	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password)); err != nil {
		return nil, fmt.Errorf("credenciales inválidas")
	}

	// 4. Generar JWT
	token, err := jwtService.Generate(user.ID)
	if err != nil {
		return nil, fmt.Errorf("error generando sesión: %w", err)
	}

	return &LoginResult{User: &user, Token: token}, nil
}
