export const BOOKING_WINDOW_DAYS = 60;

/** Today's date in India (YYYY-MM-DD); trains run on IST regardless of server TZ. */
export function todayIST(now = new Date()): string {
  return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isBookableDate(date: string, today = todayIST()): boolean {
  return date >= today && date <= addDays(today, BOOKING_WINDOW_DAYS);
}
