# Overview

Java Coach is a small learning dashboard. You upload your CV as a PDF, an AI coach reads it and
you get back:

- a **profile**: a summary of your Java experience and a level for each of nine skill areas
  (core language, OOP, collections, concurrency, JVM, Spring, testing, build tools, databases),
- a list of **gaps**: areas that are missing or weak, each with a reason taken from your CV,
- a **learning path**: ordered steps with a goal, topics, an exercise and an effort estimate,
  which you tick off as you go,
- a **dashboard** that puts all of this on one screen.

This repository is also teaching material. Every rule in it is there for a reason, and these
pages explain those reasons using the real code.

## Run it

You need Node.js 22.13 or newer and pnpm.

```bash
pnpm install
cp .env.example .env
pnpm dev
```

`pnpm dev` starts two programs:

| Program | URL | What it is |
| --- | --- | --- |
| Web app | http://localhost:5173 | React + Vite. This is what you open in the browser. |
| Server | http://localhost:3001 | Node + Express. It asks Codex and stores results in SQLite. |

By default `.env` says `VITE_COACH_MODE=mock`. In mock mode the web app uses a fake coach that
lives in the browser, so **you do not need the server or any AI to try the app**. Download the
sample CV from the dashboard and upload it.

### Using the real AI coach (Codex)

The real coach is [Codex](https://github.com/openai/codex), OpenAI's coding agent, driven from
the Node server through the Codex SDK. It uses your ChatGPT login, so there is no API key to manage.

```bash
pnpm exec codex login     # once: opens the browser to sign in
pnpm codex:try            # sends public/sample-cv.pdf to Codex and prints the report
```

Then set `VITE_COACH_MODE=http` in `.env` and run `pnpm dev` again. Now the web app sends the
CV text to the server, which asks Codex. The first analysis of a CV takes up to a minute; the
same CV a second time comes straight from the SQLite database (`data/java-coach.db`).

## Run the tests

| Command | What it does |
| --- | --- |
| `pnpm test` | Runs every test once (web and server). |
| `pnpm test:watch` | Re-runs tests when files change. Leave it open while you work. |
| `pnpm test -- src/domain` | Runs only the tests in one folder. |
| `pnpm test:coverage` | Runs tests and fails if `src/domain` is not 100% covered. |
| `pnpm lint` / `pnpm typecheck` | ESLint and the TypeScript compiler. |
| `pnpm check` | Lint, typecheck and tests together. Run it before every commit. |

No test talks to a real AI or a real network: the coach is replaced by fakes, and HTTP calls
are answered by MSW (Mock Service Worker).

## A tour of the screens

| Route | Page | Built from |
| --- | --- | --- |
| `/` | Dashboard | `src/features/dashboard` |
| `/upload` | Upload your CV | `src/features/upload` |
| `/profile` | Your Java profile | `src/features/profile` |
| `/gaps` | Gaps to work on | `src/features/gaps` |
| `/path` | Your learning path | `src/features/learning-path` |
| `/docs` | These pages | `src/features/docs`, content in `docs/guide/` |

## Reading order

1. Start with [the architecture page](/docs/architecture): where code lives and why.
2. [Data flow](/docs/data-flow) follows one CV through every file it touches.
3. [State](/docs/state) explains where data is kept.
4. [SOLID in this codebase](/docs/solid) and [Testing](/docs/testing) show the principles we
   apply, with real snippets.
5. [Agent setup](/docs/agent-setup) explains how Claude Code is configured for this repo.

The acceptance criteria for every feature are in `docs/specs/`, and the HTTP contract for the
backend is in `docs/api-contract.md`.
