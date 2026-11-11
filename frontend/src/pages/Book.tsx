import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Armchair, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { RouteLine } from '../components/RouteLine';
import { SeatMap } from '../components/SeatMap';
import { EmptyState, ErrorState, Field, FieldError, Skeleton } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { berthOf, CLASS_NAMES, formatDate, formatINR, GENDERS, searchUrl } from '../lib/format';
import type { Booking, ClassCode, Gender, Schedule, SeatMapData } from '../lib/types';

const MAX_PASSENGERS = 6;
interface Draft {
  seatNo: number;
  name: string;
  age: string;
  gender: Gender | '';
}

export default function Book() {
  const { scheduleId, classCode } = useParams() as { scheduleId: string; classCode: ClassCode };
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const schedule = useQuery({
    queryKey: ['schedule', scheduleId],
    queryFn: () => api<{ schedule: Schedule }>(`/api/schedules/${scheduleId}`).then((r) => r.schedule),
  });
  const seats = useQuery({
    queryKey: ['seats', scheduleId, classCode],
    queryFn: () => api<SeatMapData>(`/api/schedules/${scheduleId}/classes/${classCode}/seats`),
    refetchInterval: 20_000,
  });

  const book = useMutation({
    mutationFn: (body: unknown) => api<{ booking: Booking }>('/api/bookings', { method: 'POST', body }),
    onSuccess: ({ booking }) => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['search'] });
      qc.setQueryData(['booking', booking.pnr], booking);
      toast.success(`Booking confirmed · PNR ${booking.pnr}`);
      navigate(`/bookings/${booking.pnr}`, { state: { fresh: true } });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Booking failed, please try again');
      if (err instanceof ApiError && err.status === 409) {
        // someone else got there first: refresh the map and drop seats that are gone
        seats.refetch().then(({ data }) => {
          if (data) setDrafts((ds) => ds.filter((d) => !data.booked.includes(d.seatNo)));
        });
      }
    },
  });

  if (schedule.isPending || seats.isPending) {
    return (
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_22rem]" aria-busy="true">
        <Skeleton className="h-[32rem]" />
        <Skeleton className="h-72" />
      </div>
    );
  }
  if (schedule.isError || seats.isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState error={schedule.error ?? seats.error} onRetry={() => (schedule.refetch(), seats.refetch())} />
      </div>
    );
  }

  const s = schedule.data;
  const cls = s.classes.find((c) => c.classCode === classCode);
  if (!cls) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          icon={Armchair}
          title="Class not available"
          action={
            <Link className="btn-primary" to="/">
              New search
            </Link>
          }
        >
          {s.trainName} does not run a {classCode} coach.
        </EmptyState>
      </div>
    );
  }
  const booked = new Set(seats.data.booked);
  const total = cls.fare * drafts.length;

  const toggleSeat = (seat: number) =>
    setDrafts((ds) =>
      ds.some((d) => d.seatNo === seat)
        ? ds.filter((d) => d.seatNo !== seat)
        : [...ds, { seatNo: seat, name: ds.length === 0 ? (user?.name ?? '') : '', age: '', gender: '' }],
    );
  const update = (seat: number, patch: Partial<Draft>) => {
    setDrafts((ds) => ds.map((d) => (d.seatNo === seat ? { ...d, ...patch } : d)));
    const key = `${seat}-${Object.keys(patch)[0]}`; // clear the error of the field being fixed
    setErrors((errs) => Object.fromEntries(Object.entries(errs).filter(([k]) => k !== key)));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    drafts.forEach((d) => {
      if (d.name.trim().length < 2) errs[`${d.seatNo}-name`] = 'Enter the name on their ID';
      const age = Number(d.age);
      if (!Number.isInteger(age) || age < 1 || age > 120) errs[`${d.seatNo}-age`] = 'Age 1 to 120';
      if (!d.gender) errs[`${d.seatNo}-gender`] = 'Choose one';
    });
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`p-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    book.mutate({
      scheduleId: s.scheduleId,
      classCode,
      passengers: drafts.map((d) => ({ name: d.name.trim(), age: Number(d.age), gender: d.gender, seatNo: d.seatNo })),
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to={searchUrl(s.from, s.to, s.journeyDate)}
        className="text-sm font-semibold text-navy-700 underline-offset-4 hover:underline"
      >
        ← Back to results
      </Link>
      <div className="mt-3 mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {s.trainName} <span className="font-mono text-lg text-muted">#{s.trainNumber}</span>
          </h1>
          <p className="text-muted">
            {CLASS_NAMES[classCode]} ({classCode}) · {formatDate(s.journeyDate, { year: 'numeric' })}
          </p>
        </div>
        <p className="text-sm font-semibold text-go-700 tabular">{seats.data.availableSeats} seats free</p>
      </div>

      <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="space-y-6">
          <section className="card p-4 sm:p-5" aria-labelledby="seat-title">
            <h2 id="seat-title" className="mb-1 text-lg font-bold">
              1. Choose seats
            </h2>
            <p className="mb-4 text-sm text-muted">
              Tap up to {MAX_PASSENGERS} seats. Each seat adds a passenger below.
            </p>
            <SeatMap
              classCode={classCode}
              totalSeats={seats.data.totalSeats}
              booked={booked}
              selected={drafts.map((d) => d.seatNo)}
              max={MAX_PASSENGERS}
              onToggle={toggleSeat}
            />
          </section>

          <section className="card p-4 sm:p-5" aria-labelledby="pax-title">
            <h2 id="pax-title" className="mb-4 text-lg font-bold">
              2. Passenger details
            </h2>
            {drafts.length === 0 ? (
              <p className="rounded-md border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
                Pick a seat on the coach map to add a passenger.
              </p>
            ) : (
              <ol className="space-y-4">
                {drafts.map((d, i) => {
                  const berth = berthOf(classCode, d.seatNo);
                  const err = (f: string) => errors[`${d.seatNo}-${f}`];
                  return (
                    <li key={d.seatNo} className="animate-enter rounded-md border border-line p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="font-semibold">
                          Passenger {i + 1}{' '}
                          <span className="ml-1 rounded-sm bg-navy-50 px-1.5 py-0.5 font-mono text-xs text-navy-700">
                            Seat {d.seatNo} · {berth.long}
                          </span>
                        </p>
                        <button
                          type="button"
                          className="btn size-10 px-0 text-muted hover:bg-stop-50 hover:text-stop-700"
                          aria-label={`Remove passenger ${i + 1}`}
                          onClick={() => toggleSeat(d.seatNo)}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-[1fr_6rem_8rem]">
                        <Field
                          id={`p-${d.seatNo}-name`}
                          label="Full name"
                          autoComplete="name"
                          value={d.name}
                          maxLength={100}
                          error={err('name')}
                          onChange={(e) => update(d.seatNo, { name: e.target.value })}
                        />
                        <Field
                          id={`p-${d.seatNo}-age`}
                          label="Age"
                          inputMode="numeric"
                          value={d.age}
                          error={err('age')}
                          onChange={(e) => update(d.seatNo, { age: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                        />
                        <div>
                          <label className="label" htmlFor={`p-${d.seatNo}-gender`}>
                            Gender
                          </label>
                          <select
                            id={`p-${d.seatNo}-gender`}
                            className="field"
                            value={d.gender}
                            aria-invalid={!!err('gender') || undefined}
                            aria-describedby={err('gender') ? `p-${d.seatNo}-gender-err` : undefined}
                            onChange={(e) => update(d.seatNo, { gender: e.target.value as Gender })}
                          >
                            <option value="">Select</option>
                            {Object.entries(GENDERS).map(([k, v]) => (
                              <option key={k} value={k}>
                                {v}
                              </option>
                            ))}
                          </select>
                          <FieldError id={`p-${d.seatNo}-gender`} error={err('gender')} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>

        <aside className="card p-4 sm:p-5 lg:sticky lg:top-6" aria-labelledby="summary-title">
          <h2 id="summary-title" className="mb-4 text-lg font-bold">
            Journey summary
          </h2>
          <RouteLine {...s} />
          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Fare per passenger</dt>
              <dd className="font-semibold tabular">{formatINR(cls.fare)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Passengers</dt>
              <dd className="font-semibold tabular">{drafts.length}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base">
              <dt className="font-bold">Total</dt>
              <dd className="font-extrabold tabular">{formatINR(total)}</dd>
            </div>
          </dl>
          <button type="submit" className="btn-accent mt-5 w-full" disabled={drafts.length === 0 || book.isPending}>
            {book.isPending ? 'Confirming seats…' : drafts.length ? `Pay ${formatINR(total)} & book` : 'Select a seat'}
          </button>
          <p className="mt-3 text-center text-xs text-muted">Demo checkout: payment is simulated.</p>
        </aside>
      </form>
    </div>
  );
}
