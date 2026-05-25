package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/JonnathanE/expense_tracker/backend/internal/middleware"
	"github.com/JonnathanE/expense_tracker/backend/internal/service"
)

type TransactionHandler struct {
	transactionService *service.TransactionService
	accountService     *service.AccountService
}

func NewTransactionHandler(
	transactionService *service.TransactionService,
	accountService *service.AccountService,
) *TransactionHandler {
	return &TransactionHandler{transactionService: transactionService, accountService: accountService}
}

// ── GET /transactions?date_from=2025-05-01&date_to=2025-05-31&type=expense&account_id=...&category_id=...&sort=asc ──

func (h *TransactionHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	filters := service.TransactionFilters{
		DateFrom:   r.URL.Query().Get("date_from"),
		DateTo:     r.URL.Query().Get("date_to"),
		Type:       r.URL.Query().Get("type"),
		AccountID:  r.URL.Query().Get("account_id"),
		CategoryID: r.URL.Query().Get("category_id"),
		Sort:       r.URL.Query().Get("sort"),
	}

	transactions, err := h.transactionService.List(r.Context(), userID, filters)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "error obteniendo transacciones")
		return
	}

	respondJSON(w, http.StatusOK, transactions)
}

// ── POST /transactions ────────────────────────────────────────────────────────

type transactionRequest struct {
	AccountID   *string `json:"account_id"`
	CategoryID  *string `json:"category_id"`
	Amount      float64 `json:"amount"`
	Type        string  `json:"type"`
	Description string  `json:"description"`
	Date        string  `json:"date"`
}

func (h *TransactionHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	var req transactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "datos inválidos")
		return
	}

	if req.Date == "" {
		respondError(w, http.StatusBadRequest, "la fecha es requerida")
		return
	}

	transaction, err := h.transactionService.Create(
		r.Context(), userID, req.AccountID, req.CategoryID,
		req.Amount, req.Type, req.Description, req.Date,
		h.accountService,
	)
	if err != nil {
		if strings.Contains(err.Error(), "tipo debe ser") ||
			strings.Contains(err.Error(), "monto") ||
			strings.Contains(err.Error(), "fecha") {
			respondError(w, http.StatusBadRequest, err.Error())
			return
		}
		respondError(w, http.StatusInternalServerError, "error creando transacción")
		return
	}

	respondJSON(w, http.StatusCreated, transaction)
}

// ── PUT /transactions/{id} ────────────────────────────────────────────────────

func (h *TransactionHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	id := chi.URLParam(r, "id")

	var req transactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "datos inválidos")
		return
	}

	transaction, err := h.transactionService.Update(
		r.Context(), id, userID, req.AccountID, req.CategoryID,
		req.Amount, req.Type, req.Description, req.Date,
		h.accountService,
	)
	if err != nil {
		if strings.Contains(err.Error(), "fecha") {
			respondError(w, http.StatusBadRequest, err.Error())
			return
		}
		respondError(w, http.StatusNotFound, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, transaction)
}

// ── DELETE /transactions/{id} ─────────────────────────────────────────────────

func (h *TransactionHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	id := chi.URLParam(r, "id")

	if err := h.transactionService.Delete(r.Context(), id, userID, h.accountService); err != nil {
		respondError(w, http.StatusNotFound, err.Error())
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
