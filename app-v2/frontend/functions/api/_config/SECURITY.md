# Securite des cles API — Scalyo

## Fichier de reference : _config/index.js

### Cles PUBLIQUES (dans le code)
- SUPABASE_URL : URL projet Supabase
- SUPABASE_ANON_KEY : cle publique, securisee par RLS

### Cles SECRETES (Cloudflare env vars uniquement)
- DEEPSEEK_API_KEY : cle API DeepSeek (OBLIGATOIRE)
- ANTHROPIC_API_KEY : cle API Anthropic (optionnel)

## Ou configurer
Cloudflare Dashboard > Workers & Pages > scalyo-app > Settings > Environment Variables

## Couches de securite
1. JWT verifie sur chaque requete
2. CORS restreint (scalyo.app, app.scalyo.app)
3. Cles secretes jamais dans le code
4. RLS Supabase sur toutes les tables
5. Dossiers _ non exposes comme routes
6. Aucun nom de provider expose au frontend
7. Validation des inputs sur chaque requete
8. Messages erreur i18n generiques
