$ErrorActionPreference = 'Stop'

Write-Host "Starting Web Security Testing Lab (local-only)..."
Write-Host "Tip: optional tools profile: docker compose --profile tools up -d"

docker compose up -d

Write-Host "\nLab is up:" 
Write-Host "- Juice Shop: http://127.0.0.1:3000"
Write-Host "- WebGoat:   http://127.0.0.1:8080"
Write-Host "\nTo stop: ./scripts/stop-lab.ps1"
