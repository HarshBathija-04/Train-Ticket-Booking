import { describe, expect, it } from 'vitest';
import { addDays, isBookableDate, todayIST } from '../src/lib/dates.js';
import { assignSeats, generatePnr } from '../src/lib/seats.js';

describe('assignSeats', () => {
  it('auto-assigns the lowest free seats', () => {
    expect(assignSeats([undefined, undefined], 10, [1, 3])).toEqual([2, 4]);
  });
  it('honours requested seats and fills the rest around them', () => {
    expect(assignSeats([5, undefined, undefined], 10, [1])).toEqual([5, 2, 3]);
  });
  it('rejects a seat that is already taken', () => {
    expect(() => assignSeats([3], 10, [3])).toThrow(/just booked/);
  });
  it('rejects duplicate and out-of-range seats', () => {
    expect(() => assignSeats([2, 2], 10, [])).toThrow(/twice/);
    expect(() => assignSeats([11], 10, [])).toThrow(/does not exist/);
  });
  it('fails when the class is full', () => {
    expect(() => assignSeats([undefined, undefined], 2, [1])).toThrow(/Not enough seats/);
  });
});

describe('dates', () => {
  it('only allows today up to the booking window', () => {
    const today = todayIST();
    expect(isBookableDate(today, today)).toBe(true);
    expect(isBookableDate(addDays(today, -1), today)).toBe(false);
    expect(isBookableDate(addDays(today, 61), today)).toBe(false);
  });
  it('generates 10 digit PNRs', () => {
    expect(generatePnr()).toMatch(/^[1-9]\d{9}$/);
  });
});
