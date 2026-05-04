# Scalyo — Configuration de securite

## Architecture Providers IA

Le provider IA est configure dans Cloudflare Dashboard > Pages > scalyo-app > Settings > Environment variables.
Le code default sur Mistral (Paris, EU) si AI_PROVIDER n'est pas set.

| Provider | Env var | Hebergement | RGPD |
|---|---|---|---|
| Mistral (defaut) | AI_PROVIDER=mistral + MISTRAL_API_KEY | Paris, EU | Conforme |
| Anthropic | AI_PROVIDER=anthropic + ANTHROPIC_API_KEY | US + DPA | Acceptable |
| DeepSeek | AI_PROVIDER=deepseek + DEEPSEEK_API_KEY | Chine | Risque |

## Cles SECRETES (Cloudflare env vars uniquement)

| Variable | Source | Usage |
|---|---|---|
| MISTRAL_API_KEY | console.mistral.ai | Provider IA principal |
| SUPABASE_JWT_SECRET | Supabase Dashboard | Verification auth |
| STRIPE_WEBHOOK_SECRET | Stripe Dashboard | Verification webhooks |
| SUPABASE_SERVICE_ROLE_KEY | Supabase Dashboard | Operations admin |

## Cles PUBLIQUES (constantes dans le code)

- SUPABASE_URL : URL publique du projet Supabase
- SUPABASE_ANON_KEY : cle publique Supabase (acces limite par RLS)

## Regles

1. Jamais de cle secrete dans le code source
2. Jamais de cle secrete dans les logs ou messages d'erreur
3. RLS actif sur toutes les tables utilisateur
4. Auth ES256 (jamais HMAC)
5. Provider IA change UNIQUEMENT via Cloudflare Dashboard (pas le CI)
6. Consentement IA obligatoire avant traitement des donnees
7. HTTPS force via Cloudflare
