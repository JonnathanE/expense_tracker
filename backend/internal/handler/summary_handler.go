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

// GetDaily godoc
// @Summary      Obtener balance diario acumulado
// @Description  Devuelve el balance acumulado día a día para el rango de fechas especificado. Solo incluye cuentas con exclude_from_stats = FALSE.
// @Tags         Summary
// @Produce      json
// @Security     BearerAuth
// @Param        date_from  query     string  false  "Fecha inicio (YYYY-MM-DD)"
// @Param        date_to    query     string  false  "Fecha fin (YYYY-MM-DD)"
// @Success      200  {array}   dailySummaryResponse
// @Failure      500  {object}  errorResponse
// @Router       /summary/daily [get]
func (h *SummaryHandler) GetDaily(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	dateFrom := r.URL.Query().Get("date_from")
	dateTo := r.URL.Query().Get("date_to")

	if dateFrom == "" || dateTo == "" {
		now := time.Now()
		first := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
		last := first.AddDate(0, 1, -1)
		dateFrom = first.Format("2006-01-02")
		dateTo = last.Format("2006-01-02")
	}

	data, err := h.summaryService.GetDaily(r.Context(), userID, dateFrom, dateTo)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "error calculando resumen diario")
		return
	}

	respondJSON(w, http.StatusOK, data)
}
// @Summary      Obtener resumen financiero
// @Description  Devuelve ingresos, gastos, balance y desglose por categoría en un rango de fechas. Si no se especifican fechas, usa el mes actual.
// @Tags         Summary
// @Produce      json
// @Security     BearerAuth
// @Param        date_from  query     string  false  "Fecha inicio (YYYY-MM-DD)"
// @Param        date_to    query     string  false  "Fecha fin (YYYY-MM-DD)"
// @Success      200  {object}  summaryResponse
// @Failure      500  {object}  errorResponse
// @Router       /summary [get]
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
