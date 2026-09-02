# Trefelle

A practice space for engineering judgment — a field guide for the moments behind production software (and beyond it) where the brief is incomplete, the trade-offs matter, and the answer has consequences.

Trefelle pairs production-shaped scenarios with an AI mentor you configure yourself, and an adaptive onboarding flow that gets to know how you think before recommending a field and role to practice in.

## Live site

- **Landing:** [`landing.html`](landing.html)
- **Approach:** [`approach.html`](approach.html)
- **How it works:** [`flow.html`](flow.html)
- **Why Trefelle:** [`why.html`](why.html)
- **AI mentor options:** [`requirements.html`](requirements.html)
- **Workspace setup:** [`workspace.html`](workspace.html)

## Running locally

This is a static site with no build step or dependencies.

```bash
npx serve .
```

Then open `http://localhost:3000` (or whatever port `serve` reports). Any static file server works equally well.

## What's here

### Marketing site
A set of static pages introducing Trefelle: the landing page, the design approach, how the practice flow works, why the project exists, and the current options for running the AI mentor. Each page shares a light, editorial design system (Inter + Newsreader + DM Mono, a warm off-white palette) implemented per-page in its own stylesheet, plus a shared `effects.css`/`effects.js` for scroll-triggered reveal animations.

### Workspace setup (`workspace.html` / `workspace.js` / `workspace.css`)
The onboarding flow that runs before someone enters the practice workspace. It's a self-contained, single-question-at-a-time wizard with fade transitions, built around three phases:

1. **AI engine setup** — choose how the mentor runs: bring your own API key (OpenAI, Anthropic, or any OpenAI-compatible endpoint), connect to a local model (Ollama or LM Studio — with live model auto-detection against `/api/tags`), run a small model in-browser via WebLLM, or defer the decision.
2. **Adaptive assessment** — once an AI engine is connected, it runs a live, two-phase interview:
   - **Personality & learning style**, inferred entirely through small interactive exercises rather than direct self-report (drag-to-reorder rankings, two-box sorts, resonance taps, point allocation, and a stealth reaction-time "quickpick" format) framed as closed hypotheticals, never questions about the person's real life.
   - **Field & role fit**, which starts by asking field of interest and career stage directly (the only two questions asked outright, since they're facts rather than traits), then narrows toward a specific sub-field and role with exercises scoped to that field — including lightweight, self-designed verification exercises so a claimed skill level has to hold up rather than being taken at face value.
   
   If no AI engine is connected, or the model's response can't be parsed after a few retries, the flow falls back to an equivalent static question set and a deterministic scoring model so the experience still completes.
3. **Voice and save preferences** — optional microphone setup for talking instead of typing, and whether to remember the configuration in `localStorage` for next time.

All AI calls are made directly from the browser to the configured provider — Trefelle's own code never sees or stores an API key.

## Tech stack

Vanilla HTML/CSS/JS throughout — no framework, no build step, no bundler. AI integration talks to standard provider APIs (OpenAI/Anthropic chat completions, Ollama's native and OpenAI-compatible endpoints) via `fetch`.

## Project structure

```
landing.html / landing*.css       Home page
approach.html                     The Trefelle approach
flow.html / flow.css              How it works
why.html / why.css                Why Trefelle
requirements.html                 AI mentor options & system requirements
workspace.html / .js / .css       Setup wizard + adaptive AI assessment
effects.js / effects.css          Shared scroll-reveal animation system
trefelle-home.css                 Shared design tokens for the marketing pages
app.js / scene.js / styles.css    Workspace mockup + landing particle background
```
