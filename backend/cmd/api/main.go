package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/JonnathanE/expense_tracker/backend/internal/config"
	"github.com/JonnathanE/expense_tracker/backend/internal/db"
	"github.com/JonnathanE/expense_tracker/backend/internal/handler"
	appmiddleware "github.com/JonnathanE/expense_tracker/backend/internal/middleware"
	"github.com/JonnathanE/expense_tracker/backend/internal/service"
)

func main() {
	cfg := config.Load()

	pool, err := db.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("❌ Error conectando a la DB: %v", err)
	}
	defer pool.Close()
	log.Println("✅ Conectado a PostgreSQL")

	// Servicios
	userService := service.NewUserService(pool)
	emailService := service.NewEmailService(cfg.FrontendURL)
	jwtService := service.NewJWTService(cfg.JWTSecret)

	// Handlers
	authHandler := handler.NewAuthHandler(userService, emailService, jwtService)

	// Router
	r := chi.NewRouter()

	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RequestID)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{cfg.FrontendURL},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})

	// Rutas públicas
	r.Post("/auth/register", authHandler.Register)
	r.Get("/auth/activate", authHandler.Activate)
	r.Post("/auth/login", authHandler.Login)

	// Rutas protegidas (ejemplo para probar el middleware)
	r.Group(func(r chi.Router) {
		r.Use(appmiddleware.Auth(jwtService))

		r.Get("/me", func(w http.ResponseWriter, r *http.Request) {
			userID := appmiddleware.GetUserID(r)
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"user_id":"` + userID + `"}`))
		})
	})

	log.Printf("🚀 Servidor corriendo en http://localhost:%s", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, r))
}
