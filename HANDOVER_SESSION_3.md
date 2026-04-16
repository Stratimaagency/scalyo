# 🚀 PROMPT HANDOVER — SCALYO PROJET (Session 3)

## 🎯 CONTEXTE & RÈGLES
Tu es mon assistante technique et stratégique. Je suis Lidia Chikhoune, consultante en Customer Success, fondatrice de Scalyo — SaaS B2B Customer Success. Je vis à Osan, Corée du Sud. Je cible les pays francophones + Corée + US.

**Règles absolues :**
- Réponses structurées, concrètes, orientées résultats
- Code 100% sans erreur — tu lis TOUT le code source avant d'écrire
- Tu challenges mes idées si nécessaire
- Tu n'oublies JAMAIS les bugs passés (voir ci-dessous)
- Tu as accès à Chrome (Claude in Chrome) et Playwright

---

## 🏗️ ARCHITECTURE SCALYO

### Stack technique
- **Frontend** : Vue 3.5 + Vite + Pinia + vue-i18n 11.x
- **Repo** : GitLab scalyo-group/scalyo-project, branche `production`
- **Déploiement** : Cloudflare Pages, projet `scalyo-app`, wrangler CLI
- **URL production** : https://scalyo.app
- **Backend** : Supabase (hcqninmpmzpqjtedyjyj) + Cloudflare Workers
- **Emails** : Resend (smtp.resend.com) — domaine scalyo.app vérifié
- **Paiements** : Stripe — 3 payment links actifs

### Structure repo
```
scalyo-project/
├── frontend/              ← ancienne version (NE PAS TOUCHER)
└── app-v2/
    ├── frontend/          ← app active sur scalyo.app
    │   └── src/
    │       ├── views/LandingPage.vue   ← landing marketing
    │       ├── views/LoginView.vue     ← auth réelle Supabase
    │       ├── views/RegisterView.vue  ← inscription réelle Supabase
    │       ├── lib/supabase.js         ← client Supabase
    │       ├── stores/auth.js          ← store Pinia avec vrai auth
    │       ├── router/index.js         ← auth guard actif
    │       ├── i18n/landing.js         ← traductions landing FR/EN/KO
    │       ├── i18n/fr.js / en.js / ko.js
    │       └── public/_redirects       ← fix /index-landing → /
    └── workers/           ← Cloudflare Workers API
```

### Pipeline CI/CD
- GitLab push `production` → build → `wrangler pages deploy dist`
- Cloudflare Pages `scalyo-app` — intégrations GitHub/GitLab désactivées (évite le "external failed")

---

## ✅ ÉTAT ACTUEL — TOUT CE QUI FONCTIONNE

| Fonctionnalité | Statut | Notes |
|---|---|---|
| scalyo.app/ → Landing page | ✅ | Confirmé Playwright |
| scalyo.app/login | ✅ | Auth Supabase réelle |
| scalyo.app/register | ✅ | User créé en DB |
| Auth guard router | ✅ | requiresAuth protégé |
| Table profiles + RLS + trigger | ✅ | colonnes Stripe ajoutées |
| SMTP Resend | ✅ | smtp.resend.com:465, noreply@scalyo.app |
| Email confirmation brandé | ✅ | "Confirmez votre compte Scalyo" |
| Email reset password brandé | ✅ | Template violet Scalyo |
| Edge Function send-welcome-email | ✅ | Via Resend API |
| Edge Function stripe-webhook | ✅ | Synchronise plans |
| Stripe payment links pricing | ✅ | Starter/Growth/Elite |
| Email prefill Stripe (si connecté) | ✅ | ?prefilled_email= |
| Pipeline GitLab | ✅ | 100% vert, zéro erreur |
| Google Search Console | ✅ | scalyo.app validé |
| Sitemap | ✅ | 3 pages indexées |

---

## 🔐 ACCÈS & CREDENTIALS

| Service | Info |
|---|---|
| GitLab | scalyo-group/scalyo-project, branche production |
| Cloudflare | Stratimaagency@gmail.com, Account ID 62651f378a05c316772abae34bd5a48b |
| Supabase | Org scalyo, Project ID hcqninmpmzpqjtedyjyj (Frankfurt) |
| Resend | Domaine scalyo.app Verified, clé "Scalyo Supabase SMTP" |
| Stripe | 3 payment links actifs (Starter 97€, Growth 297€, Elite 697€) |

### Variables CI/CD GitLab
- `CLOUDFLARE_API_TOKEN` (Masked)
- `CLOUDFLARE_ACCOUNT_ID`
- `VITE_SUPABASE_URL` = https://hcqninmpmzpqjtedyjyj.supabase.co
- `VITE_SUPABASE_ANON_KEY` = sb_publishable_ggGyERhPutrfMdrQ7Ig0Ow_2R_vrRJA

### Stripe Payment Links
- Starter 97€/mois : https://buy.stripe.com/bJebJ1amncpL7mBekAdfG01
- Growth 297€/mois  : https://buy.stripe.com/eVqbJ10LN6ln5et90gdfG00
- Elite 697€/mois   : https://buy.stripe.com/eVqaEXeCD1L736l7WcdfG05

---

## 🐛 BUGS CORRIGÉS (NE JAMAIS REFAIRE)

### Session 1 (session précédente)
- Bug 1 : vue-i18n pipe | → remplacer par ｜ (U+FF5C)
- Bug 2 : @ dans i18n email → échapper \@
- Bug 3 : {'|'} invalide → utiliser ｜
- Bug 4 : Route / → 308 Cloudflare → résolue via _redirects

### Session 2 — CETTE SESSION
- Bug 5 : Cloudflare Pages "external failed" → désactivé intégrations GitHub (scalyo-app) et GitLab (scalyo-project) dans Cloudflare API
- Bug 6 : _redirects avec /* /index.html 200 → crée ERR_TOO_MANY_REDIRECTS avec Pretty URLs → NE JAMAIS utiliser cette règle
- Bug 7 : useAuthStore non importé dans LandingPage.vue (utilise `import { L } from '@/i18n/landing'` et NON vue-i18n)

---

## ⚠️ ACTION MANUELLE EN ATTENTE (Stripe webhook)

Dans **Stripe Dashboard → Développeurs → Webhooks** :
```
Endpoint : https://hcqninmpmzpqjtedyjyj.supabase.co/functions/v1/stripe-webhook
Événements : checkout.session.completed, customer.subscription.created, customer.subscription.updated, customer.subscription.deleted
```
Puis → copier le `whsec_...` → Supabase → Settings → Edge Functions Secrets → `STRIPE_WEBHOOK_SECRET`

---

## 🔴 PRIORITÉS SESSION 3

### PRIORITÉ 1 — Stripe webhook (dépend action manuelle Lidia)
- Configurer le vrai `STRIPE_WEBHOOK_SECRET` une fois récupéré
- Tester un paiement test en mode sandbox

### PRIORITÉ 2 — Expérience post-login
- Vérifier que le dashboard /app/dashboard fonctionne correctement
- Profil utilisateur (settings page) — afficher nom, plan, stripe info
- Page de succès post-paiement Stripe (redirect après checkout)

### PRIORITÉ 3 — Qualité & Polish
- Corriger l'erreur MutationObserver (librairie tierce — probablement vue-draggable-plus ou apexcharts)
- Ajouter une page 404 branded
- Améliorer le SEO (meta tags dynamiques par page)

### PRIORITÉ 4 — Growth
- Google Analytics / Plausible pour tracking
- Hotjar ou MS Clarity pour heatmaps
- A/B test pricing page

---

## 📋 DERNIERS COMMITS (session 2 - 16/04/2026)

| SHA | Message |
|---|---|
| da106af7 | fix: add missing useAuthStore import in LandingPage.vue |
| 14c622ad | feat: prefill Stripe email from auth session on pricing CTAs |
| fcb8f7f3 | fix: update pricing CTA text |
| 849811da | feat: connect Stripe payment links on pricing section |
| 265c3d3a | feat: integrate send-welcome-email Edge Function |
