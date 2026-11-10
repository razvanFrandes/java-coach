import { NavLink } from 'react-router';
import { Button } from '@/components/ui/button';
import type { GuidePage } from '../utils/guide-pages';

interface DocsSidebarProps {
  pages: GuidePage[];
  currentSlug: string | undefined;
}

export function DocsSidebar({ pages, currentSlug }: DocsSidebarProps) {
  return (
    <nav aria-label="Docs" className="flex flex-col gap-1">
      {pages.map((page) => (
        <Button
          key={page.slug}
          asChild
          variant={page.slug === currentSlug ? 'secondary' : 'ghost'}
          className="justify-start"
        >
          <NavLink to={`/docs/${page.slug}`}>{page.title}</NavLink>
        </Button>
      ))}
    </nav>
  );
}
