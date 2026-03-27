#!/bin/bash
set -e

echo "=== Scalyo - Deploiement des integrations ==="
echo ""

# ─── Etape 1 : Migrations D1 ──────────────────────────────────
echo "Etape 1/4 : Migration de la base de donnees..."
cd workers-backend

# Appliquer toutes les migrations necessaires
for migration in \
  ./migrations/0002_integrations.sql \
  ./migrations/0003_integration_oauth.sql \
  ./migrations/0006_tasks.sql \
  ./migrations/0011_accounts_sync_columns.sql; do
  if [ -f "$migration" ]; then
    echo "  -> $(basename $migration)"
    npx wrangler d1 execute scalyo-db --remote --file="$migration" || echo "  (deja appliquee ou ignoree)"
  fi
done
echo "Migrations appliquees"
echo ""

# ─── Etape 2 : Secrets OAuth (optionnel) ─────────────────────
echo "Etape 2/4 : Configuration des secrets OAuth..."
echo ""
echo "Pour Gmail / Google Meet, il te faut un projet Google Cloud :"
echo "  1. Va sur https://console.cloud.google.com/apis/credentials"
echo "  2. Cree un 'OAuth 2.0 Client ID' (type: Web application)"
echo "  3. Ajoute ce Redirect URI : https://scalyo-api.stratimaagency.workers.dev/api/oauth/callback/google"
echo "  4. Copie le Client ID et Client Secret"
echo ""
read -p "As-tu un Google Client ID ? (o/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Oo]$ ]]; then
  read -p "GOOGLE_CLIENT_ID: " GCID
  read -p "GOOGLE_CLIENT_SECRET: " GCSEC
  echo "$GCID" | npx wrangler secret put GOOGLE_CLIENT_ID
  echo "$GCSEC" | npx wrangler secret put GOOGLE_CLIENT_SECRET
  echo "Secrets Google configures"
else
  echo "Google OAuth ignore (Gmail/Google Meet ne fonctionneront pas en OAuth)"
fi
echo ""

echo "Pour Outlook, il te faut une app Azure AD :"
echo "  1. Va sur https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade"
echo "  2. Cree une nouvelle inscription d'application"
echo "  3. Ajoute ce Redirect URI : https://scalyo-api.stratimaagency.workers.dev/api/oauth/callback/microsoft"
echo "  4. Cree un secret client dans 'Certificats et secrets'"
echo ""
read -p "As-tu un Microsoft Client ID ? (o/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Oo]$ ]]; then
  read -p "MICROSOFT_CLIENT_ID: " MCID
  read -p "MICROSOFT_CLIENT_SECRET: " MCSEC
  echo "$MCID" | npx wrangler secret put MICROSOFT_CLIENT_ID
  echo "$MCSEC" | npx wrangler secret put MICROSOFT_CLIENT_SECRET
  echo "Secrets Microsoft configures"
else
  echo "Microsoft OAuth ignore (Outlook ne fonctionnera pas en OAuth)"
fi
echo ""

# ─── Etape 3 : Deployer le backend ──────────────────────────
echo "Etape 3/4 : Deploiement du backend Worker..."
npx wrangler deploy
echo "Backend deploye"
echo ""

# ─── Etape 4 : Deployer le frontend ─────────────────────────
echo "Etape 4/4 : Build et deploiement du frontend..."
cd ../frontend
npm run build
npx wrangler pages deploy dist --project-name=scalyo
echo "Frontend deploye"
echo ""

echo "=== Deploiement termine ! ==="
echo ""
echo "Integrations disponibles SANS config OAuth :"
echo "  Slack, Teams, HubSpot, Pipedrive, Salesforce"
echo "  Intercom, WhatsApp, Zendesk, Jira, Asana, Notion"
echo "  Zoom, Calendly, Import CSV/Excel"
echo ""
echo "Integrations necessitant OAuth (si configure ci-dessus) :"
echo "  Gmail, Outlook, Google Meet"
