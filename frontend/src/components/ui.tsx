import { AlertTriangle, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { ApiError } from '../lib/api';
import type { Booking } from '../lib/types';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <span className="mb-4 grid size-12 place-items-center rounded-full bg-navy-50 text-navy-700">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h2 className="text-lg font-bold">{title}</h2>
      {children && <p className="mt-1.5 max-w-md text-sm text-muted">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof ApiError ? error.message : 'Something went wrong.';
  return (
    <div role="alert" className="card flex flex-col items-center border-stop-700/25 px-6 py-10 text-center">
      <AlertTriangle className="mb-3 size-8 text-stop-700" aria-hidden="true" />
      <h2 className="font-bold">We couldn't load this</h2>
      <p className="mt-1 max-w-md text-sm text-muted">{message}</p>
      {onRetry && (
        <button type="button" className="btn-ghost mt-5" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: Booking['bookingStatus'] }) {
  const ok = status === 'CONFIRMED';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${
        ok ? 'bg-go-50 text-go-700' : 'bg-stop-50 text-stop-700'
      }`}
    >
      <span className={`size-1.5 rounded-full ${ok ? 'bg-go-700' : 'bg-stop-700'}`} aria-hidden="true" />
      {ok ? 'Confirmed' : 'Cancelled'}
    </span>
  );
}

export function PageTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
      {children && <p className="mt-1 text-muted">{children}</p>}
    </div>
  );
}
