#!/bin/bash
# Despliega todo o un servicio específico
# Uso: ./scripts/deploy.sh [service-name]
# Ejemplos:
#   ./scripts/deploy.sh          → despliega todo
#   ./scripts/deploy.sh 1-core   → solo el servicio 1-core
#   ./scripts/deploy.sh web      → solo la app web (B2C)

set -e

if [ -z "$1" ]; then
  echo "🚀 Deploying all..."
  pnpm turbo run deploy
else
  echo "🚀 Deploying $1..."
  pnpm --filter "@borondo/service-$1" deploy 2>/dev/null || \
  pnpm --filter "@borondo/$1" deploy
fi
