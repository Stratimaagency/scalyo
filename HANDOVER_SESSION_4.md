# HANDOVER SESSION 4 — Scalyo
**Date :** 2026-04-16
**Branch :** production
**Deployed :** https://scalyo.app

---

## ✅ COMPLÉTÉ SESSIONS 3–4 (tous commits pushés)

### Session 3 — Base technique
| Commit | Description |
|--------|-------------|
| da106af7 | fix: useAuthStore import in LandingPage.vue |
| 14c622ad | feat: Stripe email prefill on pricing CTAs |
| 849811da | feat: Stripe payment links connectés |
| 265c3d3a | feat: send-welcome-email Edge Function |

### Session 4 — Complet
| Fichier | Changement |
|---------|------------|
| ImportView.vue | Nouveau flow : sélection du module AVANT analyse IA |
| i18n/fr + en + ko | +6 clés module picker + +30 clés success/profile/404/login |
| PaymentSuccessView.vue | Page succès Stripe avec confetti + plan affiché |
| ProfileView.vue | Profil utilisateur : nom, plan actif, infos compte |
| NotFoundView.vue | 404 brandé Scalyo |
| router/index.js | Routes /app/profile, /payment-success, 404 catch-all + SEO titles |
| LoginView.vue | Banner "Email confirmé !" quand ?verified=true |
| auth.js | emailRedirectTo: /login?verified=true sur signUp |
| AppLayout.vue | Avatar cliquable → /app/profile |
| KpisBuilder.vue | fix: :key sur apexchart → stop MutationObserver error |
| KpisPreview.vue | fix: :key sur apexchart → stop MutationObserver error |
| main.js | fix: safety net ResizeObserver/MutationObserver global |
| index.html | feat: Plausible Analytics + Microsoft Clarity |

---

## 🔴 ACTIONS MANUELLES REQUISES

### 1. Stripe — Webhook (BLOQUANT pour sync plan)
```
dashboard.stripe.com → Developers → Webhooks → Add endpoint
URL     : https://hcqninmpmzpqjtedyjyj.supabase.co/functions/v1/stripe-webhook
Events  : checkout.session.completed
          customer.subscription.created
          customer.subscription.updated
          customer.subscription.deleted
→ Copier whsec_xxx → Supabase → Settings → Edge Functions → STRIPE_WEBHOOK_SECRET
```

### 2. Stripe — Success URL sur chaque Payment Link
```
Pour chaque lien (Starter/Growth/Elite) :
dashboard.stripe.com → Payment Links → Edit → After payment → Redirect URL
URL : https://scalyo.app/payment-success
```

### 3. Microsoft Clarity — Remplacer l'ID placeholder
```
clarity.microsoft.com → Créer un projet → Copier l'ID (ex: "abc123xyz")
index.html → Remplacer "CLARITY_PROJECT_ID" par le vrai ID
```

---

## ARCHITECTURE ACTUELLE

**Stack :** Vue 3.5 + Vite + Pinia + vue-i18n 11.x
**Repo :** gitlab.com/scalyo-group/scalyo-project branche `production`
**Deploy :** Cloudflare Pages scalyo-app → wrangler pages deploy dist
**URL :** https://scalyo.app
**Supabase :** hcqninmpmzpqjtedyjyj (Frankfurt)
**Resend SMTP :** smtp.resend.com:465 (eu-west-1)

**Stripe Payment Links actifs :**
- Starter 97€/mois : https://buy.stripe.com/bJebJ1amncpL7mBekAdfG01
- Growth  297€/mois : https://buy.stripe.com/eVqbJ10LN6ln5et90gdfG00
- Elite   697€/mois : https://buy.stripe.com/eVqaEXeCD1L736l7WcdfG05

## ROUTES DISPONIBLES

| Route | Composant | Auth |
|-------|-----------|------|
| / | LandingPage.vue | Public |
| /login?verified=true | LoginView.vue | Public (banner ✅) |
| /register | RegisterView.vue | Public |
| /payment-success | PaymentSuccessView.vue | Public |
| /app/dashboard | DashboardView.vue | ✅ Auth |
| /app/profile | ProfileView.vue | ✅ Auth |
| /app/settings | SettingsView.vue | ✅ Auth |
| /app/import | ImportView.vue | ✅ Auth |
| /:pathMatch(.*) | NotFoundView.vue | Public |

## IMPORT FLOW (nouveau)
```
Upload fichier → Modal "Quel module ?" (clients/tasks/team/copil) 
→ Analyse DeepSeek avec module forcé → Preview → Import
```

## BUGS CORRIGÉS — NE JAMAIS RÉPÉTER
1. vue-i18n pipe | → utiliser ｜ (U+FF5C)
2. @ dans i18n → échapper \\@
3. {'|'} invalide → utiliser ｜
4. Route / → 308 permanente → résolue via _redirects
5. Cloudflare "external failed" → deployments_enabled: false
6. _redirects /* /index.html 200 → ERR_TOO_MANY_REDIRECTS — NE JAMAIS utiliser
7. useAuthStore dans LandingPage → import séparé depuis @/stores/auth
8. ApexCharts sans :key → MutationObserver orphelin → toujours ajouter :key="type + block.id"

## PROCHAINES PRIORITÉS (P5)
- Tester le flux complet paiement Stripe en mode sandbox
- Ajouter Sidebar link "Mon profil" dans AppLayout
- A/B test pricing page
- Vérifier SettingsView logout function (auth.logout peut être undefined)
