package handler

import (
	"encoding/json"
	"net/http"

	"github.com/JonnathanE/expense_tracker/backend/internal/middleware"
	"github.com/JonnathanE/expense_tracker/backend/internal/service"
	"github.com/go-chi/chi/v5"
)

type AccountHandler struct {
	accountService *service.AccountService
}

func NewAccountHandler(accountService *service.AccountService) *AccountHandler {
	return &AccountHandler{accountService: accountService}
}

// GET /accounts
func (h *AccountHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	accounts, err := h.accountService.List(r.Context(), userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "fetch_failed")
		return
	}
	respondJSON(w, http.StatusOK, accounts)
}

// POST /accounts
type accountRequest struct {
	Name             string  `json:"name"`
	Icon             string  `json:"icon"`
	Color            string  `json:"color"`
	Balance          float64 `json:"balance"`
	Currency         string  `json:"currency"`
	ExcludeFromStats bool    `json:"exclude_from_stats"`
}

func (h *AccountHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	var req accountRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid_request")
		return
	}

	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "name_required")
		return
	}
	if req.Currency == "" {
		req.Currency = "USD"
	}
	if req.Icon == "" {
		req.Icon = "wallet"
	}
	if req.Color == "" {
		req.Color = "#6366f1"
	}

	account, err := h.accountService.Create(
		r.Context(), userID, req.Name, req.Icon,
		req.Color, req.Currency, req.Balance, req.ExcludeFromStats,
	)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "create_failed")
		return
	}

	respondJSON(w, http.StatusCreated, account)
}

// PUT /accounts/{id}
func (h *AccountHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	id := chi.URLParam(r, "id")

	var req accountRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid_request")
		return
	}

	account, err := h.accountService.Update(
		r.Context(), id, userID, req.Name,
		req.Icon, req.Color, req.Balance, req.ExcludeFromStats,
	)
	if err != nil {
		respondError(w, http.StatusNotFound, "account_not_found")
		return
	}

	respondJSON(w, http.StatusOK, account)
}

// DELETE /accounts/{id}
func (h *AccountHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	id := chi.URLParam(r, "id")

	if err := h.accountService.Delete(r.Context(), id, userID); err != nil {
		switch err.Error() {
		case "cannot_delete_last_account":
			respondError(w, http.StatusBadRequest, "cannot_delete_last_account")
		default:
			respondError(w, http.StatusNotFound, "account_not_found")
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
