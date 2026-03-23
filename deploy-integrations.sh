#!/bin/bash
set -e

echo "=== Scalyo - Déploiement des intégrations ==="
echo ""

# ─── Étape 1 : Migration D1 ──────────────────────────────────
echo "📦 Étape 1/4 : Migration de la base de données..."
cd workers-backend
npx wrangler d1 execute scalyo-db --remote --file=./migrations/0003_integration_oauth.sql
echo "✅ Migration appliquée"
echo ""

# ─── Étape 2 : Secrets OAuth (optionnel) ─────────────────────
echo "🔐 Étape 2/4 : Configuration des secrets OAuth..."
echo ""
echo "Pour Gmail / Google Meet, il te faut un projet Google Cloud :"
echo "  1. Va sur https://console.cloud.google.com/apis/credentials"
echo "  2. Crée un 'OAuth 2.0 Client ID' (type: Web application)"
echo "  3. Ajoute ce Redirect URI : https://api.scalyo.app/api/oauth/callback/google"
echo "  4. Copie le Client ID et Client Secret"
echo ""
read -p "As-tu un Google Client ID ? (o/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Oo]$ ]]; then
  read -p "GOOGLE_CLIENT_ID: " GCID
  read -p "GOOGLE_CLIENT_SECRET: " GCSEC
  echo "$GCID" | npx wrangler secret put GOOGLE_CLIENT_ID
  echo "$GCSEC" | npx wrangler secret put GOOGLE_CLIENT_SECRET
  echo "✅ Secrets Google configurés"
else
  echo "⏭️  Google OAuth ignoré (Gmail/Google Meet ne fonctionneront pas en OAuth)"
fi
echo ""

echo "Pour Outlook, il te faut une app Azure AD :"
echo "  1. Va sur https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade"
echo "  2. Crée une nouvelle inscription d'application"
echo "  3. Ajoute ce Redirect URI : https://api.scalyo.app/api/oauth/callback/microsoft"
echo "  4. Crée un secret client dans 'Certificats et secrets'"
echo ""
read -p "As-tu un Microsoft Client ID ? (o/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Oo]$ ]]; then
  read -p "MICROSOFT_CLIENT_ID: " MCID
  read -p "MICROSOFT_CLIENT_SECRET: " MCSEC
  echo "$MCID" | npx wrangler secret put MICROSOFT_CLIENT_ID
  echo "$MCSEC" | npx wrangler secret put MICROSOFT_CLIENT_SECRET
  echo "✅ Secrets Microsoft configurés"
else
  echo "⏭️  Microsoft OAuth ignoré (Outlook ne fonctionnera pas en OAuth)"
fi
echo ""

# ─── Étape 3 : Déployer le backend ──────────────────────────
echo "🚀 Étape 3/4 : Déploiement du backend Worker..."
npx wrangler deploy
echo "✅ Backend déployé"
echo ""

# ─── Étape 4 : Déployer le frontend ─────────────────────────
echo "🎨 Étape 4/4 : Build et déploiement du frontend..."
cd ../frontend
npm run build
npx wrangler pages deploy dist --project-name=scalyo
echo "✅ Frontend déployé"
echo ""

echo "=== ✅ Déploiement terminé ! ==="
echo ""
echo "Intégrations disponibles SANS config OAuth :"
echo "  ✅ Stripe, Slack, Teams, HubSpot, Pipedrive, Salesforce"
echo "  ✅ Intercom, Jira, Asana, Zoom, Calendly"
echo ""
echo "Intégrations nécessitant OAuth (si configuré ci-dessus) :"
echo "  📧 Gmail, Outlook, Google Meet"
