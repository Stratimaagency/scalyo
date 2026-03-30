#!/bin/bash
# ==============================================
# SETUP PREPROD — Scalyo
# Lance ce script UNE SEULE FOIS pour créer
# l'environnement de preprod
# ==============================================

set -e

echo "🚀 Setup Scalyo Preprod..."

# Aller dans le dossier workers-backend
cd "$(dirname "$0")/../workers-backend"

# Utiliser npx wrangler
WRANGLER="npx wrangler"

# 1. Créer la base D1 preprod
echo ""
echo "📦 Création de la base D1 preprod..."

DB_OUTPUT=$($WRANGLER d1 create scalyo-db-preprod 2>&1) || true
echo "$DB_OUTPUT"

# Extraire le database_id
DB_ID=$(echo "$DB_OUTPUT" | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)

if [ -z "$DB_ID" ]; then
  echo "⚠️  Impossible d'extraire le database_id automatiquement."
  echo "    Copie le database_id depuis la sortie ci-dessus"
  echo "    et remplace REPLACE_WITH_PREPROD_DB_ID dans wrangler.toml"
  echo ""
  read -p "Colle le database_id ici : " DB_ID
fi

if [ -n "$DB_ID" ]; then
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
  $WRANGLER d1 execute scalyo-db-preprod --env preprod --remote --file="$f" || echo "   ⚠️  Erreur sur $f (peut-être déjà appliquée)"
done

echo ""
echo "✅ Migrations terminées"

# 3. Déployer le Worker preprod
echo ""
echo "🔧 Déploiement Worker preprod..."
$WRANGLER deploy --env preprod

echo ""
echo "============================================"
echo "✅ PREPROD PRÊTE !"
echo ""
echo "API:      https://scalyo-api-preprod.stratimaagency.workers.dev"
echo "Frontend: lance 'npm run build:preprod' dans frontend/"
echo "          puis déploie sur Cloudflare Pages (branche preprod)"
echo "============================================"
