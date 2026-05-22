package service

import (
	"fmt"

	"github.com/resend/resend-go/v3"
)

// Interfaz — permite cambiar el proveedor fácilmente en el futuro
type EmailSender interface {
	Send(to, subject, html string) error
}

// ── Implementación con Resend ─────────────────────────────────────────────────

type ResendSender struct {
	client *resend.Client
	from   string
}

func NewResendSender(apiKey, from string) *ResendSender {
	return &ResendSender{
		client: resend.NewClient(apiKey),
		from:   from,
	}
}

func (s *ResendSender) Send(to, subject, html string) error {
	params := &resend.SendEmailRequest{
		From:    s.from,
		To:      []string{to},
		Subject: subject,
		Html:    html,
	}

	_, err := s.client.Emails.Send(params)
	if err != nil {
		return fmt.Errorf("error enviando email: %w", err)
	}

	return nil
}

// ── EmailService — lógica de negocio de emails ────────────────────────────────

type EmailService struct {
	sender      EmailSender
	frontendURL string
}

func NewEmailService(sender EmailSender, frontendURL string) *EmailService {
	return &EmailService{
		sender:      sender,
		frontendURL: frontendURL,
	}
}

func (s *EmailService) SendActivationEmail(name, email, token string) error {
	activationLink := fmt.Sprintf("%s/activate?token=%s", s.frontendURL, token)

	html := buildActivationEmail(name, activationLink)

	return s.sender.Send(email, "Activa tu cuenta — Squirl Expense Tracker", html)
}

func (s *EmailService) SendPasswordResetEmail(name, email, token string) error {
	resetLink := fmt.Sprintf("%s/reset-password?token=%s", s.frontendURL, token)

	html := buildPasswordResetEmail(name, resetLink)

	return s.sender.Send(email, "Recuperar contraseña — Squirl Expense Tracker", html)
}
