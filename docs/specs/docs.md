# Docs

An in-app tutorial for junior developers at `/docs`. The pages are markdown files in
`docs/guide/`, rendered by the app with a sidebar. Code snippets in the guides are checked
against the source by a test, so the docs cannot silently drift from the code.

## Acceptance criteria

### Pages (`src/features/docs/model/doc-pages.ts`)

1. Every `docs/guide/NN-name.md` file is a page. Pages are ordered by the number `NN`, the
   slug is `name`, and the title is the first `# ` heading (the slug when there is none).

### Docs page (`/docs`, `/docs/:slug`)

2. A sidebar navigation named "Docs" lists the pages in order: Overview, Architecture,
   Data flow, State, SOLID in this codebase, Testing, Agent setup.
3. `/docs` opens the first page.
4. `/docs/<slug>` renders that page's markdown (headings, text, lists, tables, code).
5. The sidebar marks the current page (`aria-current="page"`).
6. An unknown slug shows "Page not found" and a link back to the overview.
7. Links to `/docs/...` inside a page navigate within the app.
8. A ` ```mermaid ` block is rendered as a diagram (a figure labelled "Diagram").
   If the diagram cannot be rendered, its source is shown instead.

### Snippets (`src/features/docs/docs-snippets.test.ts`)

9. A code block whose first line is a comment naming a repository file (`// src/...`,
   `// server/...`, `// eslint.config.js`, ...) must match that file: every chunk between `// ...` lines appears in the
   file verbatim. Blocks marked `// counterexample` are not checked.
10. All seven pages exist and the guides contain at least ten checked snippets.

## Out of scope

- Search.
- Syntax highlighting.
