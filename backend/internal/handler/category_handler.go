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

func (h *CategoryHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	categories, err := h.categoryService.List(r.Context(), userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "error obteniendo categorías")
		return
	}

	respondJSON(w, http.StatusOK, categories)
}

// ── POST /categories ──────────────────────────────────────────────────────────

type categoryRequest struct {
	Name  string `json:"name"`
	Type  string `json:"type"`
	Icon  string `json:"icon"`
	Color string `json:"color"`
}

func (h *CategoryHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	var req categoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "datos inválidos")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "el nombre es requerido")
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
		if strings.Contains(err.Error(), "tipo debe ser") {
			respondError(w, http.StatusBadRequest, err.Error())
			return
		}
		respondError(w, http.StatusInternalServerError, "error creando categoría")
		return
	}

	respondJSON(w, http.StatusCreated, category)
}

// ── PUT /categories/{id} ──────────────────────────────────────────────────────

func (h *CategoryHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	id := chi.URLParam(r, "id")

	var req categoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "datos inválidos")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "el nombre es requerido")
		return
	}

	category, err := h.categoryService.Update(r.Context(), id, userID, req.Name, req.Icon, req.Color)
	if err != nil {
		respondError(w, http.StatusNotFound, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, category)
}

// ── DELETE /categories/{id} ───────────────────────────────────────────────────

func (h *CategoryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	id := chi.URLParam(r, "id")

	if err := h.categoryService.Delete(r.Context(), id, userID); err != nil {
		respondError(w, http.StatusNotFound, err.Error())
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
