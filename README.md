# Java Coach

Upload your CV (PDF) and an AI coach summarises your Java skills, finds the gaps and proposes a
learning path. This repo is also teaching material: start with the in-app docs at `/docs`
(sources in `docs/guide/`).

- **Frontend** (`src/`): React, TypeScript, Vite, shadcn/ui + Tailwind, TanStack Query, Zustand.
  Organised by feature, bulletproof-react style.
- **Backend** (`server/`): Express MVC, SQLite (better-sqlite3), Codex as the AI (no API key).
- **API**: `docs/api-contract.md`.

```bash
pnpm install
cp .env.example .env      # mock mode: the browser answers the API, no server or Codex needed
pnpm dev                  # web on http://localhost:5173, server on :3001
pnpm check                # lint + typecheck + tests
```

For the real coach: `pnpm exec codex login` once, set `VITE_ENABLE_API_MOCKING=false` in `.env`
and restart `pnpm dev`.
