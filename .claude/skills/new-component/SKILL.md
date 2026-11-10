---
name: new-component
description: Use when creating a React component in Java Coach, whether a feature component (card, list), a shared component or a page. Covers file placement, naming, props, building it from shadcn/ui, where logic goes, and the tests it needs.
---

# Adding a component

## 1. Pick the place

| Component                                   | Folder                                                          |
| ------------------------------------------- | --------------------------------------------------------------- |
| shadcn primitive (button, card, table, ...) | `src/components/ui/` via `pnpm dlx shadcn@latest add <name>`    |
| Used by one feature                         | `src/features/<feature>/components/`                            |
| Used by many features                       | `src/components/` (e.g. `page-header.tsx`, `no-report.tsx`)     |
| A page (one URL)                            | `src/app/routes/<page>.tsx`, registered in `src/app/router.tsx` |

Never hand-edit `src/components/ui/`. A feature component never imports another feature;
combine features in the page.

## 2. Build it from shadcn/ui

Look in `src/components/ui/` first and on https://ui.shadcn.com/docs/components second.

- A box with a title: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`.
- A tag or chip: `Badge`. A tabular list: `Table`. Nothing to show yet: `Empty`.
- An error: `Alert variant="destructive"`. Loading: `Spinner`. Links that look like buttons:
  `<Button asChild><Link to="...">`.
- Tailwind classes only for layout and spacing (`grid`, `gap-4`, `space-y-6`, `flex`).
  No hand-made cards (`rounded-xl border p-5`), no custom CSS, no hex colours.

## 3. Name and shape

- File `kebab-case.tsx`, named export in PascalCase: `gap-card.tsx` exports `GapCard`.
- One component per file. Small private helpers in the same file are fine.
- Props interface `<Component>Props`, typed with the API types from `@/types/api`
  (`Gap`, `SkillRating`, `LearningStep`), never `any`.
- Pages (`XRoute`) call the hooks. Feature components get data through props and report
  user actions through callbacks (`onToggle`, `onFile`).

```tsx
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Gap } from '@/types/api';

interface GapCardProps {
  gap: Gap;
}

export function GapCard({ gap }: GapCardProps) { ... }
```

## 4. Keep logic out of JSX

A component may map a list, pick a label or a variant. Anything that decides (filtering,
ordering, sums, validation, what happens on click) belongs in a hook or a util.

```tsx
// Wrong: the rule is hidden in the view.
{
  steps.filter((s) => !doneIds.includes(s.id))[0]?.title;
}

// Right: the controller hook computes it, the view only renders.
const { nextStep } = useLearningPath();
```

## 5. Accessibility

- Real `<button>`s and links, labelled inputs (`Label htmlFor`), one `h1` per page
  (`PageHeader`), `aria-label` on icon-only buttons and on progress bars.

## 6. Tests

- Pages get `<page>.test.tsx` next to them; small feature components are covered there.
  A component with its own behaviour (drag-and-drop, local state) may get its own test.
- Render with `renderWithProviders` from `@/testing/test-utils` (Query + router;
  `{ report: sampleReport }` seeds the cache).
- Query by role, label or visible text. No `container.querySelector`, no class names.
- Interact with `const user = userEvent.setup(); await user.click(...)`.
- Cover the main content, empty and error states, and every interaction.
