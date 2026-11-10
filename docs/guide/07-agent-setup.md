# Agent setup

This repo is set up for [Claude Code](https://docs.claude.com/en/docs/claude-code), an AI coding
agent. The setup is deliberately small: one instruction file and three skills.

## `CLAUDE.md`: the house rules

`CLAUDE.md` at the root is read by Claude Code at the start of every session. It is under 80
lines and contains only rules **specific to this repo**:

| Section          | What it says                                                                   |
| ---------------- | ------------------------------------------------------------------------------ |
| Commands         | `pnpm dev`, `pnpm test`, `pnpm check`, how to add a shadcn component           |
| Where code goes  | The folders from [Project structure](/docs/project-structure), MVC on both sides |
| Styling          | shadcn/ui and Tailwind only, no custom CSS                                     |
| State            | TanStack Query vs Zustand vs `useState` (see [State](/docs/state))             |
| Feature workflow | Spec, full suite, red, green, refactor (see [Testing](/docs/testing))          |
| Hard do-nots     | No secrets in the frontend, no feature-to-feature imports, no real Codex in tests |

There is no generic advice like "write clean code" in it: the agent already knows that, and
every extra line dilutes the rules that matter. When you correct the agent about the same
project-specific thing twice, that rule belongs in `CLAUDE.md`.

## The three skills

A skill is a folder in `.claude/skills/` with a `SKILL.md` file. Its `description` tells the
agent **when** to use it; the body tells it **how**. Each one is under 100 lines.

### `feature-tdd`

**When:** adding a feature or changing behaviour, in the browser or on the server.

**What it does:** the workflow from [Testing](/docs/testing): spec with numbered criteria, the
whole suite with `ACn:` names, one red run, implement, `pnpm check`, commit as
`feat(<feature>): ...`. It also says which files a feature needs (`api/`, `hooks/`,
`components/`, a page in `app/routes`, or route/controller/service/model on the server).

**Try:** "Use the feature-tdd skill to add a 'reset progress' button to the learning path."

### `new-component`

**When:** creating a React component.

**What it does:** decides where the file goes (feature component, shared component or page),
builds it from shadcn/ui components, keeps decisions in hooks instead of JSX, and lists the
tests it needs.

**Try:** "Create a component that shows the strongest skill area on the dashboard."

### `code-review`

**When:** reviewing a branch, a PR or a set of files.

**What it does:** runs `pnpm check`, then goes through a checklist made for this repo:
MVC placement (no logic in components or controllers), import direction, shadcn instead of
hand-made styling, state placement, test quality and docs. It reports one line per finding, as
`[severity] file:line: problem, then fix`, and ends with a verdict.

**Try:** "Run the code-review skill on my branch against main."

## How to use them

Claude Code picks a skill on its own when your request matches its description. You can also
ask for one by name ("use the feature-tdd skill") or type `/feature-tdd`.

A good session for a new feature:

1. Ask for the feature and mention `feature-tdd`. Read the spec it writes **before** it writes
   tests: the spec is the cheapest place to fix a misunderstanding.
2. Let it write the suite and show you the red run.
3. Let it implement. Check that no test was changed to make it pass (`git diff` on `*.test.*`).
4. Ask for a `code-review` of the branch before you merge.

## What is deliberately not here

No custom agents, no slash commands, no hooks. Three skills cover the work in this repo. Add
something only when the same problem has come up several times.
