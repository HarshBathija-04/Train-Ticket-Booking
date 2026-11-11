import { Link } from 'react-router-dom';
import { CLASS_NAMES, formatINR } from '../lib/format';
import type { ClassAvailability, Schedule } from '../lib/types';
import { RouteLine } from './RouteLine';

function availability(c: ClassAvailability) {
  if (c.availableSeats === 0) return { text: 'Sold out', tone: 'text-stop-700' };
  if (c.availableSeats <= Math.max(5, c.totalSeats * 0.1)) {
    return { text: `Only ${c.availableSeats} left`, tone: 'text-wait-700' };
  }
  return { text: `${c.availableSeats} available`, tone: 'text-go-700' };
}

export function TrainCard({ schedule }: { schedule: Schedule }) {
  return (
    <article className="card animate-enter overflow-hidden" aria-labelledby={`train-${schedule.scheduleId}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 sm:px-5">
        <h2 id={`train-${schedule.scheduleId}`} className="flex items-center gap-2.5 font-bold">
          <span className="rounded-sm bg-navy-900 px-1.5 py-0.5 font-mono text-xs text-white">
            {schedule.trainNumber}
          </span>
          {schedule.trainName}
        </h2>
        <span className="rounded-full bg-marigold-100 px-2.5 py-0.5 text-xs font-bold text-marigold-700">
          {schedule.trainType}
        </span>
      </div>
      <div className="px-4 py-4 sm:px-5">
        <RouteLine {...schedule} />
      </div>
      <ul className="grid grid-cols-2 gap-2 px-4 pb-4 sm:grid-cols-4 sm:px-5" aria-label="Classes">
        {schedule.classes.map((c) => {
          const a = availability(c);
          const soldOut = c.availableSeats === 0;
          const body = (
            <>
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-sm font-bold">{c.classCode}</span>
                <span className="text-sm font-bold tabular">{formatINR(c.fare)}</span>
              </span>
              <span className="block truncate text-xs text-muted">{CLASS_NAMES[c.classCode]}</span>
              <span className={`mt-1 block text-xs font-bold ${a.tone}`}>{a.text}</span>
            </>
          );
          return (
            <li key={c.classCode}>
              {soldOut ? (
                <div className="rounded-md border border-line bg-paper p-3 opacity-70" aria-disabled="true">
                  {body}
                </div>
              ) : (
                <Link
                  to={`/book/${schedule.scheduleId}/${c.classCode}`}
                  aria-label={`Book ${CLASS_NAMES[c.classCode]} on ${schedule.trainName}, ${formatINR(c.fare)}, ${a.text}`}
                  className="block rounded-md border border-line bg-surface p-3 transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-px hover:border-navy-600 hover:shadow-card active:translate-y-0"
                >
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
