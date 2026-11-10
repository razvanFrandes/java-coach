# Java Coach

Upload your CV (PDF) and an AI coach summarises your Java skills, finds the gaps and proposes a
learning path. This repo is also teaching material: start with the in-app docs at `/docs`
(sources in `docs/guide/`).

```bash
pnpm install
cp .env.example .env      # VITE_COACH_MODE=mock works without any backend
pnpm dev                  # web on http://localhost:5173, server on :3001
pnpm check                # lint + typecheck + tests
```
