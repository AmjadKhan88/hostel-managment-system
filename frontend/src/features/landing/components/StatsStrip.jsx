import { useReveal, useCountUp } from '../hooks';
import { stats } from '../landingContent';

function Stat({ value, suffix, label, decimals }) {
  const [ref, visible] = useReveal();
  const n = useCountUp(value, visible);
  return (
    <div ref={ref} className="text-center">
      <p className="lp-display text-3xl font-bold text-[#0b1b3a] md:text-4xl">
        {decimals ? n.toFixed(1) : Math.round(n)}
        <span className="text-[#f5b83d]">{suffix}</span>
      </p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

export default function StatsStrip() {
  return (
    <section className="relative z-10 mx-auto -mt-16 max-w-5xl px-5">
      <div className="grid grid-cols-2 gap-6 rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-100 md:grid-cols-4">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>
    </section>
  );
}