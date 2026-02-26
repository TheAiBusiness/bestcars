# Túneles Cloudflare (cloudflared) para exponer backend, web y panel en local
# Ejecutar desde la raíz: .\run-tunnels-cloudflare.ps1
#
# Requisitos:
#   1. Backend, web y panel ya corriendo en local (puertos 3001, 5173, 5174)
#   2. cloudflared instalado: winget install Cloudflare.cloudflared
#      o descarga: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
#
# Uso: .\run-tunnels-cloudflare.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

# Comprobar si cloudflared está en PATH
$cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cloudflared) {
    Write-Host "cloudflared no encontrado." -ForegroundColor Red
    Write-Host "Instala con: winget install Cloudflare.cloudflared" -ForegroundColor Yellow
    Write-Host "O descarga: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Asegurate de tener ya en marcha:" -ForegroundColor Cyan
Write-Host "  Backend: http://localhost:3001  (cd Bestcars_Back_DEF; npm run dev)" -ForegroundColor White
Write-Host "  Web:     http://localhost:5173 (cd Bestcars_front_DEF; npm run dev)" -ForegroundColor White
Write-Host "  Panel:   http://localhost:5174 (cd BestCars_Panel; npm run dev)" -ForegroundColor White
Write-Host ""
Write-Host "Iniciando 3 túneles Cloudflare (quick tunnels)..." -ForegroundColor Cyan
Write-Host "Cada ventana mostrara la URL publica (ej: https://xxx.trycloudflare.com)" -ForegroundColor Gray
Write-Host ""

$ports = @(
    @{ Port = 3001; Name = "Backend (API)" },
    @{ Port = 5173; Name = "Web" },
    @{ Port = 5174; Name = "Panel" }
)

foreach ($p in $ports) {
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Write-Host '=== Tunel Cloudflare: $($p.Name) - puerto $($p.Port) ===' -ForegroundColor Green; Write-Host 'Anota la URL que aparezca abajo (https://...trycloudflare.com)' -ForegroundColor Yellow; Write-Host ''; cloudflared tunnel --url http://localhost:$($p.Port)"
    )
    Start-Sleep -Seconds 2
}

Write-Host "Se han abierto 3 ventanas con un tunel cada una." -ForegroundColor Green
Write-Host ""
Write-Host "En cada ventana aparecera una URL publica. Anotalas:" -ForegroundColor Yellow
Write-Host "  - URL Backend -> usala como VITE_API_URL si quieres que web/panel llamen al API por tunel" -ForegroundColor White
Write-Host "  - URL Web y URL Panel -> ponlas en CORS_ORIGINS del backend (Bestcars_Back_DEF\.env) y reinicia el backend" -ForegroundColor White
Write-Host ""
Write-Host "Documentacion: TUNELES_CLOUDFLARE.md" -ForegroundColor Cyan
