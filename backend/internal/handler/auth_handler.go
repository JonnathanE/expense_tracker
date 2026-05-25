package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/JonnathanE/expense_tracker/backend/internal/middleware"
	"github.com/JonnathanE/expense_tracker/backend/internal/service"
)

type AuthHandler struct {
	userService    *service.UserService
	emailService   *service.EmailService
	jwtService     *service.JWTService
	refreshService *service.RefreshTokenService
	accountService *service.AccountService
}

func NewAuthHandler(
	userService *service.UserService,
	emailService *service.EmailService,
	jwtService *service.JWTService,
	refreshService *service.RefreshTokenService,
	accountService *service.AccountService,
) *AuthHandler {
	return &AuthHandler{
		userService:    userService,
		emailService:   emailService,
		jwtService:     jwtService,
		refreshService: refreshService,
		accountService: accountService,
	}
}

// ── POST /auth/register ───────────────────────────────────────────────────────

type registerRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid_request")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "name_required")
		return
	}
	if req.Email == "" || !strings.Contains(req.Email, "@") {
		respondError(w, http.StatusBadRequest, "email_invalid")
		return
	}
	if len(req.Password) < 6 {
		respondError(w, http.StatusBadRequest, "password_too_short")
		return
	}

	user, token, err := h.userService.Register(r.Context(), req.Name, req.Email, req.Password, h.accountService)
	if err != nil {
		switch err.Error() {
		case "email_already_registered":
			respondError(w, http.StatusConflict, "email_already_registered")
		default:
			respondError(w, http.StatusInternalServerError, "create_failed")
		}
		return
	}

	if err := h.emailService.SendActivationEmail(user.Name, user.Email, token); err != nil {
		log.Printf("⚠️  Error enviando email de activación a %s: %v", user.Email, err)
	}

	respondJSON(w, http.StatusCreated, map[string]string{
		"message": "register_success",
		"user_id": user.ID,
	})
}

// ── GET /auth/activate?token=xxx ─────────────────────────────────────────────

func (h *AuthHandler) Activate(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" {
		respondError(w, http.StatusBadRequest, "token_required")
		return
	}

	if err := h.userService.Activate(r.Context(), token); err != nil {
		switch err.Error() {
		case "account_already_active":
			respondError(w, http.StatusConflict, "account_already_active")
		case "token_expired":
			respondError(w, http.StatusGone, "token_expired")
		default:
			respondError(w, http.StatusBadRequest, "token_invalid")
		}
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "activate_success"})
}

// ── POST /auth/login ──────────────────────────────────────────────────────────

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid_request")
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" || req.Password == "" {
		respondError(w, http.StatusBadRequest, "credentials_required")
		return
	}

	result, err := h.userService.Login(
		r.Context(), req.Email, req.Password,
		h.jwtService, h.refreshService,
	)
	if err != nil {
		switch err.Error() {
		case "account_not_activated":
			respondError(w, http.StatusForbidden, "account_not_activated")
		default:
			respondError(w, http.StatusUnauthorized, "invalid_credentials")
		}
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{
		"access_token":  result.AccessToken,
		"refresh_token": result.RefreshToken,
		"user": map[string]any{
			"id":    result.User.ID,
			"name":  result.User.Name,
			"email": result.User.Email,
		},
	})
}

// ── POST /auth/refresh ────────────────────────────────────────────────────────

type refreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	var req refreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid_request")
		return
	}

	if req.RefreshToken == "" {
		respondError(w, http.StatusBadRequest, "refresh_token_required")
		return
	}

	userID, newRefreshToken, err := h.refreshService.Rotate(r.Context(), req.RefreshToken)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "refresh_token_invalid")
		return
	}

	newAccessToken, err := h.jwtService.Generate(userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "token_generation_failed")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"access_token":  newAccessToken,
		"refresh_token": newRefreshToken,
	})
}

// ── POST /auth/logout ─────────────────────────────────────────────────────────

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	if err := h.refreshService.RevokeAll(r.Context(), userID); err != nil {
		respondError(w, http.StatusInternalServerError, "logout_failed")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "logout_success"})
}

// ── POST /auth/forgot-password ────────────────────────────────────────────────

type forgotPasswordRequest struct {
	Email string `json:"email"`
}

func (h *AuthHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req forgotPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid_request")
		return
	}

	user, token, err := h.userService.ForgotPassword(r.Context(), strings.ToLower(req.Email))
	if err != nil {
		respondError(w, http.StatusInternalServerError, "server_error")
		return
	}

	if user != nil && token != "" {
		if err := h.emailService.SendPasswordResetEmail(user.Name, user.Email, token); err != nil {
			log.Printf("⚠️  Error enviando email de reset a %s: %v", user.Email, err)
		}
	}

	// Siempre respondemos lo mismo por seguridad (no se revela si el email existe)
	respondJSON(w, http.StatusOK, map[string]string{"message": "forgot_password_sent"})
}

// ── POST /auth/reset-password ─────────────────────────────────────────────────

type resetPasswordRequest struct {
	Token       string `json:"token"`
	NewPassword string `json:"new_password"`
}

func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req resetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid_request")
		return
	}

	if req.Token == "" {
		respondError(w, http.StatusBadRequest, "token_required")
		return
	}

	if err := h.userService.ResetPassword(r.Context(), req.Token, req.NewPassword); err != nil {
		switch err.Error() {
		case "token_expired":
			respondError(w, http.StatusGone, "token_expired")
		case "password_too_short":
			respondError(w, http.StatusBadRequest, "password_too_short")
		default:
			respondError(w, http.StatusBadRequest, "token_invalid")
		}
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "reset_password_success"})
}
