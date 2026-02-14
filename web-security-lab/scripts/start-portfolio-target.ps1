$ErrorActionPreference = 'Stop'

$labRoot = Split-Path -Parent $PSScriptRoot
Set-Location $labRoot

Write-Host "Starting portfolio target (local-only)..."
docker compose up -d --build portfolio
Write-Host "Portfolio target is available at: http://127.0.0.1:5000"
