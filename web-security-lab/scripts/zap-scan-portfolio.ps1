$ErrorActionPreference = 'Stop'

$labRoot = Split-Path -Parent $PSScriptRoot
Set-Location $labRoot

$outDir = Join-Path $labRoot 'reports\output'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

Write-Host "Starting portfolio target container..."
docker compose up -d --build portfolio

Write-Host "Waiting for target health endpoint..."
for ($i = 1; $i -le 30; $i++) {
  try {
    $resp = Invoke-WebRequest -UseBasicParsing http://127.0.0.1:5000/health -TimeoutSec 3
    if ($resp.StatusCode -eq 200) { break }
  } catch {
    Start-Sleep -Seconds 2
  }
}

Write-Host "Running OWASP ZAP baseline scan against http://portfolio:5000 ..."
Write-Host "Reports will be written to: $outDir"

# Note: ZAP returns non-zero when it finds issues; we still want reports.
try {
  docker compose --profile scan run --rm zapscan
} catch {
  Write-Host "ZAP exited with a non-zero code (this usually means findings were detected)."
}

Write-Host "Done. Open reports/output/zap-portfolio-report.html"
