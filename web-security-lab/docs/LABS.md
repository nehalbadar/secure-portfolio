# Lab Modules (OWASP Top 10 aligned)

These modules are designed to be portfolio-friendly: each includes a learning goal, what to observe, and how to validate mitigations.

## Module 1 — Injection (SQLi concept)
**Goal:** Understand how unsafe query construction can lead to unauthorized data access.

**Practice using:** Juice Shop / WebGoat lessons

**What to document:**
- Where user input reaches a query
- What server-side controls prevent injection (parameterized queries, ORM safe APIs)
- Evidence the fix works (same test now fails / returns safe error)

## Module 2 — XSS (reflected/stored/DOM)
**Goal:** Understand how untrusted input can become executable in the browser.

**Practice using:** Juice Shop / WebGoat lessons

**What to document:**
- The sink (where the DOM is updated)
- The controls: output encoding, template auto-escaping, sanitization, CSP
- Verification: payload is treated as text; CSP blocks inline execution

## Module 3 — CSRF
**Goal:** Understand cross-site request forgery and why “being logged in” isn’t enough.

**Practice using:** WebGoat lessons

**What to document:**
- What the forged request looks like (high-level)
- Mitigations: CSRF tokens, SameSite cookies, origin checks
- Verification: request fails without token / wrong origin

## Suggested portfolio deliverables
- 1-page report per module using [reports/templates/SECURITY_TEST_REPORT.md](../reports/templates/SECURITY_TEST_REPORT.md)
- Screenshots: request/response (sanitized), headers, and mitigation evidence
- A short architecture diagram showing isolation and localhost binding

## Secure reference app (defensive baseline)
Use the secure baseline app for “this is what good looks like” screenshots:
- See [SECURE_REFERENCE_APP.md](SECURE_REFERENCE_APP.md)
