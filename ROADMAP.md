# Roadmap (Feb–Mar 2026)

This repo is your **main portfolio site** and the “hub” for your 3 flagship projects:
1) Secure Portfolio Platform (Full‑Stack)
2) Medical RAG AI Assistant (Data Science / NLP)
3) Web Security Testing Lab (Security / Back‑End)

The goal is to ship **credible demos + case studies** that hiring managers can verify quickly.

---

## North Star

A recruiter should be able to answer in 60 seconds:
- What you build (roles you fit)
- What your best work is (3 flagship projects)
- Proof you can ship (live demos, clean repos, screenshots)

---

## Sprint 0 (Today–Tomorrow): Make it easy to run + trust

**Portfolio (this repo)**
- [ ] Confirm projects load correctly in both modes:
  - Serve via backend (same origin)
  - Serve frontend separately (frontend hits backend at `localhost:5000`)
- [ ] Replace any “too perfect” metrics with either:
  - real measured values, or
  - clearly labeled targets (e.g., `Goal: 98+ Lighthouse`)
- [ ] Add real links:
  - GitHub repo link per project
  - Live demo link (or “Coming soon”) per project

**Definition of done**
- `projects.html` works locally without editing code.
- Every project card has GitHub + Demo link working (or explicitly “Coming soon”).

---

## Sprint 1 (Week 1): Finish Portfolio as a product

**High‑impact tasks**
- [ ] Homepage: one-sentence positioning statement (what you build + focus)
- [ ] Add “Featured projects” section on `index.html` (top 3)
- [ ] Add screenshots folder + start with at least 1 screenshot per project
- [ ] Add “Now building” section (1–3 bullets)

**Definition of done**
- Homepage sells you in <10 seconds.
- Each flagship project has at least 1 real screenshot.

---

## Sprint 2 (Week 2): Medical RAG AI Assistant (MVP demo)

**MVP scope (keep it small but real)**
- [ ] Small corpus (10–30 PDFs or docs) + ingestion pipeline
- [ ] Retrieval + citations (show which chunks were used)
- [ ] Basic eval: 20–50 test questions + pass/fail notes
- [ ] Clear disclaimer: not medical advice

**Demo options**
- Streamlit Community Cloud (fastest)
- Docker container (good for reproducibility)

**Definition of done**
- Live demo link works.
- Repo has a clean README with “Run locally in 3 steps”.
- Your portfolio case study links to the demo + repo.

---

## Sprint 3 (Week 3): Web Security Testing Lab (safe + impressive)

**MVP scope**
- [x] Docker Compose lab with isolation (default to localhost only) — see `web-security-lab/`
- [ ] 3 modules, each with vulnerable + fixed version:
  - SQLi
  - XSS
  - CSRF
- [ ] Guided writeups: how to exploit + how to fix

**Definition of done**
- Anyone can run with `docker compose up`.
- Each module has a short walkthrough + mitigation notes.
- Clear ethical-use warning.

---

## Weekly routine (stops you from getting stuck)

- Monday: pick 1 project goal + define “done” for the week
- Tue–Thu: implement + screenshot + update README
- Friday: deploy demo + update portfolio links
- Saturday: write 1 short blog post or doc page about what you built

---

## Hiring‑manager checklist (use this to decide “what next”)

Each flagship project should have:
- A working demo link (or video)
- A README that explains the value + how to run
- At least 3 screenshots
- 3–5 bullet “What I did” + “What I learned”
- One measurable metric (even if small and honest)
