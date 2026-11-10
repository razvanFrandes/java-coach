import { NavLink, Outlet, useMatch } from 'react-router';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/upload', label: 'Upload CV', end: false },
  { to: '/profile', label: 'Profile', end: false },
  { to: '/gaps', label: 'Gaps', end: false },
  { to: '/path', label: 'Learning path', end: false },
  { to: '/docs', label: 'Docs', end: false },
];

/** The frame around every page: header with the main navigation, then the page itself. */
export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-6 py-3">
          <span className="text-lg font-semibold">Java Coach</span>
          <nav aria-label="Main" className="flex flex-wrap gap-1">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, label, end }: { to: string; label: string; end: boolean }) {
  const isActive = useMatch({ path: to, end }) !== null;
  return (
    <Button asChild variant={isActive ? 'secondary' : 'ghost'} size="sm">
      <NavLink to={to} end={end}>
        {label}
      </NavLink>
    </Button>
  );
}
