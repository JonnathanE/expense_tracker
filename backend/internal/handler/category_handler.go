package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/JonnathanE/expense_tracker/backend/internal/middleware"
	"github.com/JonnathanE/expense_tracker/backend/internal/service"
)

type CategoryHandler struct {
	categoryService *service.CategoryService
}

func NewCategoryHandler(categoryService *service.CategoryService) *CategoryHandler {
	return &CategoryHandler{categoryService: categoryService}
}

// ── GET /categories ───────────────────────────────────────────────────────────

// List godoc
// @Summary      Listar categorías
// @Description  Devuelve todas las categorías del usuario autenticado
// @Tags         Categories
// @Produce      json
// @Security     BearerAuth
// @Success      200  {array}   categoryResponse
// @Failure      500  {object}  errorResponse
// @Router       /categories [get]
func (h *CategoryHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	categories, err := h.categoryService.List(r.Context(), userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "fetch_failed")
		return
	}

	respondJSON(w, http.StatusOK, categories)
}

// ── POST /categories ──────────────────────────────────────────────────────────

// Create godoc
// @Summary      Crear categoría
// @Description  Crea una nueva categoría de tipo income o expense
// @Tags         Categories
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body      categoryRequest  true  "Datos de la categoría"
// @Success      201   {object}  categoryResponse
// @Failure      400   {object}  errorResponse
// @Failure      500   {object}  errorResponse
// @Router       /categories [post]
func (h *CategoryHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	var req categoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid_request")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "name_required")
		return
	}
	if req.Icon == "" {
		req.Icon = "💰"
	}
	if req.Color == "" {
		req.Color = "#6366f1"
	}

	category, err := h.categoryService.Create(r.Context(), userID, req.Name, req.Type, req.Icon, req.Color)
	if err != nil {
		switch err.Error() {
		case "invalid_type":
			respondError(w, http.StatusBadRequest, "invalid_type")
		default:
			respondError(w, http.StatusInternalServerError, "create_failed")
		}
		return
	}

	respondJSON(w, http.StatusCreated, category)
}

// ── PUT /categories/{id} ──────────────────────────────────────────────────────

// Update godoc
// @Summary      Actualizar categoría
// @Description  Actualiza nombre, ícono y color de una categoría
// @Tags         Categories
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path      string           true  "ID de la categoría"
// @Param        body  body      categoryRequest  true  "Datos a actualizar"
// @Success      200   {object}  categoryResponse
// @Failure      400   {object}  errorResponse
// @Failure      404   {object}  errorResponse
// @Router       /categories/{id} [put]
func (h *CategoryHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	id := chi.URLParam(r, "id")

	var req categoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid_request")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "name_required")
		return
	}

	category, err := h.categoryService.Update(r.Context(), id, userID, req.Name, req.Icon, req.Color)
	if err != nil {
		respondError(w, http.StatusNotFound, "category_not_found")
		return
	}

	respondJSON(w, http.StatusOK, category)
}

// ── DELETE /categories/{id} ───────────────────────────────────────────────────

// Delete godoc
// @Summary      Eliminar categoría
// @Description  Elimina una categoría del usuario autenticado
// @Tags         Categories
// @Produce      json
// @Security     BearerAuth
// @Param        id   path  string  true  "ID de la categoría"
// @Success      204
// @Failure      404  {object}  errorResponse
// @Router       /categories/{id} [delete]
func (h *CategoryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	id := chi.URLParam(r, "id")

	if err := h.categoryService.Delete(r.Context(), id, userID); err != nil {
		respondError(w, http.StatusNotFound, "category_not_found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
