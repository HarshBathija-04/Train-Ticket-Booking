import { useQuery } from '@tanstack/react-query';
import { TrainTrack } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { SearchForm } from '../components/SearchForm';
import { TrainCard } from '../components/TrainCard';
import { EmptyState, ErrorState, Skeleton } from '../components/ui';
import { api } from '../lib/api';
import { addDays, BOOKING_WINDOW_DAYS, formatDate, isoDate } from '../lib/format';
import type { Schedule } from '../lib/types';

export default function Search() {
  const [params] = useSearchParams();
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';
  const date = params.get('date') ?? addDays(isoDate(), 1);
  const fromStation = from ? { code: from, city: params.get('fn') ?? from, name: '' } : null;
  const toStation = to ? { code: to, city: params.get('tn') ?? to, name: '' } : null;

  const q = useQuery({
    queryKey: ['search', from, to, date],
    queryFn: () => api<{ results: Schedule[] }>(`/api/trains/search?${new URLSearchParams({ from, to, date })}`),
    enabled: !!from && !!to,
  });

  const today = isoDate();
  const days = Array.from({ length: 7 }, (_, i) => addDays(date, i - 3)).filter(
    (d) => d >= today && d <= addDays(today, BOOKING_WINDOW_DAYS),
  );
  const dayLink = (d: string) => {
    const p = new URLSearchParams(params);
    p.set('date', d);
    return `/search?${p}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="card mb-6 p-4 sm:p-5">
        <SearchForm
          key={`${from}-${to}-${date}`}
          initialFrom={fromStation}
          initialTo={toStation}
          initialDate={date}
          compact
        />
      </div>

      <nav aria-label="Change date" className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {days.map((d) => (
          <Link
            key={d}
            to={dayLink(d)}
            aria-current={d === date ? 'date' : undefined}
            className={`shrink-0 rounded-md border px-3.5 py-2 text-sm font-semibold transition-colors ${
              d === date
                ? 'border-navy-700 bg-navy-700 text-white'
                : 'border-line bg-surface text-ink hover:border-navy-600'
            }`}
          >
            {formatDate(d)}
          </Link>
        ))}
      </nav>

      <h1 className="mb-4 text-xl font-extrabold tracking-tight sm:text-2xl">
        {fromStation && toStation ? `${fromStation.city} to ${toStation.city}` : 'Search trains'}
        <span className="block text-base font-semibold text-muted sm:ml-2 sm:inline">
          {formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </h1>

      <div aria-live="polite" aria-busy={q.isPending && q.fetchStatus !== 'idle'}>
        {!from || !to ? (
          <EmptyState icon={TrainTrack} title="Where are you headed?">
            Choose an origin and destination above to see trains.
          </EmptyState>
        ) : q.isPending ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card space-y-4 p-5">
                <Skeleton className="h-5 w-56" />
                <Skeleton className="h-12 w-full" />
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              </div>
            ))}
          </div>
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        ) : q.data.results.length === 0 ? (
          <EmptyState icon={TrainTrack} title="No direct trains on this route">
            RailDesk covers 30 trains on popular corridors. Try New Delhi to Mumbai, Chennai to Bengaluru or Mumbai to
            Ahmedabad.
          </EmptyState>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted">
              {q.data.results.length} train{q.data.results.length > 1 && 's'} found · fares are per passenger
            </p>
            <div className="space-y-4">
              {q.data.results.map((s) => (
                <TrainCard key={s.scheduleId} schedule={s} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
