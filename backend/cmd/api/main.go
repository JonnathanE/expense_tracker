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

	// Sender de Resend
	resendSender := service.NewResendSender(cfg.ResendAPIKey, cfg.EmailFrom)

	// Servicios
	userService := service.NewUserService(pool)
	emailService := service.NewEmailService(resendSender, cfg.FrontendURL)
	jwtService := service.NewJWTService(cfg.JWTSecret)
	refreshService := service.NewRefreshTokenService(pool)
	categoryService := service.NewCategoryService(pool)
	transactionService := service.NewTransactionService(pool)
	summaryService := service.NewSummaryService(pool)
	accountService := service.NewAccountService(pool)
	transferService := service.NewTransferService(pool)

	// Handlers
	authHandler := handler.NewAuthHandler(userService, emailService, jwtService, refreshService, accountService)
	categoryHandler := handler.NewCategoryHandler(categoryService)
	transactionHandler := handler.NewTransactionHandler(transactionService, accountService)
	summaryHandler := handler.NewSummaryHandler(summaryService)
	accountHandler := handler.NewAccountHandler(accountService)
	transferHandler := handler.NewTransferHandler(transferService)

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
	r.Post("/auth/refresh", authHandler.Refresh)
	r.Post("/auth/forgot-password", authHandler.ForgotPassword)
	r.Post("/auth/reset-password", authHandler.ResetPassword)

	// Rutas protegidas
	r.Group(func(r chi.Router) {
		r.Use(appmiddleware.Auth(jwtService))

		r.Get("/me", func(w http.ResponseWriter, r *http.Request) {
			userID := appmiddleware.GetUserID(r)
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"user_id":"` + userID + `"}`))
		})

		// Logout
		r.Post("/auth/logout", authHandler.Logout)

		// Cuentas
		r.Get("/accounts", accountHandler.List)
		r.Post("/accounts", accountHandler.Create)
		r.Put("/accounts/{id}", accountHandler.Update)
		r.Delete("/accounts/{id}", accountHandler.Delete)

		// Transferencias
		r.Get("/transfers", transferHandler.List)
		r.Post("/transfers", transferHandler.Create)
		r.Delete("/transfers/{id}", transferHandler.Delete)

		// Categorías
		r.Get("/categories", categoryHandler.List)
		r.Post("/categories", categoryHandler.Create)
		r.Put("/categories/{id}", categoryHandler.Update)
		r.Delete("/categories/{id}", categoryHandler.Delete)

		// Transacciones
		r.Get("/transactions", transactionHandler.List)
		r.Post("/transactions", transactionHandler.Create)
		r.Put("/transactions/{id}", transactionHandler.Update)
		r.Delete("/transactions/{id}", transactionHandler.Delete)

		// Summary
		r.Get("/summary", summaryHandler.Get)
	})

	log.Printf("🚀 Servidor corriendo en http://localhost:%s", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, r))
}
