import { Link, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { DocsSidebar } from '@/features/docs/components/docs-sidebar';
import { Markdown } from '@/features/docs/components/markdown';
import { guidePages } from '@/features/docs/utils/guide-pages';

export function DocsRoute() {
  const { slug } = useParams();
  const page = guidePages.find((p) => p.slug === slug);

  return (
    <div className="grid gap-8 md:grid-cols-[14rem_1fr]">
      <aside>
        <DocsSidebar pages={guidePages} currentSlug={slug} />
      </aside>

      {page ? (
        <article className="prose prose-neutral max-w-3xl dark:prose-invert">
          <Markdown content={page.content} />
        </article>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Page not found</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild variant="outline">
              <Link to="/docs/overview">Back to the overview</Link>
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
