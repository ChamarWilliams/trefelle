# Trefelle: A Practice Space for Engineering Judgment

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

Production-shaped engineering scenarios, paired with an AI mentor you configure yourself. A short profile recommends fields and roles to practice, and the practice tasks run in your browser with real pass or fail tests.

**Live site:** https://trefelle.vercel.app

---

## Architecture Overview

```text
        +-------------------------------------------+
        |  Browser: static pages, setup wizard,      |
        |  practice dashboard, React workspace app   |
        +----------+------------------+-------------+
                   |                  |
         direct fetch (BYOK)          | auth + saved progress
                   v                  v
        +----------------+   +-----------------------+
        |  AI provider   |   |  Supabase (RLS):       |
        |  OpenAI, Claude|   |  workspace_progress,   |
        |  Ollama, WebLLM|   |  mentor_config,        |
        +----------------+   |  scenario_attempts     |
                             +-----------------------+
```

There is no application server. Vercel serves static files and one edge middleware, the browser talks to the model provider directly, and Supabase stores non-secret progress.

---

## Core Engineering Problem Solved

Practice tools that need a model and a code runner usually need a backend, and a backend means holding people's API keys. Trefelle avoids both.

* **Bring your own AI, keep the key:** any OpenAI-compatible endpoint, Anthropic, local models through Ollama or LM Studio, or a small model in the browser through WebLLM. Keys stay in `localStorage` on the user's device. The schema has no key column.
* **Key stack with failover:** entries are tried in order, and the app rotates to the next one on any non-abort failure, so one bad key or wrong model name does not block the rest.
* **Code runs locally:** JavaScript runs in a Web Worker with a timeout, Python through Pyodide, and SQL against an in-memory SQLite database. Each task has real test cases.
* **One-call profiling:** a structured profile goes to a single model call that returns up to six fitting fields, with a manual picker when no model is connected.
* **Row Level Security:** each user can only read and write their own progress and attempts.

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Site** | Vanilla HTML, CSS, JavaScript | Landing, approach, flow, setup wizard, practice dashboard |
| **Workspace app** | React 19, Vite | Task workspace in `workspace-app/` |
| **AI** | Provider APIs via `fetch`, WebLLM | Mentor, profiling, field recommendations |
| **Execution** | Web Workers, Pyodide, in-browser SQLite | Run and grade practice tasks |
| **Auth and data** | Supabase Auth, Postgres with RLS | GitHub sign-in, saved progress |
| **Hosting** | Vercel, edge middleware | Static deploy with clean URLs |

---

## Quickstart

```bash
git clone https://github.com/ChamarWilliams/trefelle.git
cd trefelle
npm install
npx serve .
```

Open the port `serve` reports. The marketing pages and the setup wizard work without any configuration. To run the React workspace app:

```bash
cd workspace-app
npm install
npm run dev
```

### Optional: sign-in and saved progress

1. Create a Supabase project and run `supabase/schema.sql` in the SQL Editor.
2. Enable GitHub as an auth provider and add your site URL plus `/auth/callback` as a redirect.
3. Put your project URL and publishable key in `supabase-client.js`.

---

## Project Structure

```text
index.html, approach.html, flow.html,
why.html, who-we-are.html, requirements.html   Marketing pages
workspace.html, app.js, scene.js               Setup wizard and workspace mockup
practice.html, practice.js, practice.css       In-browser practice dashboard
login.html, auth/callback.html                 Sign-in
ai-client.js                                   Provider calls, key stack, WebLLM
supabase-client.js, supabase/schema.sql        Auth client and database schema
middleware.js, vercel.json                     Edge middleware and redirects
workspace-app/                                 React + Vite workspace
effects.js, effects.css                        Shared scroll-reveal system
```

---

## Privacy

API keys are used only in the browser that holds them. Trefelle's own code and database never receive them. Progress, chosen fields and assessment results save to your account through Supabase, and the page says so before you connect.
