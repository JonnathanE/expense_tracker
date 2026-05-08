package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/JonnathanE/expense_tracker/backend/internal/service"
)

type AuthHandler struct {
	userService  *service.UserService
	emailService *service.EmailService
	jwtService   *service.JWTService
}

func NewAuthHandler(userService *service.UserService, emailService *service.EmailService, jwtService *service.JWTService) *AuthHandler {
	return &AuthHandler{
		userService:  userService,
		emailService: emailService,
		jwtService:   jwtService,
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
	user, token, err := h.userService.Register(r.Context(), req.Name, req.Email, req.Password)
	if err != nil {
		if strings.Contains(err.Error(), "ya está registrado") {
			respondError(w, http.StatusConflict, err.Error())
			return
		}
		respondError(w, http.StatusInternalServerError, "error creando usuario")
		return
	}

	// Enviar email (en background para no bloquear la respuesta)
	go h.emailService.SendActivationEmail(user.Name, user.Email, token)

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

	result, err := h.userService.Login(r.Context(), req.Email, req.Password, h.jwtService)
	if err != nil {
		if strings.Contains(err.Error(), "no activada") {
			respondError(w, http.StatusForbidden, err.Error())
			return
		}
		respondError(w, http.StatusUnauthorized, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{
		"token": result.Token,
		"user": map[string]any{
			"id":    result.User.ID,
			"name":  result.User.Name,
			"email": result.User.Email,
		},
	})
}
