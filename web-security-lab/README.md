# Web Security Testing Lab (Local-Only)

A portfolio project: a **safe, isolated lab** to practice web security testing techniques and document findings responsibly.

This lab is designed for **local learning only**:
- Runs intentionally vulnerable training apps in Docker
- Binds services to `127.0.0.1` (localhost) by default
- Includes templates for writing professional security test reports

## Ethics & scope
- Only test systems you **own** or have **explicit permission** to test.
- Do **not** expose these lab services to the public internet.
- See [docs/ETHICAL_USE.md](docs/ETHICAL_USE.md).

## What’s included
- **Your Portfolio (Target)** (containerized from this repo)
- **Secure Reference App** (non-vulnerable demo of mitigations: CSP, CSRF, validation)
- **OWASP ZAP baseline scan** (automated report generation)

## Prerequisites
- Windows 10/11
- Docker Desktop (with WSL 2 backend recommended)

## Quick start
1. From this folder:
   - Start the portfolio target: `./scripts/start-portfolio-target.ps1`
   - Run an automated scan: `./scripts/zap-scan-portfolio.ps1`
2. Open:
   - Portfolio target: http://127.0.0.1:5000
   - Secure Reference App: http://127.0.0.1:4000
3. Stop:
   - `docker compose down`

PowerShell helpers:
- `./scripts/start-lab.ps1`
- `./scripts/stop-lab.ps1`

## Architecture
- See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Lab modules (portfolio-friendly)
- See [docs/LABS.md](docs/LABS.md)

## Portfolio vulnerability tracking
- See [docs/PORTFOLIO_VULN_TRACKING.md](docs/PORTFOLIO_VULN_TRACKING.md)

## Reporting
Use the included report template:
- [reports/templates/SECURITY_TEST_REPORT.md](reports/templates/SECURITY_TEST_REPORT.md)

## Notes for portfolio presentation
If you later publish a demo/video:
- Record locally and share a **video walkthrough** instead of hosting the vulnerable apps.
- Redact secrets, tokens, and any personal data.
