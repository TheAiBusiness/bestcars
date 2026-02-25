# Build de todos los proyectos para deploy
# Ejecutar desde la raíz: .\build-all.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "=== Build Backend (Bestcars_Back_DEF) ===" -ForegroundColor Cyan
Set-Location "$root\Bestcars_Back_DEF"
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n=== Build Backend alternativo (BestCars_Back-updated) ===" -ForegroundColor Cyan
Set-Location "$root\BestCars_Back-updated"
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n=== Build Página web (Bestcars_front_DEF) ===" -ForegroundColor Cyan
Set-Location "$root\Bestcars_front_DEF"
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n=== Build Panel (BestCars_Panel) ===" -ForegroundColor Cyan
Set-Location "$root\BestCars_Panel"
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Set-Location $root
Write-Host "`n=== Todos los builds completados ===" -ForegroundColor Green
Write-Host "Backend:    Bestcars_Back_DEF\dist  +  BestCars_Back-updated (node)"
Write-Host "Web:        Bestcars_front_DEF\dist"
Write-Host "Panel:      BestCars_Panel\dist"
Write-Host "`nVer DEPLOY.md para pasos de despliegue."
