import type { ClassCode } from './types';

export const CLASS_NAMES: Record<ClassCode, string> = {
  '1A': 'First AC',
  '2A': 'AC 2 Tier',
  '3A': 'AC 3 Tier',
  SL: 'Sleeper',
  CC: 'AC Chair Car',
  EC: 'Executive Chair',
};

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const formatINR = (n: number) => inr.format(n);

/** '16:30:00' -> '16:30' */
export const formatTime = (t: string) => t.slice(0, 5);

export const formatDuration = (min: number) => `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, '0')}m`;

/** Days after departure on which the train arrives (0 = same day). */
export function arrivalDayOffset(departureTime: string, durationMin: number) {
  const [h, m] = departureTime.split(':').map(Number);
  return Math.floor((h * 60 + m + durationMin) / 1440);
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...opts,
  });
}

/** Local calendar date as YYYY-MM-DD. */
export function isoDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

/** Coach layout per class: seats per bay/row, where the aisle falls, berth names. */
export const LAYOUTS: Record<ClassCode, { perRow: number; aisleAfter: number; berths: string[]; unit: string }> = {
  SL: { perRow: 8, aisleAfter: 6, berths: ['LB', 'MB', 'UB', 'LB', 'MB', 'UB', 'SL', 'SU'], unit: 'Bay' },
  '3A': { perRow: 8, aisleAfter: 6, berths: ['LB', 'MB', 'UB', 'LB', 'MB', 'UB', 'SL', 'SU'], unit: 'Bay' },
  '2A': { perRow: 6, aisleAfter: 4, berths: ['LB', 'UB', 'LB', 'UB', 'SL', 'SU'], unit: 'Bay' },
  '1A': { perRow: 4, aisleAfter: 4, berths: ['LB', 'UB', 'LB', 'UB'], unit: 'Cabin' },
  CC: { perRow: 5, aisleAfter: 3, berths: ['W', 'M', 'A', 'A', 'W'], unit: 'Row' },
  EC: { perRow: 4, aisleAfter: 2, berths: ['W', 'A', 'A', 'W'], unit: 'Row' },
};

const BERTH_NAMES: Record<string, string> = {
  LB: 'Lower berth',
  MB: 'Middle berth',
  UB: 'Upper berth',
  SL: 'Side lower',
  SU: 'Side upper',
  W: 'Window',
  M: 'Middle',
  A: 'Aisle',
};

export function berthOf(classCode: ClassCode, seatNo: number) {
  const { perRow, berths } = LAYOUTS[classCode];
  const short = berths[(seatNo - 1) % perRow];
  return { short, long: BERTH_NAMES[short] };
}

export const GENDERS = { M: 'Male', F: 'Female', O: 'Other' } as const;
