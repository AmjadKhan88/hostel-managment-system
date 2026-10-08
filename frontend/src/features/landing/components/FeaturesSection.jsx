import { ShieldCheck, Wifi, UtensilsCrossed, WashingMachine, Zap, BookOpen, Sparkles, Droplets } from 'lucide-react';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';
import { features } from '../landingContent';

const ICONS = {
  shield: ShieldCheck, wifi: Wifi, food: UtensilsCrossed, laundry: WashingMachine,
  power: Zap, study: BookOpen, clean: Sparkles, water: Droplets,
};

export default function FeaturesSection() {
  return (
    <section id="facilities" className="bg-slate-50 px-5 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Why Shaheen"
          title="Everything you need, under one roof"
          subtitle="We handle the essentials so you can focus on what matters — your studies and your future."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = ICONS[f.icon] ?? Sparkles;
            return (
              <Reveal key={f.title} delay={(i % 4) * 80} className="h-full">
                <div className="group h-full rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                  <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0b1b3a] text-[#f5b83d] transition duration-300 group-hover:rotate-6 group-hover:bg-[#f5b83d] group-hover:text-[#0b1b3a]">
                    <Icon size={26} />
                  </span>
                  <h3 className="lp-display text-lg font-semibold text-[#0b1b3a]">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}