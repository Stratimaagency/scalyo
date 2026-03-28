/**
 * Branded email templates for Scalyo
 */

function layout(content) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #0e1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 520px; margin: 0 auto; padding: 40px 20px;">
    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 32px;">
      <span style="font-size: 32px; font-weight: 900; letter-spacing: -1px; color: #ffffff;">scal<span style="color: #4DB6A0;">yo</span></span>
    </div>
    <!-- Card -->
    <div style="background: #161b22; border: 1px solid #2d333b; border-radius: 16px; padding: 36px 32px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="text-align: center; margin-top: 24px;">
      <p style="color: #484f58; font-size: 11px; margin: 0;">Cet email a été envoyé par Scalyo — scalyo.app</p>
    </div>
  </div>
</body>
</html>`
}

export function verificationEmail(verifyUrl) {
  return layout(`
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="font-size: 48px;">🎉</span>
    </div>
    <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; text-align: center; margin: 0 0 8px;">
      Bienvenue sur Scalyo !
    </h2>
    <p style="color: #8b949e; font-size: 14px; line-height: 1.6; text-align: center; margin: 0 0 28px;">
      On est ravis de vous avoir parmi nous 🚀<br>
      Confirmez votre adresse email pour accéder à toutes les fonctionnalités.
    </p>
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${verifyUrl}" style="display: inline-block; background: #4DB6A0; color: #ffffff; padding: 14px 40px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">
        ✅ Je confirme mon adresse
      </a>
    </div>
    <p style="color: #484f58; font-size: 12px; text-align: center; margin: 0;">
      Ce lien expire dans 24 heures.
    </p>
  `)
}

export function resetPasswordEmail(resetUrl) {
  return layout(`
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="font-size: 48px;">🔐</span>
    </div>
    <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; text-align: center; margin: 0 0 8px;">
      Réinitialiser votre mot de passe
    </h2>
    <p style="color: #8b949e; font-size: 14px; line-height: 1.6; text-align: center; margin: 0 0 28px;">
      Pas de panique, ça arrive à tout le monde 😉<br>
      Cliquez ci-dessous pour choisir un nouveau mot de passe.
    </p>
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${resetUrl}" style="display: inline-block; background: #4DB6A0; color: #ffffff; padding: 14px 40px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">
        🔑 Nouveau mot de passe
      </a>
    </div>
    <p style="color: #484f58; font-size: 12px; text-align: center; margin: 0;">
      Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.
    </p>
  `)
}
