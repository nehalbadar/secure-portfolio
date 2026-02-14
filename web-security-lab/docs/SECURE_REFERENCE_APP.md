# Secure Reference App

Location: `web-security-lab/secure-reference-app/`

## Purpose
A small, **non-vulnerable** Node.js app intended to show what “good defaults” look like.
It’s useful for portfolio screenshots and for explaining mitigations side-by-side with the intentionally vulnerable training apps.

## Run
- Via lab compose: `docker compose up -d --build`
- URL: http://127.0.0.1:4000

## What it demonstrates
- **Security headers (Helmet)**
  - CSP with `default-src 'self'`
  - `frame-ancestors 'none'`
  - disables `X-Powered-By`
- **CSRF protection**
  - Double-submit style CSRF token check (httpOnly cookie + hidden form field)
  - Example form at `/comment`
- **Input validation**
  - Server-side validation using `zod`
  - Example endpoint: `/api/profile?id=1`
- **Rate limiting**
  - Conservative per-IP request limits for demo purposes
- **Safe output handling**
  - Templates rely on EJS escaping for reflected content

## Screenshot ideas (for your portfolio)
- DevTools → Network → Response Headers showing CSP/other headers
- The `/comment` form showing hidden CSRF token field
- A 400 validation response from `/api/profile` when `id` is invalid

## Notes
This app is intentionally simple, and avoids including exploit steps or payloads.
Focus is on defensive patterns you can reuse in real projects.
