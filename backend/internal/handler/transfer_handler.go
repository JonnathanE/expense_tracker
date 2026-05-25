package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/JonnathanE/expense_tracker/backend/internal/middleware"
	"github.com/JonnathanE/expense_tracker/backend/internal/service"
)

type TransferHandler struct {
	transferService *service.TransferService
}

func NewTransferHandler(transferService *service.TransferService) *TransferHandler {
	return &TransferHandler{transferService: transferService}
}

// List godoc
// @Summary      Listar transferencias
// @Description  Devuelve las transferencias del usuario en un rango de fechas
// @Tags         Transfers
// @Produce      json
// @Security     BearerAuth
// @Param        date_from  query     string  false  "Fecha inicio (YYYY-MM-DD)"
// @Param        date_to    query     string  false  "Fecha fin (YYYY-MM-DD)"
// @Success      200  {array}   transferResponse
// @Failure      500  {object}  errorResponse
// @Router       /transfers [get]
func (h *TransferHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	dateFrom := r.URL.Query().Get("date_from")
	dateTo := r.URL.Query().Get("date_to")

	transfers, err := h.transferService.List(r.Context(), userID, dateFrom, dateTo)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "fetch_failed")
		return
	}
	respondJSON(w, http.StatusOK, transfers)
}

// Create godoc
// @Summary      Crear transferencia
// @Description  Transfiere fondos entre dos cuentas del usuario. Descuenta de la cuenta origen e incrementa la cuenta destino.
// @Tags         Transfers
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body      transferRequest  true  "Datos de la transferencia"
// @Success      201   {object}  transferResponse
// @Failure      400   {object}  errorResponse
// @Failure      404   {object}  errorResponse
// @Failure      500   {object}  errorResponse
// @Router       /transfers [post]
func (h *TransferHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	var req transferRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid_request")
		return
	}

	if req.FromAccountID == "" || req.ToAccountID == "" {
		respondError(w, http.StatusBadRequest, "accounts_required")
		return
	}
	if req.FromAccountID == req.ToAccountID {
		respondError(w, http.StatusBadRequest, "same_account")
		return
	}
	if req.Amount <= 0 {
		respondError(w, http.StatusBadRequest, "amount_invalid")
		return
	}
	if req.Fee < 0 {
		respondError(w, http.StatusBadRequest, "fee_invalid")
		return
	}
	if req.Date == "" {
		respondError(w, http.StatusBadRequest, "date_required")
		return
	}

	transfer, err := h.transferService.Create(r.Context(), service.CreateTransferParams{
		UserID:        userID,
		FromAccountID: req.FromAccountID,
		ToAccountID:   req.ToAccountID,
		Amount:        req.Amount,
		Fee:           req.Fee,
		Description:   req.Description,
		Date:          req.Date,
	})
	if err != nil {
		switch err.Error() {
		case "insufficient_balance":
			respondError(w, http.StatusBadRequest, "insufficient_balance")
		case "account_not_found":
			respondError(w, http.StatusNotFound, "account_not_found")
		case "invalid_date_format":
			respondError(w, http.StatusBadRequest, "invalid_date_format")
		default:
			respondError(w, http.StatusInternalServerError, "create_failed")
		}
		return
	}

	respondJSON(w, http.StatusCreated, transfer)
}

// Delete godoc
// @Summary      Eliminar transferencia
// @Description  Elimina una transferencia y revierte los saldos de ambas cuentas
// @Tags         Transfers
// @Produce      json
// @Security     BearerAuth
// @Param        id   path  string  true  "ID de la transferencia"
// @Success      204
// @Failure      404  {object}  errorResponse
// @Failure      500  {object}  errorResponse
// @Router       /transfers/{id} [delete]
func (h *TransferHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	id := chi.URLParam(r, "id")

	if err := h.transferService.Delete(r.Context(), id, userID); err != nil {
		switch err.Error() {
		case "transfer_not_found":
			respondError(w, http.StatusNotFound, "transfer_not_found")
		default:
			respondError(w, http.StatusInternalServerError, "delete_failed")
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
