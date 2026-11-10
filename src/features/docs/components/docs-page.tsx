import { Link, NavLink, useParams } from 'react-router';
import { cn } from '@/lib/utils';
import { guidePages } from '../api/guide-pages';
import { MarkdownContent } from './markdown-content';

export function DocsPage() {
  const { slug } = useParams();
  const page = guidePages.find((p) => p.slug === slug);

  return (
    <div className="grid gap-8 md:grid-cols-[13rem_1fr]">
      <nav aria-label="Docs" className="md:sticky md:top-6 md:self-start">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Guide
        </p>
        <ul className="space-y-0.5">
          {guidePages.map((p) => (
            <li key={p.slug}>
              <NavLink
                to={`/docs/${p.slug}`}
                className={({ isActive }) =>
                  cn(
                    'block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground',
                    isActive && 'bg-accent font-medium text-accent-foreground',
                  )
                }
              >
                {p.title}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {page ? (
        <article className="prose prose-neutral dark:prose-invert max-w-3xl prose-pre:bg-muted prose-pre:text-foreground prose-code:before:content-none prose-code:after:content-none">
          <MarkdownContent markdown={page.content} />
        </article>
      ) : (
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold">Page not found</h1>
          <Link to="/docs/overview" className="text-primary hover:underline">
            Back to the overview
          </Link>
        </div>
      )}
    </div>
  );
}
