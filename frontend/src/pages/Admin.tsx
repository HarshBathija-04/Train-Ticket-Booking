import { useQuery } from '@tanstack/react-query';
import { ErrorState, PageTitle, Skeleton, StatusBadge } from '../components/ui';
import { api } from '../lib/api';
import { formatDate, formatINR } from '../lib/format';
import type { AdminOverview } from '../lib/types';

export default function Admin() {
  const q = useQuery({ queryKey: ['admin'], queryFn: () => api<AdminOverview>('/api/admin/overview') });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <PageTitle title="Operations overview">Bookings and revenue across all trains.</PageTitle>
      {q.isPending ? (
        <div className="grid gap-4 sm:grid-cols-4" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => q.refetch()} />
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ['Confirmed bookings', q.data.stats.confirmedBookings],
              ['Seats sold', q.data.stats.seatsSold],
              ['Revenue', formatINR(q.data.stats.revenue)],
              ['Cancelled', q.data.stats.cancelledBookings],
            ].map(([label, value]) => (
              <div key={label} className="card p-4">
                <dt className="text-xs font-bold tracking-wide text-muted uppercase">{label}</dt>
                <dd className="mt-1 text-2xl font-extrabold tabular">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="card mt-6 overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <caption className="px-4 pt-4 text-left font-bold">Latest 50 bookings</caption>
              <thead>
                <tr className="border-b border-line text-xs text-muted uppercase">
                  {['PNR', 'Passenger', 'Train', 'Route', 'Journey', 'Seats', 'Fare', 'Status'].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {q.data.recent.map((r) => (
                  <tr key={r.pnr} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-mono">{r.pnr}</td>
                    <td className="px-4 py-3">
                      <span className="block font-semibold">{r.userName}</span>
                      <span className="text-xs text-muted">{r.userEmail}</span>
                    </td>
                    <td className="px-4 py-3">
                      {r.trainName} <span className="font-mono text-xs text-muted">{r.classCode}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {r.from}–{r.to}
                    </td>
                    <td className="px-4 py-3">{formatDate(r.journeyDate)}</td>
                    <td className="px-4 py-3 tabular">{r.noOfSeats}</td>
                    <td className="px-4 py-3 tabular">{formatINR(r.totalFare)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.bookingStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
