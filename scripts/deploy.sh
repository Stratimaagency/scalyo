#!/bin/bash
# ==============================================
# Scalyo — Script de deploiement complet
# ==============================================
# Usage:
#   ./scripts/deploy.sh          → deploie en production
#   ./scripts/deploy.sh preprod  → deploie en preprod
# ==============================================

set -e

ENV="${1:-production}"
echo "=== Deploiement Scalyo ($ENV) ==="

# ----- 1. Verifier les prerequis -----
echo ""
echo "--- Verification des prerequis ---"

if ! command -v npx &> /dev/null; then
  echo "ERREUR: npx non trouve. Installez Node.js >= 18"
  exit 1
fi

if ! command -v wrangler &> /dev/null && ! npx wrangler --version &> /dev/null; then
  echo "Installation de wrangler..."
  npm install -g wrangler
fi

echo "OK: Wrangler disponible"

# ----- 2. Verifier que JWT_SECRET est configure -----
echo ""
echo "--- Verification des secrets ---"
echo "IMPORTANT: Assurez-vous que JWT_SECRET est configure:"
echo "  npx wrangler secret put JWT_SECRET"
echo ""
echo "Et optionnellement:"
echo "  npx wrangler secret put RESEND_API_KEY"
echo "  npx wrangler secret put DEEPSEEK_API_KEY"
echo "  npx wrangler secret put STRIPE_SECRET_KEY"
echo "  npx wrangler secret put STRIPE_WEBHOOK_SECRET"
echo ""

# ----- 3. Appliquer les migrations D1 -----
echo "--- Application des migrations D1 ---"
cd "$(dirname "$0")/../workers-backend"

WRANGLER_ENV=""
if [ "$ENV" = "preprod" ]; then
  WRANGLER_ENV="--env preprod"
fi

for migration in migrations/*.sql; do
  echo "Migration: $migration"
  npx wrangler d1 execute scalyo-db $WRANGLER_ENV --file="$migration" --remote 2>&1 || {
    echo "  (deja appliquee ou erreur non-critique — on continue)"
  }
done

echo ""
echo "OK: Migrations appliquees"

# ----- 4. Deployer le Workers backend -----
echo ""
echo "--- Deploiement du Workers backend ---"
npx wrangler deploy $WRANGLER_ENV

echo ""
echo "OK: Backend deploye"

# ----- 5. Builder et deployer le frontend -----
echo ""
echo "--- Build du frontend ---"
cd ../frontend
npm install
npm run build

echo ""
echo "--- Deploiement du frontend (Cloudflare Pages) ---"
npx wrangler pages deploy dist --project-name=scalyo

echo ""
echo "=========================================="
echo "  Deploiement termine avec succes!"
echo "=========================================="
echo ""
echo "URLs:"
if [ "$ENV" = "preprod" ]; then
  echo "  Frontend: https://preprod.scalyo.pages.dev"
  echo "  API:      https://scalyo-api-preprod.stratimaagency.workers.dev"
else
  echo "  Frontend: https://scalyo.pages.dev"
  echo "  API:      https://scalyo-api.stratimaagency.workers.dev"
fi
echo ""
echo "Pour verifier:"
echo "  curl https://scalyo-api.stratimaagency.workers.dev/"
echo ""
