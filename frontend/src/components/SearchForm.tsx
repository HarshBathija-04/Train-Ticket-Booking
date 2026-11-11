import { ArrowLeftRight, Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDays, isoDate } from '../lib/format';
import type { Station } from '../lib/types';
import { StationInput } from './StationInput';

interface Props {
  initialFrom?: Station | null;
  initialTo?: Station | null;
  initialDate?: string;
  compact?: boolean;
}

export const BOOKING_WINDOW_DAYS = 60;

export function SearchForm({ initialFrom = null, initialTo = null, initialDate, compact }: Props) {
  const navigate = useNavigate();
  const today = isoDate();
  const [from, setFrom] = useState<Station | null>(initialFrom);
  const [to, setTo] = useState<Station | null>(initialTo);
  const [date, setDate] = useState(initialDate ?? addDays(today, 1));
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!from || !to) return setError('Choose both stations from the suggestions.');
    if (from.code === to.code) return setError('Origin and destination must be different.');
    setError('');
    const q = new URLSearchParams({ from: from.code, to: to.code, date, fn: from.city, tn: to.city });
    navigate(`/search?${q}`);
  };

  return (
    <form onSubmit={submit} noValidate aria-label="Search trains">
      <div
        className={`grid gap-3 ${compact ? 'md:grid-cols-[1fr_auto_1fr_11rem_auto]' : 'sm:grid-cols-[1fr_auto_1fr]'} items-end`}
      >
        <StationInput label="From" value={from} onChange={setFrom} invalid={!!error && !from} />
        <button
          type="button"
          className="btn-ghost size-11 justify-self-center px-0 max-sm:-my-1 max-sm:rotate-90"
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
          aria-label="Swap origin and destination"
        >
          <ArrowLeftRight className="size-4" aria-hidden />
        </button>
        <StationInput label="To" value={to} onChange={setTo} invalid={!!error && !to} />
        <div className={compact ? '' : 'sm:col-span-2'}>
          <label htmlFor="journey-date" className="label">
            Journey date
          </label>
          <input
            id="journey-date"
            type="date"
            className="field"
            value={date}
            min={today}
            max={addDays(today, BOOKING_WINDOW_DAYS)}
            required
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-accent min-h-11 w-full px-6 md:w-auto">
          <Search className="size-4" aria-hidden />
          Search trains
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-stop-700">
          {error}
        </p>
      )}
    </form>
  );
}
