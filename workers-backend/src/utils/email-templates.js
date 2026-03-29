/**
 * Branded email templates for Scalyo — multilingual (FR/EN/KR)
 */

function layout(content, lang = 'fr') {
  const footer = {
    fr: 'Cet email a été envoyé par Scalyo — scalyo.app',
    en: 'This email was sent by Scalyo — scalyo.app',
    kr: '이 이메일은 Scalyo에서 발송되었습니다 — scalyo.app',
  }
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
      <p style="color: #484f58; font-size: 11px; margin: 0;">${footer[lang] || footer.fr}</p>
    </div>
  </div>
</body>
</html>`
}

const VERIFY = {
  fr: {
    title: 'Bienvenue sur Scalyo !',
    desc: 'On est ravis de vous avoir parmi nous 🚀<br>Confirmez votre adresse email pour accéder à toutes les fonctionnalités.',
    btn: '✅ Je confirme mon adresse',
    expire: 'Ce lien expire dans 24 heures.',
    subject: 'Bienvenue sur Scalyo ! Confirmez votre email 🎉',
  },
  en: {
    title: 'Welcome to Scalyo!',
    desc: "We're thrilled to have you on board 🚀<br>Confirm your email address to unlock all features.",
    btn: '✅ Confirm my email',
    expire: 'This link expires in 24 hours.',
    subject: 'Welcome to Scalyo! Confirm your email 🎉',
  },
  kr: {
    title: 'Scalyo에 오신 것을 환영합니다!',
    desc: '함께하게 되어 기쁩니다 🚀<br>모든 기능을 이용하려면 이메일 주소를 인증해주세요.',
    btn: '✅ 이메일 인증하기',
    expire: '이 링크는 24시간 후 만료됩니다.',
    subject: 'Scalyo에 오신 것을 환영합니다! 이메일을 인증해주세요 🎉',
  },
}

const RESET = {
  fr: {
    title: 'Réinitialiser votre mot de passe',
    desc: 'Pas de panique, ça arrive à tout le monde 😉<br>Cliquez ci-dessous pour choisir un nouveau mot de passe.',
    btn: '🔑 Nouveau mot de passe',
    expire: "Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.",
    subject: 'Réinitialiser votre mot de passe 🔐 — Scalyo',
  },
  en: {
    title: 'Reset your password',
    desc: "Don't worry, it happens to everyone 😉<br>Click below to choose a new password.",
    btn: '🔑 New password',
    expire: "This link expires in 1 hour. If you didn't request this, ignore this email.",
    subject: 'Reset your password 🔐 — Scalyo',
  },
  kr: {
    title: '비밀번호 재설정',
    desc: '걱정 마세요, 누구에게나 일어나는 일입니다 😉<br>아래를 클릭하여 새 비밀번호를 설정하세요.',
    btn: '🔑 새 비밀번호',
    expire: '이 링크는 1시간 후 만료됩니다. 요청하지 않았다면 이 이메일을 무시하세요.',
    subject: '비밀번호 재설정 🔐 — Scalyo',
  },
}

export function verificationEmail(verifyUrl, lang = 'fr') {
  const t = VERIFY[lang] || VERIFY.fr
  return layout(`
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="font-size: 48px;">🎉</span>
    </div>
    <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; text-align: center; margin: 0 0 8px;">
      ${t.title}
    </h2>
    <p style="color: #8b949e; font-size: 14px; line-height: 1.6; text-align: center; margin: 0 0 28px;">
      ${t.desc}
    </p>
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${verifyUrl}" style="display: inline-block; background: #4DB6A0; color: #ffffff; padding: 14px 40px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">
        ${t.btn}
      </a>
    </div>
    <p style="color: #484f58; font-size: 12px; text-align: center; margin: 0;">
      ${t.expire}
    </p>
  `, lang)
}

export function verificationSubject(lang = 'fr') {
  return (VERIFY[lang] || VERIFY.fr).subject
}

export function resetPasswordEmail(resetUrl, lang = 'fr') {
  const t = RESET[lang] || RESET.fr
  return layout(`
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="font-size: 48px;">🔐</span>
    </div>
    <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; text-align: center; margin: 0 0 8px;">
      ${t.title}
    </h2>
    <p style="color: #8b949e; font-size: 14px; line-height: 1.6; text-align: center; margin: 0 0 28px;">
      ${t.desc}
    </p>
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${resetUrl}" style="display: inline-block; background: #4DB6A0; color: #ffffff; padding: 14px 40px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">
        ${t.btn}
      </a>
    </div>
    <p style="color: #484f58; font-size: 12px; text-align: center; margin: 0;">
      ${t.expire}
    </p>
  `, lang)
}

export function resetPasswordSubject(lang = 'fr') {
  return (RESET[lang] || RESET.fr).subject
}

export function inviteEmail({ loginUrl, to, displayName, inviterName, companyName, tempPassword, lang = 'fr' }) {
  const t = {
    fr: {
      title: 'Bienvenue sur Scalyo !',
      desc: `${inviterName} vous a invité(e) à rejoindre <strong>${companyName}</strong> sur Scalyo.`,
      credentials: 'Vos identifiants :',
      emailLabel: 'Email :',
      passLabel: 'Mot de passe temporaire :',
      warning: 'Vous devrez changer votre mot de passe à la première connexion.',
      btn: 'Se connecter',
      subject: `${inviterName} vous invite sur Scalyo`,
    },
    en: {
      title: 'Welcome to Scalyo!',
      desc: `${inviterName} invited you to join <strong>${companyName}</strong> on Scalyo.`,
      credentials: 'Your credentials:',
      emailLabel: 'Email:',
      passLabel: 'Temporary password:',
      warning: 'You will need to change your password on first login.',
      btn: 'Log in',
      subject: `${inviterName} invited you to Scalyo`,
    },
    kr: {
      title: 'Scalyo에 오신 것을 환영합니다!',
      desc: `${inviterName}님이 Scalyo에서 <strong>${companyName}</strong>에 초대했습니다.`,
      credentials: '로그인 정보:',
      emailLabel: '이메일:',
      passLabel: '임시 비밀번호:',
      warning: '첫 로그인 시 비밀번호를 변경해야 합니다.',
      btn: '로그인',
      subject: `${inviterName}님이 Scalyo에 초대했습니다`,
    },
  }
  const l = t[lang] || t.fr
  const html = layout(`
    <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; text-align: center; margin: 0 0 8px;">${l.title}</h2>
    <p style="color: #8b949e; font-size: 14px; line-height: 1.6; text-align: center; margin: 0 0 20px;">${l.desc}</p>
    <div style="background: #21262d; border-radius: 10px; padding: 16px; margin: 0 0 16px;">
      <p style="margin: 0 0 8px; font-size: 13px; color: #8b949e;">${l.credentials}</p>
      <p style="margin: 0 0 4px; font-size: 14px; color: #ffffff;"><strong>${l.emailLabel}</strong> ${to}</p>
      <p style="margin: 0; font-size: 14px; color: #ffffff;"><strong>${l.passLabel}</strong> ${tempPassword}</p>
    </div>
    <p style="color: #f85149; font-size: 13px; font-weight: 600; text-align: center; margin: 0 0 20px;">${l.warning}</p>
    <div style="text-align: center;">
      <a href="${loginUrl}" style="display: inline-block; background: #4DB6A0; color: #fff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">${l.btn}</a>
    </div>
  `, lang)
  return { html, subject: l.subject }
}
