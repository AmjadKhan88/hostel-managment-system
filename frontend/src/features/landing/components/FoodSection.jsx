import { useState } from 'react';
import { Sunrise, Sun, Moon, Clock, Leaf } from 'lucide-react';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';
import SafeImage from './SafeImage.jsx';
import { meals, foodPerks, marqueeDishes } from '../landingContent';

const ICONS = { sunrise: Sunrise, sun: Sun, moon: Moon };

export default function FoodSection() {
  const [activeId, setActiveId] = useState(meals[0].id);
  const meal = meals.find((m) => m.id === activeId);
  const loop = [...marqueeDishes, ...marqueeDishes];

  return (
    <section id="food" className="relative overflow-hidden bg-[#0b1b3a] py-24 text-white">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeading
          light
          eyebrow="Food & Mess"
          title="Home-style meals, three times a day"
          subtitle="Freshly cooked in a clean kitchen with a menu that rotates every week — so you never get bored."
        />

        <Reveal className="mb-10 flex flex-wrap justify-center gap-3">
          {meals.map((m) => {
            const Icon = ICONS[m.icon];
            return (
              <button
                key={m.id}
                onClick={() => setActiveId(m.id)}
                className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${activeId === m.id ? 'bg-[#f5b83d] text-[#0b1b3a] shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
              >
                <Icon size={17} /> {m.label}
              </button>
            );
          })}
        </Reveal>

        <p className="mb-8 flex items-center justify-center gap-2 text-sm text-white/70">
          <Clock size={15} /> Served {meal.time}
        </p>

        <div key={meal.id} className="grid gap-6 md:grid-cols-3">
          {meal.dishes.map((d, i) => (
            <article
              key={d.name}
              className="lp-fade-up group overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 transition duration-300 hover:-translate-y-2 hover:bg-white/10"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="h-52 overflow-hidden">
                <SafeImage src={d.image} alt={d.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              </div>
              <div className="p-6">
                <h3 className="lp-display text-lg font-semibold">{d.name}</h3>
                <p className="mt-1.5 text-sm text-white/65">{d.desc}</p>
              </div>
            </article>
          ))}
        </div>

        <Reveal className="mt-10 flex flex-wrap justify-center gap-3">
          {foodPerks.map((p) => (
            <span key={p} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-white/80">
              <Leaf size={13} className="text-emerald-400" /> {p}
            </span>
          ))}
        </Reveal>
      </div>

      <div className="mt-16 overflow-hidden border-y border-white/10 py-5">
        <div className="lp-marquee" aria-hidden="true">
          {loop.map((d, i) => (
            <span key={`${d}-${i}`} className="lp-display mx-6 whitespace-nowrap text-2xl font-semibold text-white/25">
              {d} <span className="mx-6 text-[#f5b83d]">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}