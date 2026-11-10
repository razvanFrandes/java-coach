# Java Coach

Teaching repo for junior developers. Pick the obvious solution and copy the patterns already here.
User-facing docs: `docs/guide/` (rendered at /docs). Skills: `.claude/skills/`.

## Commands

- `pnpm dev`: web (Vite, :5173) and server (Express, :3001) together
- `pnpm dev:web` / `pnpm dev:server`: one side only
- `pnpm test` (all), `pnpm test -- src/app/routes` (a folder), `pnpm test:coverage`
- `pnpm lint`, `pnpm typecheck`, `pnpm format`
- `pnpm check`: lint + typecheck + test. Run before every commit.
- `pnpm dlx shadcn@latest add <name>`: add a shadcn/ui component
- `pnpm exec codex login` (once), `pnpm codex:try [cv.pdf]`: check the real Codex coach

## Where code goes: MVC on both sides

Frontend (`src/`, bulletproof-react layout):

- `features/<feature>/api/`: Model. HTTP calls + their TanStack Query hooks (`analyze-cv.ts`).
- `features/<feature>/stores/`: Model. Zustand stores.
- `features/<feature>/hooks/`: Controller. What happens on user actions (`use-cv-upload.ts`).
- `features/<feature>/components/`: View. Render props, call callbacks. No fetch, no rules.
- `features/<feature>/utils/`: plain functions (validation). Create only the folders you need.
- `app/routes/`: one page per URL; the only place that combines features. `app/router.tsx`.
- Shared: `components/` (+ `ui/` from shadcn, never hand-edit), `hooks/`, `lib/`, `types/api.ts`,
  `config/env.ts`, `mocks/` (MSW, mock mode and tests), `testing/` (test helpers).
- Imports go shared -> features -> app. A feature never imports another feature (ESLint).

Backend (`server/src/`, Express MVC): `routes/` -> `controllers/` (validate, call service,
respond) -> `services/` (the work: cache, Codex, report rules) -> `models/` (SQL). Errors:
`throw new HttpError(status, code, message)`. The server never imports from `src/`.

The API is `docs/api-contract.md`; `server/src/types.ts` and `src/types/api.ts` must match it.
Specs with acceptance criteria: `docs/specs/<feature>.md`.

## Styling

- shadcn/ui components first (`Card`, `Badge`, `Button`, `Table`, `Empty`, `Alert`...).
  Tailwind utility classes for layout and spacing. No custom CSS, no hand-made cards or chips.
- Colours only from theme tokens (`text-muted-foreground`), never hex or `text-red-600`.

## Naming

- Files kebab-case (`learning-step-card.tsx`), components PascalCase, hooks `useX`,
  pages `XRoute`. Use the API's words: report, skill, level, gap, learning step.

## State

- TanStack Query: data from the server (`['coach-report']`, saved to localStorage).
- Zustand: client state shared by several components (learning progress, `persist`).
- `useState`: state used by one component only. No other state libraries.

## Feature workflow (test-first, in batches). Use the `feature-tdd` skill.

1. Write `docs/specs/<feature>.md` with numbered acceptance criteria.
2. Write the complete test suite from the spec (utils, hooks, pages, server).
3. Run it once and confirm every test fails for the right reason (missing code, not a typo).
4. Implement until the whole suite is green, then refactor with tests green.
5. `pnpm check`, then commit: `feat(<feature>): ...`.

- Never weaken or delete a test to make it pass. If a test is wrong, fix the spec first,
  then the test, and say so.
- Test behaviour: query by role/label/text, act with `userEvent`. No class-name assertions.
- `pnpm test:coverage` keeps `features/*/{hooks,utils}` and `report.service.ts` at 100%.

## Hard do-nots

- No API keys, tokens or secrets in frontend code or in `VITE_*` variables.
- No business rules in components or controllers: they go in hooks, utils or server services.
- Never call real Codex or the network in tests: MSW in the browser tests, `vi.mock` on the server.
- No DDD layers, ports/adapters or interfaces with a single implementation.
- Do not add new skills, agents or slash commands.
- Code snippets in `docs/guide/` must match the source (`docs-snippets.test.ts` checks it).
