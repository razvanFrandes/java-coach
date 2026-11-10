# Docs

An in-app tutorial for junior developers at `/docs`. The pages are markdown files in
`docs/guide/`, rendered by the app with a sidebar. Code snippets in the guides are checked
against the source by a test, so the docs cannot silently drift from the code.

## Acceptance criteria

### Pages (`src/features/docs/utils/guide-pages.ts`)

1. Every `docs/guide/NN-name.md` file is a page. Pages are ordered by the number `NN`, the
   slug is `name`, and the title is the first `# ` heading (the slug when there is none).
   A file without the number prefix comes after the numbered ones and its slug is the file
   name without `.md`.

### Docs page (`/docs`, `/docs/:slug`)

2. A sidebar navigation named "Docs" lists the pages in order: Overview, Project structure,
   Data flow, State, Backend, Testing, Agent setup.
3. `/docs` opens the first page.
4. `/docs/<slug>` renders that page's markdown (headings, text, lists, tables, code).
5. The sidebar marks the current page (`aria-current="page"`).
6. An unknown slug shows "Page not found" and a link back to the overview.
7. Links to `/docs/...` inside a page navigate within the app.

### Snippets (`src/features/docs/docs-snippets.test.ts`)

8. A code block whose first line is a comment naming a repository file (`// src/...`,
   `// server/...`, `// eslint.config.js`, ...) must match that file: every chunk between
   `// ...` lines appears in the file verbatim. Blocks marked `// counterexample` are not
   checked.
9. All seven pages exist and the guides contain at least ten checked snippets.

## Out of scope

- Search.
- Syntax highlighting.
- Diagrams.
