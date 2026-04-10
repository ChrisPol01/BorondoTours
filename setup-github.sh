#!/usr/bin/env bash
# ============================================================
# BorondoTours — Script de inicialización del repositorio GitHub
# Ejecutar desde la raíz del proyecto (donde está este archivo)
# ============================================================

set -e  # Detener en caso de error

# ─── Colores ────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No color

echo -e "${BLUE}🌎 BorondoTours — Inicialización del repositorio GitHub${NC}"
echo "============================================================"

# ─── Variables — EDITAR ANTES DE EJECUTAR ───────────────────
GITHUB_USER="ChrisPol01"       # ← Cambiar por tu usuario
REPO_NAME="BorondoTours"
REPO_DESCRIPTION="Marketplace gestionado de turismo B2C para Colombia"
REPO_VISIBILITY="private"               # "private" o "public"

# ─── 1. Inicializar git ─────────────────────────────────────
echo -e "\n${YELLOW}[1/6] Inicializando git...${NC}"
git init
git config core.autocrlf input    # Manejo de line endings

# ─── 2. Mover docs del vault a /docs ────────────────────────
echo -e "\n${YELLOW}[2/6] Organizando documentación en /docs...${NC}"
mkdir -p docs
# Solo mover si no estamos ya en el contexto del vault
# Si el vault ES el repo, los archivos ya están en su lugar
echo "  ✓ Estructura de docs lista"

# ─── 3. Primer commit ────────────────────────────────────────
echo -e "\n${YELLOW}[3/6] Creando primer commit...${NC}"
git add .gitignore .env.example README.md .github/ docs/ 2>/dev/null || true
git add 00-Inicio/ 01-Specs/ 02-ADRs/ 03-Knowledge/ 05-Dev-Log/ Templates/ 2>/dev/null || true

git commit -m "chore: initial project setup

- Add README.md con arquitectura completa del sistema
- Add .gitignore para monorepo NestJS/React/Expo
- Add .env.example con todas las variables requeridas
- Add .github/ con PR template, issue templates y CI workflow
- Add vault de documentación (specs, ADRs, stack, flujos de APP 1-4)

Stack: NestJS 11 + Bun | React 19 + Vite 6 | React Native + Expo
DB: PostgreSQL 16 + PostGIS | DynamoDB | Redis + BullMQ
Auth: JWT RS256 + Google OAuth2 + OTP
Pagos: Bold API (Colombia)"

# ─── 4. Crear ramas base ─────────────────────────────────────
echo -e "\n${YELLOW}[4/6] Creando estructura de ramas...${NC}"
git branch -M main
git checkout -b develop
git checkout -b staging
git checkout main

echo "  ✓ Ramas creadas: main, staging, develop"

# ─── 5. Crear repositorio en GitHub ──────────────────────────
echo -e "\n${YELLOW}[5/6] Creando repositorio en GitHub...${NC}"

# Opción A: usando GitHub CLI (recomendado)
if command -v gh &> /dev/null; then
  gh repo create "${REPO_NAME}" \
    --${REPO_VISIBILITY} \
    --description "${REPO_DESCRIPTION}" \
    --source=. \
    --remote=origin \
    --push
  echo "  ✓ Repositorio creado con GitHub CLI"

# Opción B: usando git + URL manual
else
  echo -e "  ${YELLOW}⚠️  GitHub CLI no encontrado. Crea el repositorio manualmente:${NC}"
  echo "  1. Ve a https://github.com/new"
  echo "  2. Nombre: ${REPO_NAME}"
  echo "  3. Descripción: ${REPO_DESCRIPTION}"
  echo "  4. Visibilidad: ${REPO_VISIBILITY}"
  echo "  5. NO inicializar con README ni .gitignore"
  echo ""
  echo "  Luego ejecuta:"
  echo "    git remote add origin https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
  echo "    git push -u origin main"
  echo "    git push origin develop"
  echo "    git push origin staging"
fi

# ─── 6. Push de todas las ramas ──────────────────────────────
echo -e "\n${YELLOW}[6/6] Haciendo push de ramas...${NC}"
if command -v gh &> /dev/null; then
  git checkout develop && git push -u origin develop
  git checkout staging && git push -u origin staging
  git checkout main
  echo "  ✓ Ramas main, staging y develop pusheadas"
fi

# ─── Instrucciones finales ───────────────────────────────────
echo ""
echo -e "${GREEN}✅ Repositorio listo en: https://github.com/${GITHUB_USER}/${REPO_NAME}${NC}"
echo ""
echo -e "${BLUE}Próximos pasos en GitHub:${NC}"
echo "  1. Settings → Branches → Add rule para 'main':"
echo "     ✓ Require pull request reviews"
echo "     ✓ Require status checks (CI workflow)"
echo "     ✓ Restrict pushes"
echo ""
echo "  2. Settings → Branches → Add rule para 'staging':"
echo "     ✓ Require status checks (CI workflow)"
echo ""
echo "  3. Settings → Secrets → Actions → Agregar:"
echo "     - DATABASE_URL, REDIS_URL (para CI)"
echo "     - STAGING_API_URL, MAPBOX_TOKEN (para deploy)"
echo ""
echo "  4. Settings → Environments → Crear 'staging' y 'production'"
echo ""
echo -e "${BLUE}Para empezar a desarrollar:${NC}"
echo "  git checkout develop"
echo "  git checkout -b feature/tu-feature"
