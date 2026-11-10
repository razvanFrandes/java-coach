---
name: new-component
description: Use when creating a React component in Java Coach, whether a feature component (page, card, list) or a new shadcn/ui primitive. Covers file placement, naming, props, shadcn usage, where logic goes, and the tests every component needs.
---

# Adding a component

## 1. Pick the place

| Component                            | Folder                                                       |
| ------------------------------------ | ------------------------------------------------------------ |
| shadcn primitive (button, card, ...) | `src/components/ui/` via `pnpm dlx shadcn@latest add <name>` |
| Used by one feature                  | `src/features/<feature>/components/`                         |
| App shell (layout, nav)              | `src/app/`                                                   |

Check `src/components/ui/` first: use what exists before adding a primitive. Never hand-edit
generated files; wrap them in a feature component instead.

## 2. Name and shape

- File `kebab-case.tsx`, named export in PascalCase: `gap-list.tsx` exports `GapList`.
- One component per file. Small private helpers in the same file are fine.
- Props are an interface named `<Component>Props` when there are more than two, typed with
  domain types (`Gap`, `SkillRating`, `LearningStep`), not `any` or loose objects.
- Pages are `<name>-page.tsx` and are the only components that call data hooks.
  Children receive data through props, which keeps them easy to test.

```tsx
import { Badge } from '@/components/ui/badge';
import type { Gap } from '@/domain/types';

interface GapItemProps {
  gap: Gap;
}

export function GapItem({ gap }: GapItemProps) { ... }
```

## 3. Keep logic out of JSX

A component may map, format a label or pick a variant. Anything that decides
(levels, ordering, filtering, progress, validation) belongs in `src/domain` or a hook.

```tsx
// Wrong: the rule is hidden in the view.
{
  steps.filter((s) => !done.includes(s.id))[0]?.title;
}

// Right: the rule is a tested domain function, the view only renders.
const next = findNextStep(orderedSteps, doneIds);
```

## 4. Styling

- Tailwind utility classes. Colours come from tokens (`text-muted-foreground`, `bg-primary`),
  never raw hex or `text-amber-600`.
- Merge class props with `cn()` from `@/lib/utils`.
- Accessible by default: real `<button>`s, labelled inputs, headings in order, `aria-label`
  on icon-only buttons, and every progress bar has a text equivalent.

## 5. Tests (required)

Each feature component gets `<name>.test.tsx` next to it:

- Render with `renderWithProviders` from `@/test/render` (wraps Query, services and router).
- Query by role, label or visible text, as a user would. No `container.querySelector` and no
  class name assertions.
- Interact with `const user = userEvent.setup(); await user.click(...)`.
- Cover: the main content, empty/loading/error states if the component has them, and every
  interaction.
- Pages: inject fake services or seed the query cache; never call the real coach.

Shadcn primitives in `src/components/ui` are not tested directly.
