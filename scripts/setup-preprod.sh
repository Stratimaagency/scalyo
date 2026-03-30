#!/bin/bash
# ==============================================
# SETUP PREPROD — Scalyo
# Lance ce script UNE SEULE FOIS pour créer
# l'environnement de preprod
# ==============================================

set -e

echo "🚀 Setup Scalyo Preprod..."

# 1. Créer la base D1 preprod
echo ""
echo "📦 Création de la base D1 preprod..."
cd "$(dirname "$0")/../workers-backend"

DB_OUTPUT=$(wrangler d1 create scalyo-db-preprod 2>&1)
echo "$DB_OUTPUT"

# Extraire le database_id
DB_ID=$(echo "$DB_OUTPUT" | grep -o 'database_id = "[^"]*"' | head -1 | cut -d'"' -f2)

if [ -z "$DB_ID" ]; then
  echo "⚠️  Impossible d'extraire le database_id automatiquement."
  echo "    Copie le database_id depuis la sortie ci-dessus"
  echo "    et remplace REPLACE_WITH_PREPROD_DB_ID dans wrangler.toml"
else
  echo ""
  echo "✅ Database ID: $DB_ID"
  # Remplacer dans wrangler.toml
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/REPLACE_WITH_PREPROD_DB_ID/$DB_ID/" wrangler.toml
  else
    sed -i "s/REPLACE_WITH_PREPROD_DB_ID/$DB_ID/" wrangler.toml
  fi
  echo "✅ wrangler.toml mis à jour"
fi

# 2. Lancer toutes les migrations sur la DB preprod
echo ""
echo "📋 Lancement des migrations..."
for f in migrations/*.sql; do
  echo "   ▸ $f"
  wrangler d1 execute scalyo-db-preprod --env preprod --remote --file="$f"
done

echo ""
echo "✅ Migrations terminées"

# 3. Déployer le Worker preprod
echo ""
echo "🔧 Déploiement Worker preprod..."
wrangler deploy --env preprod

echo ""
echo "============================================"
echo "✅ PREPROD PRÊTE !"
echo ""
echo "API:      https://scalyo-api-preprod.stratimaagency.workers.dev"
echo "Frontend: lance 'npm run build:preprod' dans frontend/"
echo "          puis déploie sur Cloudflare Pages (branche preprod)"
echo "============================================"
