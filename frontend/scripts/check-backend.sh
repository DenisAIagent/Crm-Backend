#!/bin/bash

# Script de vérification pour empêcher l'ajout de code backend
# Usage: ./scripts/check-backend.sh

echo "🔍 Vérification du repository pour code backend..."

ERRORS=0

# Vérifier les fichiers interdits
FORBIDDEN_FILES=(
  "server.js"
  "app.js"
  "passport.js"
  "database.js"
  "db.js"
)

FORBIDDEN_DIRS=(
  "backend"
  "routes"
  "controllers"
  "models"
  "middleware"
)

# Vérifier les fichiers
for file in "${FORBIDDEN_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "❌ ERREUR: Fichier backend interdit trouvé: $file"
    ERRORS=$((ERRORS + 1))
  fi
done

# Vérifier les dossiers
for dir in "${FORBIDDEN_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "❌ ERREUR: Dossier backend interdit trouvé: $dir"
    ERRORS=$((ERRORS + 1))
  fi
done

# Vérifier package.json pour dépendances backend
if [ -f "package.json" ]; then
  FORBIDDEN_PACKAGES=("express" "mongoose" "passport" "passport-jwt" "bcrypt" "nodemailer")
  
  for package in "${FORBIDDEN_PACKAGES[@]}"; do
    if grep -q "\"$package\"" package.json; then
      echo "❌ ERREUR: Dépendance backend interdite trouvée dans package.json: $package"
      ERRORS=$((ERRORS + 1))
    fi
  done
fi

if [ $ERRORS -eq 0 ]; then
  echo "✅ Aucun code backend détecté - Repository propre"
  exit 0
else
  echo ""
  echo "⚠️  $ERRORS erreur(s) trouvée(s)"
  echo "🚫 Ce repository est uniquement frontend - Supprimez le code backend"
  exit 1
fi

