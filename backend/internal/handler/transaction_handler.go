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

// List godoc
// @Summary      Listar transacciones
// @Description  Devuelve transacciones del usuario con filtros opcionales de fecha, tipo, cuenta y categoría
// @Tags         Transactions
// @Produce      json
// @Security     BearerAuth
// @Param        date_from    query     string  false  "Fecha inicio (YYYY-MM-DD)"
// @Param        date_to      query     string  false  "Fecha fin (YYYY-MM-DD)"
// @Param        type         query     string  false  "Tipo: income o expense"
// @Param        account_id   query     string  false  "ID de cuenta"
// @Param        category_id  query     string  false  "ID de categoría"
// @Param        sort         query     string  false  "Orden: asc o desc (por defecto desc)"
// @Success      200  {array}   transactionResponse
// @Failure      500  {object}  errorResponse
// @Router       /transactions [get]
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

// Create godoc
// @Summary      Crear transacción
// @Description  Crea una nueva transacción y ajusta el saldo de la cuenta si se especifica
// @Tags         Transactions
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body      transactionRequest  true  "Datos de la transacción"
// @Success      201   {object}  transactionResponse
// @Failure      400   {object}  errorResponse
// @Failure      500   {object}  errorResponse
// @Router       /transactions [post]
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

// Update godoc
// @Summary      Actualizar transacción
// @Description  Actualiza una transacción y recalcula el saldo de la cuenta afectada
// @Tags         Transactions
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path      string              true  "ID de la transacción"
// @Param        body  body      transactionRequest  true  "Datos a actualizar"
// @Success      200   {object}  transactionResponse
// @Failure      400   {object}  errorResponse
// @Failure      404   {object}  errorResponse
// @Failure      500   {object}  errorResponse
// @Router       /transactions/{id} [put]
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

// Delete godoc
// @Summary      Eliminar transacción
// @Description  Elimina una transacción y revierte el saldo de la cuenta asociada
// @Tags         Transactions
// @Produce      json
// @Security     BearerAuth
// @Param        id   path  string  true  "ID de la transacción"
// @Success      204
// @Failure      404  {object}  errorResponse
// @Router       /transactions/{id} [delete]
func (h *TransactionHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	id := chi.URLParam(r, "id")

	if err := h.transactionService.Delete(r.Context(), id, userID, h.accountService); err != nil {
		respondError(w, http.StatusNotFound, "transaction_not_found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
