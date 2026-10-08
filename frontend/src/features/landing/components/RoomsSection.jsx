import { useState } from 'react';
import { Users, ArrowRight, Check } from 'lucide-react';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';
import SafeImage from './SafeImage.jsx';
import { rooms } from '../landingContent';

const FILTERS = [
  { id: 'all', label: 'All rooms' },
  { id: 'private', label: 'Private' },
  { id: 'shared', label: 'Shared' },
];

export default function RoomsSection({ onEnquire }) {
  const [filter, setFilter] = useState('all');
  const list = rooms.filter((r) => filter === 'all' || r.category === filter);

  return (
    <section id="rooms" className="px-5 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Our Rooms"
          title="Find the room that fits you"
          subtitle="From private singles to budget-friendly dorms — hover a room to peek inside."
        />

        <Reveal className="mb-10 flex justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${filter === f.id ? 'bg-[#0b1b3a] text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {f.label}
            </button>
          ))}
        </Reveal>

        <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-4">
          {list.map((r, i) => (
            <Reveal key={r.id} delay={i * 90} className="h-full">
              <article className="lp-room flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-100">
                <div className="relative h-56 overflow-hidden">
                  <SafeImage src={r.images[0]} alt={`${r.name} interior`} className="lp-img-a absolute inset-0 h-full w-full object-cover" />
                  <SafeImage src={r.images[1]} alt={`${r.name} detail`} className="lp-img-b absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#0b1b3a]">
                    <Users size={13} /> Sleeps {r.sleeps}
                  </span>
                  {r.popular && (
                    <span className="absolute right-4 top-4 rounded-full bg-[#f5b83d] px-3 py-1 text-xs font-bold text-[#0b1b3a]">
                      Most popular
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="lp-display text-lg font-semibold text-[#0b1b3a]">{r.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{r.blurb}</p>
                  <ul className="mt-4 space-y-1.5">
                    {r.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check size={14} className="text-emerald-500" /> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex items-end justify-between pt-6">
                    <div>
                      <p className="text-xs text-slate-400">From</p>
                      <p className="lp-display text-xl font-bold text-[#0b1b3a]">
                        Rs {r.price.toLocaleString('en-PK')}
                        <span className="text-xs font-medium text-slate-400"> /bed/month</span>
                      </p>
                    </div>
                    <button
                      onClick={() => onEnquire(r.name)}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0b1b3a] text-white transition hover:bg-[#f5b83d] hover:text-[#0b1b3a]"
                      aria-label={`Enquire about ${r.name}`}
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}