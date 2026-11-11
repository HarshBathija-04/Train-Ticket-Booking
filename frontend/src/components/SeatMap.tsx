import { berthOf, LAYOUTS } from '../lib/format';
import type { ClassCode } from '../lib/types';

interface Props {
  classCode: ClassCode;
  totalSeats: number;
  booked: Set<number>;
  selected: number[];
  max: number;
  onToggle: (seat: number) => void;
}

export function SeatMap({ classCode, totalSeats, booked, selected, max, onToggle }: Props) {
  const layout = LAYOUTS[classCode];
  const rows = Array.from({ length: Math.ceil(totalSeats / layout.perRow) }, (_, r) =>
    Array.from({ length: layout.perRow }, (_, i) => r * layout.perRow + i + 1).filter((n) => n <= totalSeats),
  );
  const full = selected.length >= max;

  return (
    <div>
      <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-muted" aria-label="Legend">
        <li className="flex items-center gap-2">
          <span className="size-4 rounded-sm border border-navy-100 bg-surface" aria-hidden /> Available
        </li>
        <li className="flex items-center gap-2">
          <span className="size-4 rounded-sm bg-navy-700" aria-hidden /> Your pick
        </li>
        <li className="flex items-center gap-2">
          <span className="size-4 rounded-sm bg-line" aria-hidden /> Booked
        </li>
      </ul>
      <div className="max-h-[28rem] overflow-auto rounded-md border border-line bg-paper p-3">
        <div className="space-y-2">
          {rows.map((row, r) => (
            <div key={r} className="flex items-center gap-2">
              <span className="hidden w-14 shrink-0 text-[11px] font-semibold text-muted sm:block">
                {layout.unit} {r + 1}
              </span>
              <div className="flex gap-1">
                {row.map((seat, i) => {
                  const isBooked = booked.has(seat);
                  const isSelected = selected.includes(seat);
                  const berth = berthOf(classCode, seat);
                  return (
                    <button
                      key={seat}
                      type="button"
                      disabled={isBooked || (full && !isSelected)}
                      aria-pressed={isSelected}
                      aria-label={`Seat ${seat}, ${berth.long}${isBooked ? ', booked' : ''}`}
                      onClick={() => onToggle(seat)}
                      className={`flex h-11 w-8 shrink-0 flex-col items-center justify-center rounded-sm border text-xs font-bold transition-[background-color,border-color,transform] duration-150 active:scale-95 sm:w-9 ${
                        i === layout.aisleAfter ? 'ml-3' : ''
                      } ${
                        isBooked
                          ? 'cursor-not-allowed border-transparent bg-line text-muted/70'
                          : isSelected
                            ? 'border-navy-700 bg-navy-700 text-white'
                            : 'border-navy-100 bg-surface text-ink hover:border-navy-600 disabled:cursor-not-allowed disabled:opacity-50'
                      }`}
                    >
                      <span className="leading-none tabular">{seat}</span>
                      <span className="mt-0.5 text-[9px] leading-none font-semibold opacity-75">{berth.short}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
