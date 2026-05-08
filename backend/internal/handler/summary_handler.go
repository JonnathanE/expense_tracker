package handler

import (
	"net/http"
	"time"

	"github.com/JonnathanE/expense_tracker/backend/internal/middleware"
	"github.com/JonnathanE/expense_tracker/backend/internal/service"
)

type SummaryHandler struct {
	summaryService *service.SummaryService
}

func NewSummaryHandler(summaryService *service.SummaryService) *SummaryHandler {
	return &SummaryHandler{summaryService: summaryService}
}

// ── GET /summary?month=2025-05 ────────────────────────────────────────────────

func (h *SummaryHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	// Si no viene el mes, usamos el mes actual
	month := r.URL.Query().Get("month")
	if month == "" {
		month = time.Now().Format("2006-01")
	}

	// Validar formato del mes
	if len(month) != 7 || month[4] != '-' {
		respondError(w, http.StatusBadRequest, "formato de mes inválido, usa YYYY-MM")
		return
	}

	summary, err := h.summaryService.Get(r.Context(), userID, month)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "error calculando resumen")
		return
	}

	respondJSON(w, http.StatusOK, summary)
}
