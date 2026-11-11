import { randomInt } from 'node:crypto';
import { HttpError } from './errors.js';

const conflict = (code: string, message: string) => new HttpError(409, code, message);

/**
 * Resolve the seat for every passenger: requested seats must be valid and free,
 * passengers without a preference get the lowest free seats.
 */
export function assignSeats(requested: (number | undefined)[], totalSeats: number, booked: Iterable<number>): number[] {
  const taken = new Set(booked);
  const chosen = requested.filter((s): s is number => s !== undefined);
  if (new Set(chosen).size !== chosen.length) throw conflict('SEAT_INVALID', 'The same seat was selected twice');
  for (const seat of chosen) {
    if (seat < 1 || seat > totalSeats) throw conflict('SEAT_INVALID', `Seat ${seat} does not exist`);
    if (taken.has(seat)) throw conflict('SEAT_TAKEN', `Seat ${seat} was just booked by someone else`);
    taken.add(seat);
  }
  let next = 1;
  return requested.map((seat) => {
    if (seat !== undefined) return seat;
    while (taken.has(next)) next++;
    if (next > totalSeats) throw conflict('NOT_ENOUGH_SEATS', 'Not enough seats left in this class');
    taken.add(next);
    return next;
  });
}

// shortcut: random PNR without a retry loop; 1-in-9e9 collision per booking surfaces as a 409, add a retry if volume grows
export function generatePnr(): string {
  return String(randomInt(1_000_000_000, 10_000_000_000));
}
