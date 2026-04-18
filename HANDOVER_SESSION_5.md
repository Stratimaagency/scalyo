# HANDOVER SESSION 5 — Scalyo
**Date :** 2026-04-18
**Branch :** production
**Deployed :** https://scalyo.app

---

## ✅ COMPLÉTÉ SESSION 5

### Reset Password Flow complet (8 fichiers)
| Fichier | Changement |
|---------|------------|
| stores/auth.js | resetPassword(email) — Supabase resetPasswordForEmail |
| router/index.js | Fix bug critique : /cgu /privacy /404 étaient dans children de /app (requiresAuth hérité) — sortis au top-level. Routes /reset-password (guest) + /reset-password-confirm ajoutées. Noms CGU/Privacy. SEO titles |
| i18n/fr.js | 20 clés reset_* + reset_confirm_* + sidebar_profile + sidebar_logout |
| i18n/en.js | Idem EN |
| i18n/ko.js | Idem KO |
| views/LoginView.vue | Lien "Mot de passe oublié ?" violet right-aligned + fix placeholder \u2022 → •••• |
| views/auth/ResetPasswordView.vue | Page demande reset : email → envoi Supabase → état succès |
| views/auth/ResetPasswordConfirmView.vue | Page saisie nouveau mdp : écoute PASSWORD_RECOVERY Supabase, fallback "lien expiré" 4s, updateUser(), redirect /login auto 3s |

### Sidebar + Auth (6 fichiers)
| Fichier | Changement |
|---------|------------|
| layouts/AppLayout.vue | Bouton 🚪 Se déconnecter (rouge, bas sidebar) + 👤 Mon profil dans nav + handleLogout() + CSS .sidebar-logout |
| views/SettingsView.vue | useRouter importé + handleLogout() disponible |
| router/index.js | Titres SEO : ResetPassword, ResetPasswordConfirm, CGU, Privacy |
| i18n/fr.js | sidebar_profile + sidebar_logout |
| i18n/en.js | sidebar_profile + sidebar_logout |
| i18n/ko.js | sidebar_profile + sidebar_logout |

### Supabase vérifié (0 action nécessaire)
- Redirect URLs : https://scalyo.app/** déjà en place → couvre /reset-password-confirm
- Email template "Reset password" : déjà brandé Scalyo, en français

---

## ROUTES COMPLÈTES AU 2026-04-18

| URL | Composant | Guard |
|-----|-----------|-------|
| / | LandingPage.vue | Public |
| /login | LoginView.vue | guest |
| /register | RegisterView.vue | guest |
| /reset-password | ResetPasswordView.vue | guest |
| /reset-password-confirm | ResetPasswordConfirmView.vue | Public |
| /payment-success | PaymentSuccessView.vue | Public |
| /cgu | CguView.vue | Public |
| /privacy | PrivacyView.vue | Public |
| /404 + catch-all | NotFoundView.vue | Public |
| /paywall | PaywallView.vue | Auth |
| /app/* | AppLayout + views | requiresAuth |

---

## FLUX RESET PASSWORD — COMPLET ET VALIDÉ LIVE

```
/login → "Mot de passe oublié ?"
  → /reset-password (email → Supabase resetPasswordForEmail)
    → Email reçu (template brandé FR) → clic lien
      → /reset-password-confirm#access_token=...&type=recovery
        → PASSWORD_RECOVERY event → formulaire nouveau mdp
          → supabase.auth.updateUser({ password })
            → ✅ redirect /login (3s auto)
```

---

## BUGS CORRIGÉS — NE JAMAIS RÉPÉTER

1. **Template literal + apostrophe** : `'Renvoyer l\'email'` dans un template literal → perd le backslash → SyntaxError. Utiliser double quotes : `"Renvoyer l'email"`
2. **Routes dans children de /app** : /cgu /privacy /404 héritaient de requiresAuth → utilisateur non connecté redirigé vers login. Toujours mettre les routes publiques au top-level.
3. **\u2022 dans placeholder Vue** : Les escape sequences Unicode ne sont PAS interprétées dans les attributs HTML Vue template. Utiliser le caractère direct : `placeholder="••••••••"`
4. (Voir sessions précédentes pour autres bugs)

---

## PRIORITÉS RESTANTES

- [ ] Test paiement Stripe sandbox (flow /payment-success → plan actif → profil)
- [ ] A/B test pricing page (à définir)
- [ ] Sidebar link "Mon profil" : actuellement via avatar click ET nav link ✅ — vérifier rendu visuel connecté

---

## INFRA
- Stack : Vue 3.5 + Vite + Pinia + vue-i18n + Supabase + Cloudflare Pages
- Repo : gitlab.com/scalyo-group/scalyo-project, branche production
- Deploy : GitLab CI → npm install → vite build → wrangler pages deploy dist
- Supabase : hcqninmpmzpqjtedyjyj (Frankfurt)
- Emails : Resend SMTP smtp.resend.com:465 (scalyo.app Verified, Ireland)
- Paiements : Stripe — 3 payment links actifs
