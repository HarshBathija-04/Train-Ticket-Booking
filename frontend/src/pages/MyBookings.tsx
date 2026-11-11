import { useQuery } from '@tanstack/react-query';
import { Ticket } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, PageTitle, Skeleton, StatusBadge } from '../components/ui';
import { api } from '../lib/api';
import { CLASS_NAMES, formatDate, formatINR, formatTime, isoDate } from '../lib/format';
import type { Booking } from '../lib/types';
import { canCancel, useCancelBooking } from './BookingDetail';

export default function MyBookings() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const cancel = useCancelBooking();
  const q = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api<{ bookings: Booking[] }>('/api/bookings').then((r) => r.bookings),
  });
  const today = isoDate();
  const isUpcoming = (b: Booking) => b.bookingStatus === 'CONFIRMED' && b.journeyDate >= today;
  const list = (q.data ?? [])
    .filter((b) => (tab === 'upcoming' ? isUpcoming(b) : !isUpcoming(b)))
    .sort((a, b) => (tab === 'upcoming' ? a.journeyDate.localeCompare(b.journeyDate) : 0));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <PageTitle title="My bookings">Your tickets, newest journeys first.</PageTitle>

      <div
        role="tablist"
        aria-label="Booking filter"
        className="mb-5 inline-flex rounded-md border border-line bg-surface p-1"
      >
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`min-h-10 rounded-sm px-4 text-sm font-semibold transition-colors ${
              tab === t ? 'bg-navy-700 text-white' : 'text-muted hover:text-ink'
            }`}
          >
            {t === 'upcoming' ? 'Upcoming' : 'Past & cancelled'}
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-live="polite">
        {q.isPending ? (
          <div className="space-y-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        ) : list.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title={tab === 'upcoming' ? 'No upcoming journeys' : 'Nothing here yet'}
            action={
              <Link to="/" className="btn-primary">
                Search trains
              </Link>
            }
          >
            {tab === 'upcoming'
              ? 'Book a train and your ticket will show up here.'
              : 'Completed and cancelled trips appear here.'}
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {list.map((b) => (
              <li key={b.pnr} className="card animate-enter flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <StatusBadge status={b.bookingStatus} />
                    <span className="font-mono text-xs text-muted">PNR {b.pnr}</span>
                  </div>
                  <p className="truncate font-bold">
                    {b.from.city} → {b.to.city}
                  </p>
                  <p className="text-sm text-muted">
                    {formatDate(b.journeyDate)} · {formatTime(b.departureTime)} · {b.trainName} ·{' '}
                    {CLASS_NAMES[b.classCode]} · {b.noOfSeats} pax
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                  <p className="mr-auto font-extrabold tabular sm:mr-0">{formatINR(b.totalFare)}</p>
                  <div className="flex gap-2">
                    {canCancel(b) && (
                      <button
                        type="button"
                        className="btn-danger min-h-10"
                        disabled={cancel.isPending}
                        onClick={() => window.confirm(`Cancel PNR ${b.pnr}?`) && cancel.mutate(b.pnr)}
                        aria-label={`Cancel booking ${b.pnr}`}
                      >
                        Cancel
                      </button>
                    )}
                    <Link to={`/bookings/${b.pnr}`} className="btn-ghost min-h-10" aria-label={`View ticket ${b.pnr}`}>
                      View ticket
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
