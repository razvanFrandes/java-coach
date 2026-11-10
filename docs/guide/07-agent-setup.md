# Agent setup

This repo is set up for [Claude Code](https://docs.claude.com/en/docs/claude-code), an AI coding
agent. The setup is deliberately small: one instruction file and three skills. This page
explains what each one does and how to use it.

## `CLAUDE.md`: the house rules

`CLAUDE.md` at the root is read by Claude Code at the start of every session. It is under 80
lines and contains only rules **specific to this repo**:

| Section | What it says |
| --- | --- |
| Commands | `pnpm dev`, `pnpm test`, `pnpm check`, how to add a shadcn component |
| Where code goes | The layer rules from [Architecture](/docs/architecture), folder by folder |
| Naming | kebab-case files, PascalCase components, the domain vocabulary |
| State | TanStack Query vs Zustand vs `useState` (see [State](/docs/state)) |
| Feature workflow | The spec, full suite, red, green, refactor loop from [Testing](/docs/testing) |
| Hard do-nots | No secrets in the frontend, no infrastructure imports in features, no real Codex in tests, no extra skills |

There is no generic advice like "write clean code" in it: the agent already knows that, and
every extra line dilutes the rules that matter. When you find yourself correcting the agent
about the same project-specific thing twice, that rule belongs in `CLAUDE.md`.

## The three skills

A skill is a folder in `.claude/skills/` with a `SKILL.md` file. Its `description` tells the
agent **when** to use it; the body tells it **how**. Each one here is under 100 lines.

### `feature-tdd`

**When:** adding a feature or changing behaviour.

**What it does:** walks through the workflow used for every feature in this repo:

1. write `docs/specs/<feature>.md` with numbered acceptance criteria,
2. write the complete suite (domain, hook, component, server) with `ACn:` test names,
3. run it once and confirm every test fails for the right reason,
4. implement until green, never editing a test just to make it pass,
5. `pnpm check`, `pnpm test:coverage`, commit as `feat(<feature>): ...`.

**Try:** "Use the feature-tdd skill to add a 'reset progress' button to the learning path."

### `new-component`

**When:** creating any React component.

**What it does:** decides where the file goes (shadcn primitive, feature component or app shell),
how to name it and type its props with domain types, keeps decisions out of JSX, styles it with
design tokens instead of raw colours, and lists the tests every component needs (render
with `renderWithProviders`, query by role or label, interact with `userEvent`).

**Try:** "Create a component that shows the strongest skill area on the dashboard."

### `code-review`

**When:** reviewing a branch, a PR or a set of files.

**What it does:** runs `pnpm check`, then goes through a checklist made for this repo:

- **layer boundaries**: domain purity, no infrastructure imports in features, composition roots,
- **SOLID problems that actually matter here** (single responsibility, dependency inversion,
  repeated switches) and **over-engineering** (one-implementation interfaces),
- **state placement**: no copies of query data in stores,
- **test quality**: every acceptance criterion tested, roles not class names, nothing skipped,
- **docs**: snippets still match.

It reports one line per finding, as `[severity] file:line: problem, then fix`, and ends with a verdict.

**Try:** "Run the code-review skill on my branch against main."

## How to use them

Claude Code picks a skill on its own when your request matches its description. You can also
ask for one by name ("use the feature-tdd skill") or type `/feature-tdd` in the prompt.

A good session for a new feature looks like this:

1. Ask for the feature and mention the `feature-tdd` skill. Read the spec it writes **before**
   it writes tests, because the spec is the cheapest place to fix a misunderstanding.
2. Let it write the suite and show you the red run.
3. Let it implement. Check that no test was changed to make it pass (`git diff` on `*.test.*`).
4. Ask for a `code-review` of the branch before you merge.

## What is deliberately not here

No custom agents, no slash commands, no hooks. Three skills cover the work in this repo. More
configuration means more for a new team member to read and more to keep up to date. Add
something only when the same problem has come up several times.
