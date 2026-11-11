import { arrivalDayOffset, formatDuration, formatTime } from '../lib/format';
import type { Station } from '../lib/types';

interface Props {
  from: Station;
  to: Station;
  departureTime: string;
  arrivalTime: string;
  durationMin: number;
}

/** Departure → arrival with a dotted track between them. */
export function RouteLine({ from, to, departureTime, arrivalTime, durationMin }: Props) {
  const offset = arrivalDayOffset(departureTime, durationMin);
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4">
      <div>
        <p className="font-mono text-xl font-bold tabular sm:text-2xl">{formatTime(departureTime)}</p>
        <p className="text-sm font-semibold">
          {from.city} <span className="font-mono text-xs text-muted">{from.code}</span>
        </p>
      </div>
      <div className="flex flex-col items-center" aria-label={`Journey time ${formatDuration(durationMin)}`}>
        <span className="text-xs font-semibold text-muted tabular">{formatDuration(durationMin)}</span>
        <span className="relative my-1.5 flex w-full items-center" aria-hidden="true">
          <span className="size-2 rounded-full border-2 border-navy-700 bg-surface" />
          <span className="h-0 flex-1 border-t-2 border-dashed border-navy-100" />
          <span className="size-2 rounded-full bg-navy-700" />
        </span>
        {offset > 0 && (
          <span className="text-xs text-muted">
            arrives +{offset} day{offset > 1 && 's'}
          </span>
        )}
      </div>
      <div className="text-right">
        <p className="font-mono text-xl font-bold tabular sm:text-2xl">
          {formatTime(arrivalTime)}
          {offset > 0 && <sup className="ml-0.5 text-xs text-marigold-700">+{offset}</sup>}
        </p>
        <p className="text-sm font-semibold">
          <span className="font-mono text-xs text-muted">{to.code}</span> {to.city}
        </p>
      </div>
    </div>
  );
}
