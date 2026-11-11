import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Copy, Printer } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { RouteLine } from '../components/RouteLine';
import { ErrorState, Skeleton, StatusBadge } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { berthOf, CLASS_NAMES, formatDate, formatINR, GENDERS, isoDate } from '../lib/format';
import type { Booking } from '../lib/types';

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pnr: string) => api<{ booking: Booking }>(`/api/bookings/${pnr}/cancel`, { method: 'POST' }),
    onSuccess: ({ booking }) => {
      qc.setQueryData(['booking', booking.pnr], booking);
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['search'] });
      toast.success(`PNR ${booking.pnr} cancelled. Seats released.`);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Cancellation failed'),
  });
}

export const canCancel = (b: Booking) => b.bookingStatus === 'CONFIRMED' && b.journeyDate >= isoDate();

export default function BookingDetail() {
  const { pnr = '' } = useParams();
  const fresh = (useLocation().state as { fresh?: boolean } | null)?.fresh;
  const [copied, setCopied] = useState(false);
  const cancel = useCancelBooking();
  const q = useQuery({
    queryKey: ['booking', pnr],
    queryFn: () => api<{ booking: Booking }>(`/api/bookings/${pnr}`).then((r) => r.booking),
  });

  if (q.isPending) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10" aria-busy="true">
        <Skeleton className="h-[30rem]" />
      </div>
    );
  }
  if (q.isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState error={q.error} onRetry={() => q.refetch()} />
      </div>
    );
  }
  const b = q.data;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(b.pnr);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Copy failed, select the PNR manually');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      {fresh && (
        <div
          className="animate-enter mb-6 flex items-center gap-3 rounded-lg bg-go-50 px-4 py-3 text-go-700"
          role="status"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-go-700 text-white">
            <Check className="size-4" aria-hidden />
          </span>
          <p className="font-semibold">Your seats are confirmed. Have a great journey!</p>
        </div>
      )}

      <article className="overflow-hidden rounded-xl bg-surface shadow-pop" aria-labelledby="ticket-title">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-navy-900 px-5 py-4 text-white sm:px-6">
          <div>
            <h1 id="ticket-title" className="text-lg font-extrabold">
              {b.trainName} <span className="font-mono text-sm text-white/70">#{b.trainNumber}</span>
            </h1>
            <p className="text-sm text-white/75">
              {CLASS_NAMES[b.classCode]} ({b.classCode})
            </p>
          </div>
          <StatusBadge status={b.bookingStatus} />
        </div>

        <div className="px-5 py-6 sm:px-6">
          <p className="mb-4 text-sm font-semibold text-muted">
            {formatDate(b.journeyDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <RouteLine {...b} />
        </div>

        <div className="relative" aria-hidden>
          <div className="perforation" />
          <span className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full bg-paper" />
          <span className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full bg-paper" />
        </div>

        <div className="grid gap-6 px-5 py-6 sm:grid-cols-[auto_1fr] sm:px-6">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-muted uppercase">PNR</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="font-mono text-3xl font-bold tracking-wider text-navy-900 tabular">{b.pnr}</p>
              <button
                type="button"
                onClick={copy}
                className="no-print btn size-10 px-0 text-muted hover:bg-navy-50 hover:text-navy-700"
                aria-label="Copy PNR"
              >
                {copied ? (
                  <Check className="size-4 text-go-700" aria-hidden />
                ) : (
                  <Copy className="size-4" aria-hidden />
                )}
              </button>
            </div>
            <p className="mt-3 text-sm text-muted">
              Total paid <span className="font-bold text-ink tabular">{formatINR(b.totalFare)}</span>
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[18rem] text-left text-sm">
              <caption className="sr-only">Passengers</caption>
              <thead>
                <tr className="border-b border-line text-xs text-muted uppercase">
                  <th scope="col" className="py-2 font-bold">
                    Passenger
                  </th>
                  <th scope="col" className="py-2 font-bold">
                    Age
                  </th>
                  <th scope="col" className="py-2 text-right font-bold">
                    Seat
                  </th>
                </tr>
              </thead>
              <tbody>
                {b.passengers.map((p) => (
                  <tr key={p.seatNo} className="border-b border-line last:border-0">
                    <td className="py-2.5 font-semibold">
                      {p.name} <span className="font-normal text-muted">· {GENDERS[p.gender]}</span>
                    </td>
                    <td className="py-2.5 tabular">{p.age}</td>
                    <td className="py-2.5 text-right font-mono">
                      {b.bookingStatus === 'CANCELLED' ? (
                        <span className="text-stop-700">CAN</span>
                      ) : (
                        <>
                          {b.classCode}/{p.seatNo}/{berthOf(b.classCode, p.seatNo).short}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </article>

      <div className="no-print mt-6 flex flex-wrap gap-3">
        <Link to="/bookings" className="btn-primary">
          My bookings
        </Link>
        <button type="button" className="btn-ghost" onClick={() => window.print()}>
          <Printer className="size-4" aria-hidden /> Print ticket
        </button>
        {canCancel(b) && (
          <button
            type="button"
            className="btn-danger sm:ml-auto"
            disabled={cancel.isPending}
            onClick={() => window.confirm(`Cancel PNR ${b.pnr}? This releases all seats.`) && cancel.mutate(b.pnr)}
          >
            {cancel.isPending ? 'Cancelling…' : 'Cancel booking'}
          </button>
        )}
      </div>
    </div>
  );
}
