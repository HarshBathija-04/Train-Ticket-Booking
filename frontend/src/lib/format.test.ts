import { describe, expect, it } from 'vitest';
import { addDays, arrivalDayOffset, berthOf, formatDuration, formatINR } from './format';

describe('format helpers', () => {
  it('formats rupees and durations', () => {
    expect(formatINR(2045)).toBe('₹2,045');
    expect(formatDuration(965)).toBe('16h 05m');
  });

  it('detects overnight arrivals', () => {
    expect(arrivalDayOffset('16:30:00', 965)).toBe(1);
    expect(arrivalDayOffset('06:00:00', 505)).toBe(0);
    expect(arrivalDayOffset('11:15:00', 3010)).toBe(2);
  });

  it('maps seat numbers to berths', () => {
    expect(berthOf('SL', 1).short).toBe('LB');
    expect(berthOf('SL', 8).long).toBe('Side upper');
    expect(berthOf('2A', 11).short).toBe('SL');
    expect(berthOf('CC', 5).long).toBe('Window');
  });

  it('adds calendar days across month ends', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
  });
});
