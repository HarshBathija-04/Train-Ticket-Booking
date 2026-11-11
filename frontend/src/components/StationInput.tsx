import { useQuery } from '@tanstack/react-query';
import { MapPin } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { api } from '../lib/api';
import type { Station } from '../lib/types';

interface Props {
  label: string;
  value: Station | null;
  onChange: (s: Station | null) => void;
  invalid?: boolean;
}

/** Accessible combobox (WAI-ARIA 1.2 list autocomplete) backed by /api/stations. */
export function StationInput({ label, value, onChange, invalid }: Props) {
  const id = useId();
  // null while not typing, so the field always mirrors the selected station
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? (value ? `${value.city} (${value.code})` : '');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setQuery(draft ?? ''), 150);
    return () => clearTimeout(t);
  }, [draft]);

  const { data, isFetching } = useQuery({
    queryKey: ['stations', query],
    queryFn: () => api<{ stations: Station[] }>(`/api/stations?q=${encodeURIComponent(query)}`),
    enabled: open,
    staleTime: 5 * 60_000,
    placeholderData: (prev) => prev,
  });
  const options = data?.stations ?? [];

  const choose = (s: Station) => {
    onChange(s);
    setDraft(null);
    setOpen(false);
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="relative">
        <MapPin
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          id={id}
          role="combobox"
          aria-expanded={open && options.length > 0}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={open && options[active] ? `${id}-opt-${active}` : undefined}
          aria-invalid={invalid || undefined}
          autoComplete="off"
          placeholder="City or station code"
          className="field pl-9"
          value={text}
          onFocus={(e) => {
            e.target.select();
            setOpen(true);
          }}
          onBlur={() => {
            setOpen(false);
            setDraft(null);
          }}
          onChange={(e) => {
            setDraft(e.target.value);
            setOpen(true);
            setActive(0);
            if (value) onChange(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
              setActive((a) => Math.min(a + 1, options.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === 'Enter' && open && options[active]) {
              e.preventDefault();
              choose(options[active]);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
        />
      </div>
      {open && (
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-label={`${label} suggestions`}
          className="animate-enter absolute z-20 mt-1.5 max-h-72 w-full overflow-auto rounded-md border border-line bg-surface p-1 shadow-pop"
        >
          {options.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-muted" role="presentation">
              {isFetching ? 'Searching stations…' : 'No stations match'}
            </li>
          )}
          {options.map((s, i) => (
            <li
              key={s.code}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(s)}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-sm px-3 py-2 ${
                i === active ? 'bg-navy-50' : ''
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{s.name}</span>
                <span className="block truncate text-xs text-muted">
                  {s.city}, {s.state}
                </span>
              </span>
              <span className="rounded-sm bg-navy-900 px-1.5 py-0.5 font-mono text-xs font-bold text-white">
                {s.code}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
