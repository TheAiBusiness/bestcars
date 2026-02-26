#!/usr/bin/env bash
# Arranca backend, web, panel y túneles Cloudflare para QA (abrir desde otro PC)
# Uso en Git Bash (Windows): ./run-qa.sh   o   bash run-qa.sh

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# Carpeta temporal en el proyecto (compatible Git Bash / Windows)
QA_TMP="$ROOT/.qa-tmp"
mkdir -p "$QA_TMP"
F1o="$QA_TMP/cf1out.txt"; F1e="$QA_TMP/cf1err.txt"
F2o="$QA_TMP/cf2out.txt"; F2e="$QA_TMP/cf2err.txt"
F3o="$QA_TMP/cf3out.txt"; F3e="$QA_TMP/cf3err.txt"

echo "=== Best Cars - Entorno QA ==="
echo ""

# 1. Backend
echo "[1/4] Iniciando backend (puerto 3001)..."
(cd "$ROOT/Bestcars_Back_DEF" && npm run dev) >> "$ROOT/backend.log" 2>&1 &
BACKEND_PID=$!
sleep 5

# 2. Web
echo "[2/4] Iniciando web (puerto 5173)..."
(cd "$ROOT/Bestcars_front_DEF" && npm run dev) >> "$ROOT/web.log" 2>&1 &
WEB_PID=$!
sleep 4

# 3. Panel
echo "[3/4] Iniciando panel (puerto 5174)..."
(cd "$ROOT/BestCars_Panel" && npm run dev) >> "$ROOT/panel.log" 2>&1 &
PANEL_PID=$!
sleep 6

# 4. Túneles Cloudflare
echo "[4/4] Iniciando túneles Cloudflare..."
if ! command -v cloudflared &>/dev/null; then
  echo "ERROR: cloudflared no instalado. En Windows: winget install Cloudflare.cloudflared"
  exit 1
fi

cloudflared tunnel --url http://localhost:3001 > "$F1o" 2> "$F1e" &
T1_PID=$!
cloudflared tunnel --url http://localhost:5173 > "$F2o" 2> "$F2e" &
T2_PID=$!
cloudflared tunnel --url http://localhost:5174 > "$F3o" 2> "$F3e" &
T3_PID=$!

sleep 12

extract_url() {
  cat "$1" "$2" 2>/dev/null | grep -oE 'https://[^[:space:])\]]+\.trycloudflare\.com' | head -1
}

BACKEND_URL=$(extract_url "$F1o" "$F1e")
WEB_URL=$(extract_url "$F2o" "$F2e")
PANEL_URL=$(extract_url "$F3o" "$F3e")

# Guardar URLs en archivo
cat > "$ROOT/URLS_QA_ACTUAL.txt" << EOF
URLs QA - $(date '+%Y-%m-%d %H:%M')

Web:   $WEB_URL
Panel: $PANEL_URL  (admin / admin)
API:   $BACKEND_URL
EOF

echo ""
echo "=============================================="
echo "  URLs PARA QA (abrir desde otro PC)"
echo "=============================================="
echo ""
echo "  Web:    $WEB_URL"
echo "  Panel:  $PANEL_URL"
echo "          usuario: admin   contraseña: admin"
echo "  API:    $BACKEND_URL"
echo ""
echo "=============================================="
echo "  URLs guardadas en: URLS_QA_ACTUAL.txt"
echo "  No cierres esta ventana. Para parar todo:"
echo "  kill $BACKEND_PID $WEB_PID $PANEL_PID $T1_PID $T2_PID $T3_PID"
echo "=============================================="
echo ""

# Mantener vivo; Ctrl+C para parar
wait $BACKEND_PID 2>/dev/null || true
