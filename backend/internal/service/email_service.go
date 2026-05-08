package service

import "log"

type EmailService struct {
	frontendURL string
}

func NewEmailService(frontendURL string) *EmailService {
	return &EmailService{frontendURL: frontendURL}
}

func (s *EmailService) SendActivationEmail(name, email, token string) {
	activationLink := s.frontendURL + "/activate?token=" + token

	// Por ahora solo logueamos. Luego conectamos un proveedor real.
	log.Printf("───────────────────────────────────────────")
	log.Printf("📧 EMAIL DE ACTIVACIÓN")
	log.Printf("   Para:  %s <%s>", name, email)
	log.Printf("   Link:  %s", activationLink)
	log.Printf("───────────────────────────────────────────")
}
