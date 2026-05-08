package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/JonnathanE/expense_tracker/backend/internal/service"
)

type contextKey string

const UserIDKey contextKey = "userID"

func Auth(jwtService *service.JWTService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, `{"error":"token requerido"}`, http.StatusUnauthorized)
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || parts[0] != "Bearer" {
				http.Error(w, `{"error":"formato inválido, usa Bearer <token>"}`, http.StatusUnauthorized)
				return
			}

			userID, err := jwtService.Validate(parts[1])
			if err != nil {
				http.Error(w, `{"error":"token inválido o expirado"}`, http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), UserIDKey, userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetUserID extrae el userID del contexto dentro de un handler
func GetUserID(r *http.Request) string {
	userID, _ := r.Context().Value(UserIDKey).(string)
	return userID
}
