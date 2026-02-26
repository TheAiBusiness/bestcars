# Arranca backend, web, panel y tuneles Cloudflare para QA (abrir desde otro PC)
# Uso: .\run-qa.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "=== Best Cars - Entorno QA ===" -ForegroundColor Cyan
Write-Host ""

# 1. Backend
Write-Host "[1/4] Iniciando backend (puerto 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\Bestcars_Back_DEF'; npm run dev" -WindowStyle Minimized
Start-Sleep -Seconds 5

# 2. Web
Write-Host "[2/4] Iniciando web (puerto 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\Bestcars_front_DEF'; npm run dev" -WindowStyle Minimized
Start-Sleep -Seconds 4

# 3. Panel
Write-Host "[3/4] Iniciando panel (puerto 5174)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\BestCars_Panel'; npm run dev" -WindowStyle Minimized
Start-Sleep -Seconds 6

# Comprobar que los puertos estan en uso
$ports = @(3001, 5173, 5174)
foreach ($p in $ports) {
    $listening = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
    if (-not $listening) { Write-Host "Aviso: puerto $p aun no escucha. Esperando..." -ForegroundColor Yellow; Start-Sleep -Seconds 3 }
}

# 4. Tuneles Cloudflare
Write-Host "[4/4] Iniciando tuneles Cloudflare..." -ForegroundColor Yellow
if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: cloudflared no instalado. winget install Cloudflare.cloudflared" -ForegroundColor Red
    exit 1
}

$t1o = "$env:TEMP\cf1out.txt"; $t1e = "$env:TEMP\cf1err.txt"
$t2o = "$env:TEMP\cf2out.txt"; $t2e = "$env:TEMP\cf2err.txt"
$t3o = "$env:TEMP\cf3out.txt"; $t3e = "$env:TEMP\cf3err.txt"

Start-Process -FilePath "cloudflared" -ArgumentList "tunnel","--url","http://localhost:3001" -RedirectStandardOutput $t1o -RedirectStandardError $t1e -WindowStyle Hidden
Start-Process -FilePath "cloudflared" -ArgumentList "tunnel","--url","http://localhost:5173" -RedirectStandardOutput $t2o -RedirectStandardError $t2e -WindowStyle Hidden
Start-Process -FilePath "cloudflared" -ArgumentList "tunnel","--url","http://localhost:5174" -RedirectStandardOutput $t3o -RedirectStandardError $t3e -WindowStyle Hidden

Start-Sleep -Seconds 12

function Get-TunnelUrl($out, $err) {
    $raw = (Get-Content $out -Raw -ErrorAction SilentlyContinue) + (Get-Content $err -Raw -ErrorAction SilentlyContinue)
    if ($raw -match 'https://[^\s\)"\]]+\.trycloudflare\.com') { $Matches[0].Trim() } else { "(no detectada)" }
}

$backendUrl = Get-TunnelUrl $t1o $t1e
$webUrl    = Get-TunnelUrl $t2o $t2e
$panelUrl  = Get-TunnelUrl $t3o $t3e

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  URLs PARA QA (abrir desde otro PC)" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Web:    $webUrl"
Write-Host "  Panel:  $panelUrl"
Write-Host "          usuario: admin   password: admin"
Write-Host "  API:    $backendUrl"
Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  Backend, web y panel siguen en segundo plano."
Write-Host "  Para parar: cierra esta ventana o detén los procesos Node/cloudflared."
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""

# Escribir URLs en archivo para copiar/pegar
@"
URLs QA - $(Get-Date -Format 'yyyy-MM-dd HH:mm')

Web:   $webUrl
Panel: $panelUrl  (admin / admin)
API:   $backendUrl
"@ | Set-Content "$root\URLS_QA_ACTUAL.txt" -Encoding UTF8
Write-Host "  URLs guardadas en: URLS_QA_ACTUAL.txt" -ForegroundColor Gray
Write-Host ""
