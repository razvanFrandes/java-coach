import { NavLink, Outlet } from 'react-router';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/upload', label: 'Upload CV', end: false },
  { to: '/profile', label: 'Profile', end: false },
  { to: '/gaps', label: 'Gaps', end: false },
  { to: '/docs', label: 'Docs', end: false },
];

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">
            Java <span className="text-primary">Coach</span>
          </span>
          <nav aria-label="Main" className="flex gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground',
                    isActive && 'bg-accent text-accent-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
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
