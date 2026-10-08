import Reveal from './Reveal.jsx';

export default function SectionHeading({ eyebrow, title, subtitle, light = false }) {
  return (
    <Reveal className="mx-auto mb-12 max-w-2xl text-center">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#f5b83d]">{eyebrow}</p>
      <h2 className={`lp-display text-3xl font-bold md:text-4xl ${light ? 'text-white' : 'text-[#0b1b3a]'}`}>{title}</h2>
      {subtitle && <p className={`mt-4 text-base ${light ? 'text-white/70' : 'text-slate-500'}`}>{subtitle}</p>}
    </Reveal>
  );
}