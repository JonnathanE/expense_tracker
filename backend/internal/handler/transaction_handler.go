package handler

import (
	"encoding/json"
	"net/http"

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

// ── GET /transactions ─────────────────────────────────────────────────────────

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
		respondError(w, http.StatusInternalServerError, "fetch_failed")
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
		respondError(w, http.StatusBadRequest, "invalid_request")
		return
	}

	if req.Date == "" {
		respondError(w, http.StatusBadRequest, "date_required")
		return
	}

	transaction, err := h.transactionService.Create(
		r.Context(), userID, req.AccountID, req.CategoryID,
		req.Amount, req.Type, req.Description, req.Date,
		h.accountService,
	)
	if err != nil {
		switch err.Error() {
		case "invalid_type":
			respondError(w, http.StatusBadRequest, "invalid_type")
		case "amount_invalid":
			respondError(w, http.StatusBadRequest, "amount_invalid")
		case "invalid_date_format":
			respondError(w, http.StatusBadRequest, "invalid_date_format")
		default:
			respondError(w, http.StatusInternalServerError, "create_failed")
		}
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
		respondError(w, http.StatusBadRequest, "invalid_request")
		return
	}

	transaction, err := h.transactionService.Update(
		r.Context(), id, userID, req.AccountID, req.CategoryID,
		req.Amount, req.Type, req.Description, req.Date,
		h.accountService,
	)
	if err != nil {
		switch err.Error() {
		case "transaction_not_found":
			respondError(w, http.StatusNotFound, "transaction_not_found")
		case "invalid_date_format":
			respondError(w, http.StatusBadRequest, "invalid_date_format")
		default:
			respondError(w, http.StatusInternalServerError, "update_failed")
		}
		return
	}

	respondJSON(w, http.StatusOK, transaction)
}

// ── DELETE /transactions/{id} ─────────────────────────────────────────────────

func (h *TransactionHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	id := chi.URLParam(r, "id")

	if err := h.transactionService.Delete(r.Context(), id, userID, h.accountService); err != nil {
		respondError(w, http.StatusNotFound, "transaction_not_found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
