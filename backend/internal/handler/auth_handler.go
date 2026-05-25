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
		respondError(w, http.StatusBadRequest, "datos inválidos")
		return
	}

	// Validaciones básicas
	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "el nombre es requerido")
		return
	}
	if req.Email == "" || !strings.Contains(req.Email, "@") {
		respondError(w, http.StatusBadRequest, "el email no es válido")
		return
	}
	if len(req.Password) < 6 {
		respondError(w, http.StatusBadRequest, "la contraseña debe tener al menos 6 caracteres")
		return
	}

	// Crear usuario
	user, token, err := h.userService.Register(r.Context(), req.Name, req.Email, req.Password, h.accountService)
	if err != nil {
		if strings.Contains(err.Error(), "ya está registrado") {
			respondError(w, http.StatusConflict, err.Error())
			return
		}
		respondError(w, http.StatusInternalServerError, "error creando usuario")
		return
	}

	// Enviar email (en background para no bloquear la respuesta)
	// go h.emailService.SendActivationEmail(user.Name, user.Email, token)
	if err := h.emailService.SendActivationEmail(user.Name, user.Email, token); err != nil {
		// Log del error pero no lo expongas al usuario
		log.Printf("⚠️  Error enviando email de activación a %s: %v", user.Email, err)
	}

	respondJSON(w, http.StatusCreated, map[string]string{
		"message": "Usuario creado. Revisa tu email para activar tu cuenta.",
		"user_id": user.ID,
	})
}

// ── GET /auth/activate?token=xxx ─────────────────────────────────────────────

func (h *AuthHandler) Activate(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" {
		respondError(w, http.StatusBadRequest, "token requerido")
		return
	}

	if err := h.userService.Activate(r.Context(), token); err != nil {
		switch err.Error() {
		case "la cuenta ya está activa":
			respondError(w, http.StatusConflict, err.Error())
		case "el token ha expirado":
			respondError(w, http.StatusGone, err.Error())
		default:
			respondError(w, http.StatusBadRequest, err.Error())
		}
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"message": "Cuenta activada correctamente. Ya puedes iniciar sesión.",
	})
}

// ── POST /auth/login ──────────────────────────────────────────────────────────

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "datos inválidos")
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" || req.Password == "" {
		respondError(w, http.StatusBadRequest, "email y contraseña son requeridos")
		return
	}

	result, err := h.userService.Login(
		r.Context(), req.Email, req.Password,
		h.jwtService, h.refreshService,
	)
	if err != nil {
		if strings.Contains(err.Error(), "no activada") {
			respondError(w, http.StatusForbidden, err.Error())
			return
		}
		respondError(w, http.StatusUnauthorized, err.Error())
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
		respondError(w, http.StatusBadRequest, "datos inválidos")
		return
	}

	if req.RefreshToken == "" {
		respondError(w, http.StatusBadRequest, "refresh token requerido")
		return
	}

	// Rotar el refresh token
	userID, newRefreshToken, err := h.refreshService.Rotate(r.Context(), req.RefreshToken)
	if err != nil {
		respondError(w, http.StatusUnauthorized, err.Error())
		return
	}

	// Generar nuevo access token
	newAccessToken, err := h.jwtService.Generate(userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "error generando token")
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
		respondError(w, http.StatusInternalServerError, "error cerrando sesión")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"message": "Sesión cerrada correctamente",
	})
}

// ── POST /auth/forgot-password ────────────────────────────────────────────────

type forgotPasswordRequest struct {
	Email string `json:"email"`
}

func (h *AuthHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req forgotPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "datos inválidos")
		return
	}

	user, token, err := h.userService.ForgotPassword(r.Context(), strings.ToLower(req.Email))
	if err != nil {
		respondError(w, http.StatusInternalServerError, "error procesando solicitud")
		return
	}

	// Si el email existe, enviamos el correo
	if user != nil && token != "" {
		if err := h.emailService.SendPasswordResetEmail(user.Name, user.Email, token); err != nil {
			log.Printf("⚠️  Error enviando email de reset a %s: %v", user.Email, err)
		}
	}

	// Siempre respondemos lo mismo por seguridad
	// (no revelamos si el email existe)
	respondJSON(w, http.StatusOK, map[string]string{
		"message": "Si el email existe recibirás un link para restablecer tu contraseña.",
	})
}

// ── POST /auth/reset-password ─────────────────────────────────────────────────

type resetPasswordRequest struct {
	Token       string `json:"token"`
	NewPassword string `json:"new_password"`
}

func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req resetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "datos inválidos")
		return
	}

	if req.Token == "" {
		respondError(w, http.StatusBadRequest, "token requerido")
		return
	}

	if err := h.userService.ResetPassword(r.Context(), req.Token, req.NewPassword); err != nil {
		switch err.Error() {
		case "el token ha expirado":
			respondError(w, http.StatusGone, err.Error())
		default:
			respondError(w, http.StatusBadRequest, err.Error())
		}
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"message": "Contraseña actualizada correctamente. Ya puedes iniciar sesión.",
	})
}
