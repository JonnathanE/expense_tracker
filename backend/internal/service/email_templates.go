package service

import "fmt"

func buildActivationEmail(name, activationLink string) string {
	return fmt.Sprintf(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Activa tu cuenta</title>
</head>
<body style="margin:0;padding:0;background-color:#09090b;font-family:system-ui,sans-serif;">
  <table width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
          style="background:#18181b;border-radius:12px;border:1px solid #27272a;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px;text-align:center;border-bottom:1px solid #27272a;">
              <span style="font-size:32px;">💰</span>
              <h1 style="margin:12px 0 0;color:#ffffff;font-size:20px;font-weight:700;">
                Expense Tracker
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <p style="margin:0 0 8px;color:#a1a1aa;font-size:14px;">
                Hola, <strong style="color:#ffffff;">%s</strong> 👋
              </p>
              <h2 style="margin:0 0 16px;color:#ffffff;font-size:22px;font-weight:700;">
                Activa tu cuenta
              </h2>
              <p style="margin:0 0 28px;color:#a1a1aa;font-size:15px;line-height:1.6;">
                Gracias por registrarte. Haz clic en el botón para activar tu cuenta.
                Este link expira en <strong style="color:#ffffff;">24 horas</strong>.
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background:#6366f1;">
                    <a href="%s"
                      style="display:inline-block;padding:14px 32px;color:#ffffff;
                             font-size:15px;font-weight:600;text-decoration:none;">
                      Activar cuenta
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:24px 0 0;color:#52525b;font-size:12px;line-height:1.6;">
                Si el botón no funciona, copia este link en tu navegador:<br/>
                <a href="%s" style="color:#6366f1;word-break:break-all;">%s</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #27272a;text-align:center;">
              <p style="margin:0;color:#52525b;font-size:12px;">
                Si no creaste esta cuenta puedes ignorar este email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`, name, activationLink, activationLink, activationLink)
}

func buildPasswordResetEmail(name, resetLink string) string {
	return fmt.Sprintf(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Recuperar contraseña</title>
</head>
<body style="margin:0;padding:0;background-color:#09090b;font-family:system-ui,sans-serif;">
  <table width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
          style="background:#18181b;border-radius:12px;border:1px solid #27272a;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px;text-align:center;border-bottom:1px solid #27272a;">
              <span style="font-size:32px;">💰</span>
              <h1 style="margin:12px 0 0;color:#ffffff;font-size:20px;font-weight:700;">
                Expense Tracker
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <p style="margin:0 0 8px;color:#a1a1aa;font-size:14px;">
                Hola, <strong style="color:#ffffff;">%s</strong> 👋
              </p>
              <h2 style="margin:0 0 16px;color:#ffffff;font-size:22px;font-weight:700;">
                Recuperar contraseña
              </h2>
              <p style="margin:0 0 28px;color:#a1a1aa;font-size:15px;line-height:1.6;">
                Recibimos una solicitud para restablecer tu contraseña.
                Este link expira en <strong style="color:#ffffff;">1 hora</strong>.
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background:#6366f1;">
                    <a href="%s"
                      style="display:inline-block;padding:14px 32px;color:#ffffff;
                             font-size:15px;font-weight:600;text-decoration:none;">
                      Restablecer contraseña
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:24px 0 0;color:#52525b;font-size:12px;line-height:1.6;">
                Si el botón no funciona, copia este link en tu navegador:<br/>
                <a href="%s" style="color:#6366f1;word-break:break-all;">%s</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #27272a;text-align:center;">
              <p style="margin:0;color:#52525b;font-size:12px;">
                Si no solicitaste esto puedes ignorar este email.<br/>
                Tu contraseña no cambiará hasta que hagas clic en el link.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`, name, resetLink, resetLink, resetLink)
}
