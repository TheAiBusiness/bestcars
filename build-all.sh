#!/usr/bin/env bash
# Build de todos los proyectos para deploy
# Ejecutar desde la raíz: chmod +x build-all.sh && ./build-all.sh

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "=== Build Backend (Bestcars_Back_DEF) ==="
cd Bestcars_Back_DEF && npm run build && cd "$ROOT"

echo "=== Build Backend alternativo (BestCars_Back-updated) ==="
cd BestCars_Back-updated && npm run build && cd "$ROOT"

echo "=== Build Página web (Bestcars_front_DEF) ==="
cd Bestcars_front_DEF && npm run build && cd "$ROOT"

echo "=== Build Panel (BestCars_Panel) ==="
cd BestCars_Panel && npm run build && cd "$ROOT"

echo ""
echo "=== Todos los builds completados ==="
echo "Backend:    Bestcars_Back_DEF/dist  +  BestCars_Back-updated"
echo "Web:        Bestcars_front_DEF/dist"
echo "Panel:      BestCars_Panel/dist"
echo "Ver DEPLOY.md para pasos de despliegue."
