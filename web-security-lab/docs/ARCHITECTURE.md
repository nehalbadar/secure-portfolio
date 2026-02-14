# Lab Architecture

## Goal
Provide a reproducible, low-risk environment for practicing web security testing.

## Components
- **Portfolio target** (container): your portfolio app, built from this repo
- **ZAP scan job** (container): automated baseline scan that generates HTML/JSON reports
- **Secure Reference App** (container): defensive baseline (headers, CSRF pattern, validation)

## Network & exposure model
- Services bind to **localhost only** via Docker port mappings:
  - `127.0.0.1:5000 -> portfolio:5000`
  - `127.0.0.1:4000 -> secureapp:4000`

The ZAP scan job runs inside the Compose network and targets `http://portfolio:5000`.

This is intentional to reduce the chance of accidental exposure on your LAN.

## Threat model (for the lab itself)
- Primary risk: accidental exposure of vulnerable services.
- Controls:
  - bind to `127.0.0.1`
  - run locally on a developer machine
  - clear warning docs

## Extending the lab (safe suggestions)
- Add a private “secure reference app” that demonstrates mitigations (headers, validation, auth, logging).
- Add a report folder per module with screenshots and a short writeup.
