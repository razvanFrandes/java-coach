# Overview

Java Coach reads a developer's CV and tells them where they stand in Java:

1. **Upload**: you drop your CV (a PDF). The browser pulls the text out of it.
2. **Analyse**: the text goes to our Node server, which asks **Codex** (an AI agent) to assess
   it, then turns the answer into levels, gaps and an ordered learning path.
3. **Read the results**: a profile with a level per skill area, the gaps with reasons, a
   learning path you can tick off, and a dashboard that sums it all up.

This guide explains how the code is organised, so you can find your way around and add to it.

## Two programs, one repo

| Folder    | What it is                                    | Runs on                  |
| --------- | --------------------------------------------- | ------------------------ |
| `src/`    | The React app (Vite, TypeScript, shadcn/ui)   | the browser, port 5173   |
| `server/` | The Express server (SQLite, Codex)            | Node, port 3001          |

They only talk over HTTP, through one endpoint described in `docs/api-contract.md`.
Neither imports code from the other.

Both are organised as **MVC**:

- **Model**: the data and how to get it. On the server: SQLite queries and the rules that
  build a report. In the browser: the API calls and the stores.
- **View**: what the user sees. React components.
- **Controller**: the glue that reacts to the user. Express controllers on the server,
  custom hooks in the browser.

[Project structure](/docs/project-structure) shows exactly which folder is which.

## Running it

```bash
pnpm install
cp .env.example .env
pnpm dev            # web on :5173 and server on :3001
```

`.env.example` starts in **mock mode** (`VITE_ENABLE_API_MOCKING=true`): the browser answers the
API itself with a sample report, so you can work on the UI without the server or Codex.

To use the real coach, log in to Codex once and turn mock mode off:

```bash
pnpm exec codex login          # opens the browser, uses your ChatGPT account, no API key
# then set VITE_ENABLE_API_MOCKING=false in .env and restart pnpm dev
```

## The pages of this guide

1. **Overview**: this page.
2. [Project structure](/docs/project-structure): where every kind of code goes.
3. [Data flow](/docs/data-flow): one upload, from the drop to the dashboard.
4. [State](/docs/state): server state, client state and local state.
5. [Backend](/docs/backend): the Express server, Codex and SQLite.
6. [Testing](/docs/testing): how features are built test-first.
7. [Agent setup](/docs/agent-setup): how Claude Code is configured for this repo.
