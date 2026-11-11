import { LogOut, Menu, TrainFront, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { subscribeSlow } from '../lib/api';
import { useAuth } from '../lib/auth';

function WakeBanner() {
  const [slow, setSlow] = useState(false);
  useEffect(() => subscribeSlow(setSlow), []);
  return (
    <div role="status" aria-live="polite" className="no-print">
      {slow && (
        <div className="animate-enter flex items-center justify-center gap-3 bg-marigold-100 px-4 py-2.5 text-center text-sm font-semibold text-marigold-700">
          <span className="size-2 shrink-0 animate-ping rounded-full bg-marigold-500" aria-hidden />
          Waking up the server. The free hosting tier sleeps when idle, so this first load can take up to a minute.
        </div>
      )}
    </div>
  );
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
    isActive ? 'bg-white/12 text-white' : 'text-white/80 hover:bg-white/8 hover:text-white'
  }`;

export function Layout() {
  const { user, signOut: endSession } = useAuth();
  const signOut = () => {
    endSession();
    toast.success('Signed out. See you on the next journey.');
  };
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const links = (
    <>
      <NavLink to="/" end className={navClass}>
        Search
      </NavLink>
      {user && (
        <NavLink to="/bookings" className={navClass}>
          My bookings
        </NavLink>
      )}
      {user?.role === 'ADMIN' && (
        <NavLink to="/admin" className={navClass}>
          Admin
        </NavLink>
      )}
    </>
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-marigold-500 px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <header className="bg-navy-900 text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/" className="flex items-center gap-2.5 rounded-md text-lg font-extrabold tracking-tight">
            <span className="grid size-9 place-items-center rounded-md bg-marigold-500 text-navy-900">
              <TrainFront className="size-5" aria-hidden />
            </span>
            RailDesk
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
            {links}
          </nav>
          <div className="hidden items-center gap-2 sm:flex">
            {user ? (
              <>
                <span className="max-w-40 truncate text-sm text-white/80">{user.name}</span>
                <button
                  type="button"
                  onClick={signOut}
                  className="btn min-h-10 text-white/85 hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="size-4" aria-hidden /> Sign out
                </button>
              </>
            ) : (
              <Link to="/login" state={{ from: location.pathname + location.search }} className="btn-accent min-h-10">
                Sign in
              </Link>
            )}
          </div>
          <button
            type="button"
            className="btn size-11 px-0 text-white hover:bg-white/10 sm:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
        {menuOpen && (
          <nav
            id="mobile-nav"
            aria-label="Main"
            onClick={() => setMenuOpen(false)}
            className="flex flex-col gap-1 border-t border-white/10 p-3 sm:hidden"
          >
            {links}
            {user ? (
              <button type="button" onClick={signOut} className={navClass({ isActive: false }) + ' text-left'}>
                Sign out ({user.name})
              </button>
            ) : (
              <NavLink to="/login" className={navClass}>
                Sign in
              </NavLink>
            )}
          </nav>
        )}
        <div className="flex h-1" aria-hidden>
          <span className="flex-1 bg-marigold-500" />
          <span className="w-1/4 bg-white/90" />
          <span className="w-1/6 bg-go-700" />
        </div>
      </header>
      <WakeBanner />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-bold text-ink">RailDesk</span> is a portfolio demo. No real tickets are issued and it
            is not affiliated with Indian Railways or IRCTC.
          </p>
          <a
            className="font-semibold text-navy-700 underline-offset-4 hover:underline"
            href="https://github.com/HarshBathija-04"
            target="_blank"
            rel="noreferrer"
          >
            Built by Harsh Bathija
          </a>
        </div>
      </footer>
    </div>
  );
}
