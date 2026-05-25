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

// GET /summary?date_from=2025-05-01&date_to=2025-05-31
// Fallback: si no se proveen, usa el mes actual
func (h *SummaryHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	dateFrom := r.URL.Query().Get("date_from")
	dateTo := r.URL.Query().Get("date_to")

	// Fallback al mes actual si no se envían los rangos
	if dateFrom == "" || dateTo == "" {
		now := time.Now()
		first := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
		last := first.AddDate(0, 1, -1)
		dateFrom = first.Format("2006-01-02")
		dateTo = last.Format("2006-01-02")
	}

	summary, err := h.summaryService.Get(r.Context(), userID, dateFrom, dateTo)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "error calculando resumen")
		return
	}

	respondJSON(w, http.StatusOK, summary)
}
