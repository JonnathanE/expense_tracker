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
}

func NewTransactionHandler(transactionService *service.TransactionService) *TransactionHandler {
	return &TransactionHandler{transactionService: transactionService}
}

// ── GET /transactions?month=2024-03&type=expense ──────────────────────────────

func (h *TransactionHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	filters := service.TransactionFilters{
		Month: r.URL.Query().Get("month"),
		Type:  r.URL.Query().Get("type"),
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
		r.Context(), userID, req.CategoryID,
		req.Amount, req.Type, req.Description, req.Date,
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
		r.Context(), id, userID, req.CategoryID,
		req.Amount, req.Type, req.Description, req.Date,
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

	if err := h.transactionService.Delete(r.Context(), id, userID); err != nil {
		respondError(w, http.StatusNotFound, err.Error())
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
