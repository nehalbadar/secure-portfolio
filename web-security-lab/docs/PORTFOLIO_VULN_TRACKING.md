# Portfolio Vulnerability Tracking (Automatic)

## Goal
Use this lab to **continuously test your own portfolio project** and generate repeatable reports.

## What is automated?
### 1) DAST (Dynamic scan) with OWASP ZAP baseline
- Runs against the running portfolio web app
- Checks for common issues like:
  - missing security headers
  - cookie flags
  - mixed content / weak TLS assumptions (limited in local HTTP)
  - some reflected issues (basic heuristics)

Output:
- `web-security-lab/reports/output/zap-portfolio-report.html`
- `web-security-lab/reports/output/zap-portfolio-report.json`

### 2) What is NOT fully automated
Many real vulnerabilities require understanding business logic and code paths.
Examples that usually need manual validation:
- authorization flaws (broken access control)
- complex injection paths
- CSRF logic in real flows
- privilege escalation

So: automatic scanning = **signal + baseline**, not a full pentest.

## How to run
1) Start/scan in one step:
- `./scripts/zap-scan-portfolio.ps1`

2) Or start the target only:
- `./scripts/start-portfolio-target.ps1`

URLs:
- Portfolio target: http://127.0.0.1:5000

## Why Docker is used
- Keeps your scan target consistent
- Avoids “works on my machine” differences
- Lets ZAP reach the target via service name `http://portfolio:5000` on the Compose network

---

## Step-by-step: track findings one-by-one

Use this loop for every alert you want to learn + fix.

### Step 1 — Run a scan
- Run: `./scripts/zap-scan-portfolio.ps1`
- Output folder: [reports/output](../reports/output)

### Step 2 — Open the report
- Human-friendly: [reports/output/zap-portfolio-report.html](../reports/output/zap-portfolio-report.html)
- Automation-friendly: [reports/output/zap-portfolio-report.json](../reports/output/zap-portfolio-report.json)

### Step 3 — Pick ONE alert to work on
In the HTML report, choose one alert and write down:
- Alert name
- Risk + Confidence
- Example URL(s) (instances)
- Evidence (usually a header value or snippet)

Tip: Start with “header/config” findings first (CORS, Permissions-Policy, cache headers). They’re easier to fix and teach good habits.

### Step 4 — Reproduce / confirm it yourself
ZAP is a scanner, not the final truth. Confirm the evidence with a direct request.

Example (PowerShell):
- Check a response header:
  - `$r = Invoke-WebRequest -UseBasicParsing http://127.0.0.1:5000/health`
  - `$r.Headers['Content-Security-Policy']`

### Step 5 — Record it (tracking entry)
Add a short entry under “Open items” (template below). Keep it simple and consistent.

### Step 6 — Fix (smallest safe change)
Make one focused change in code/config. Avoid changing multiple things at once.

### Step 7 — Re-scan and verify
- Re-run: `./scripts/zap-scan-portfolio.ps1`
- Verify in the new HTML report:
  - The alert is gone, OR
  - Risk/confidence/instances decreased, OR
  - You have a clear justification why it stays (accepted risk)

### Step 8 — Close the item
Update status to “Fixed” with:
- what changed
- a “verification” note (ZAP report timestamp + alert gone)

---

## Open items

### Cross-Domain Misconfiguration (CORS)
- From ZAP JSON: alert “Cross-Domain Misconfiguration” with evidence `Access-Control-Allow-Origin: *`.
- What it means: your server is telling browsers “any website can read responses from this site”.
- Why it matters: if you ever add cookies/sessions or private endpoints, permissive CORS can help attackers read data.

#### Confirm it (PowerShell)
Run this while the portfolio container is up:
- `$r = Invoke-WebRequest -UseBasicParsing http://127.0.0.1:5000/health -Headers @{ Origin = 'https://example.com' }`
- `$r.Headers['Access-Control-Allow-Origin']`

Expected for the finding: it prints `*`.

#### Where to fix
This behavior is coming from the default `cors()` middleware in [Backend/server.js](../../Backend/server.js).

Safe options (pick one):
- Best for single-origin portfolio: remove `cors()` entirely (same-origin frontend doesn’t need it).
- If you need cross-origin during development: restrict `origin` to an allowlist (only your real frontend origins).

#### Status
- Status: Open
- Fix plan: decide whether you actually need CORS; then remove it or restrict it.
- Verification plan: re-run ZAP and confirm the “Cross-Domain Misconfiguration” alert disappears.
