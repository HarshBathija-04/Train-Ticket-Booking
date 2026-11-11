import { Armchair, Ticket, Undo2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SearchForm } from '../components/SearchForm';
import { addDays, isoDate } from '../lib/format';

const popular = [
  { from: ['NDLS', 'New Delhi', 'Delhi'], to: ['BCT', 'Mumbai Central', 'Mumbai'], train: 'Rajdhani', time: '16:30' },
  {
    from: ['MAS', 'MGR Chennai Central', 'Chennai'],
    to: ['SBC', 'KSR Bengaluru City', 'Bengaluru'],
    train: 'Shatabdi',
    time: '06:00',
  },
  {
    from: ['NDLS', 'New Delhi', 'Delhi'],
    to: ['BSB', 'Varanasi Junction', 'Varanasi'],
    train: 'Vande Bharat',
    time: '06:00',
  },
  {
    from: ['BCT', 'Mumbai Central', 'Mumbai'],
    to: ['ADI', 'Ahmedabad Junction', 'Ahmedabad'],
    train: 'Shatabdi',
    time: '06:25',
  },
  { from: ['NDLS', 'New Delhi', 'Delhi'], to: ['JP', 'Jaipur Junction', 'Jaipur'], train: 'Shatabdi', time: '06:10' },
  { from: ['CSMT', 'CSMT', 'Mumbai'], to: ['PUNE', 'Pune Junction', 'Pune'], train: 'Deccan Queen', time: '17:10' },
] as const;

const perks = [
  {
    icon: Armchair,
    title: 'Pick your exact berth',
    text: 'A live coach map shows which lowers and windows are still free.',
  },
  {
    icon: Ticket,
    title: 'PNR in seconds',
    text: 'Seats are locked the moment you confirm, so two people never get the same berth.',
  },
  {
    icon: Undo2,
    title: 'Cancel in one tap',
    text: 'Plans changed? Cancel any upcoming journey and the seats go back on sale.',
  },
];

export default function Home() {
  const tomorrow = addDays(isoDate(), 1);
  return (
    <>
      <section className="relative overflow-hidden bg-navy-900 text-white">
        {/* rail tracks motif */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 [background-image:repeating-linear-gradient(90deg,transparent_0_22px,rgb(255_255_255/0.5)_22px_26px)] [mask-image:linear-gradient(to_top,black,transparent)] opacity-25"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pt-12 pb-16 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:pt-16 lg:pb-20">
          <div>
            <p className="mb-3 font-mono text-xs font-bold tracking-[0.2em] text-marigold-400 uppercase">
              30 trains · 19 cities · 60-day booking window
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Train tickets across India, booked in a minute.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white/80">
              Search Rajdhani, Shatabdi and Vande Bharat services, choose your berth and leave with a confirmed PNR.
            </p>
            <div className="mt-8 rounded-xl bg-surface p-4 text-ink shadow-pop sm:p-6">
              <SearchForm />
            </div>
          </div>

          <aside aria-labelledby="board-title" className="rounded-xl border border-white/10 bg-black/25 p-4 sm:p-5">
            <h2
              id="board-title"
              className="mb-3 flex items-center justify-between font-mono text-xs font-bold tracking-[0.18em] text-marigold-400 uppercase"
            >
              Popular departures
              <span className="text-white/60">Tomorrow</span>
            </h2>
            <ul className="divide-y divide-white/10">
              {popular.map((p) => (
                <li key={p.from[0] + p.to[0]}>
                  <Link
                    to={`/search?${new URLSearchParams({ from: p.from[0], to: p.to[0], date: tomorrow, fn: p.from[2], tn: p.to[2] })}`}
                    className="group grid grid-cols-[3.25rem_1fr_auto] items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-white/8"
                  >
                    <span className="font-mono text-sm font-bold text-marigold-400 tabular">{p.time}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {p.from[2]} → {p.to[2]}
                      </span>
                      <span className="block truncate text-xs text-white/65">{p.train}</span>
                    </span>
                    <span className="font-mono text-xs text-white/70 group-hover:text-white">
                      {p.from[0]}–{p.to[0]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section aria-label="Why RailDesk" className="mx-auto grid max-w-6xl gap-4 px-4 py-14 sm:grid-cols-3">
        {perks.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-md bg-marigold-100 text-marigold-700">
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-bold">{title}</h2>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
