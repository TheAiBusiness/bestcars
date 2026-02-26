#!/usr/bin/env bash
# Solo túneles Cloudflare. Arranca antes backend, web y panel en 3 terminales.
# Uso: ./run-tunnels-cloudflare.sh

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$ROOT/.qa-tmp"
F1o="$ROOT/.qa-tmp/c1o.txt"; F1e="$ROOT/.qa-tmp/c1e.txt"
F2o="$ROOT/.qa-tmp/c2o.txt"; F2e="$ROOT/.qa-tmp/c2e.txt"
F3o="$ROOT/.qa-tmp/c3o.txt"; F3e="$ROOT/.qa-tmp/c3e.txt"

command -v cloudflared &>/dev/null || { echo "Instala cloudflared: winget install Cloudflare.cloudflared"; exit 1; }

echo "Iniciando 3 túneles Cloudflare..."
cloudflared tunnel --url http://localhost:3001 > "$F1o" 2> "$F1e" &
cloudflared tunnel --url http://localhost:5173 > "$F2o" 2> "$F2e" &
cloudflared tunnel --url http://localhost:5174 > "$F3o" 2> "$F3e" &
sleep 11

url() { cat "$1" "$2" 2>/dev/null | grep -oE 'https://[^[:space:])\]]+\.trycloudflare\.com' | head -1; }
API=$(url "$F1o" "$F1e"); WEB=$(url "$F2o" "$F2e"); PANEL=$(url "$F3o" "$F3e")

echo ""
echo "--- URLs QA ---"
echo "Web:   $WEB"
echo "Panel: $PANEL  (admin / admin)"
echo "API:   $API"
echo ""
printf "Web:   %s\nPanel: %s  (admin/admin)\nAPI:   %s\n" "$WEB" "$PANEL" "$API" > "$ROOT/URLS_QA_ACTUAL.txt"
echo "Guardado en: URLS_QA_ACTUAL.txt"
echo "No cierres esta ventana."
wait
