$ErrorActionPreference = 'Stop'

Write-Host "Stopping Web Security Testing Lab..."
docker compose down
Write-Host "Done."
