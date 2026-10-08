import { useEffect, useState } from 'react';
import { ArrowRight, Star, Wifi, ShieldCheck, UtensilsCrossed } from 'lucide-react';
import SafeImage from './SafeImage.jsx';
import { brand, heroSlides, heroWords } from '../landingContent';

const FLOATING_CARDS = [
  { icon: Wifi, title: 'Free High-Speed WiFi', sub: 'In every room', cls: 'lp-float' },
  { icon: ShieldCheck, title: '24/7 Security', sub: 'CCTV & guarded gate', cls: 'lp-float-slow ml-10' },
  { icon: UtensilsCrossed, title: '3 Fresh Meals Daily', sub: 'Home-style cooking', cls: 'lp-float' },
];

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const [word, setWord] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % heroSlides.length), 6500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setWord((i) => (i + 1) % heroWords.length), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="home" className="relative min-h-screen overflow-hidden bg-[#0b1b3a] text-white">
      {heroSlides.map((s, i) => (
        <div key={s.src} className={`lp-slide absolute inset-0 ${i === active ? 'is-active' : ''}`}>
          <SafeImage src={s.src} alt={s.alt} loading={i === 0 ? 'eager' : 'lazy'} className="h-full w-full object-cover" />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b1b3a]/95 via-[#0b1b3a]/65 to-[#0b1b3a]/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1b3a] via-transparent to-transparent" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-between gap-10 px-5 pb-36 pt-32">
        <div className="max-w-2xl">
          <span className="lp-fade-up inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Admissions open — limited beds available
          </span>

          <h1 className="lp-display lp-fade-up mt-6 text-4xl font-extrabold leading-[1.1] md:text-6xl" style={{ animationDelay: '0.1s' }}>
            Live <span key={word} className="lp-word-in lp-gold-text">{heroWords[word]}</span>
            <br />
            at {brand.name}
          </h1>

          <p className="lp-fade-up mt-6 max-w-xl text-base text-white/80 md:text-lg" style={{ animationDelay: '0.25s' }}>
            {brand.tagline}. Safe rooms, delicious meals, blazing-fast WiFi and a friendly community — everything a
            student needs to focus, relax and thrive.
          </p>

          <div className="lp-fade-up mt-8 flex flex-wrap gap-4" style={{ animationDelay: '0.4s' }}>
            <a href="#contact" className="lp-btn-gold">
              Book a Visit <ArrowRight size={18} />
            </a>
            <a href="#rooms" className="lp-btn-ghost">
              Explore Rooms
            </a>
          </div>

          <div className="lp-fade-up mt-10 flex items-center gap-3 text-sm text-white/80" style={{ animationDelay: '0.55s' }}>
            <div className="flex text-[#f5b83d]">
              {[0, 1, 2, 3, 4].map((n) => (
                <Star key={n} size={16} fill="currentColor" />
              ))}
            </div>
            <span>Rated 4.8/5 by 250+ residents</span>
          </div>
        </div>

        <div className="hidden w-72 shrink-0 space-y-4 lg:block">
          {FLOATING_CARDS.map(({ icon: Icon, title, sub, cls }) => (
            <div key={title} className={`${cls} flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md`}>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5b83d] text-[#0b1b3a]">
                <Icon size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-white/70">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-24 left-1/2 hidden -translate-x-1/2 md:block">
        <div className="flex h-9 w-6 justify-center rounded-full border-2 border-white/50 pt-1.5">
          <span className="lp-scroll-dot h-1.5 w-1.5 rounded-full bg-white" />
        </div>
      </div>

      <div className="absolute bottom-24 right-6 flex items-center gap-2 md:right-10">
        {heroSlides.map((s, i) => (
          <button
            key={s.src}
            onClick={() => setActive(i)}
            aria-label={`Show slide ${i + 1}: ${s.caption}`}
            className={`h-1.5 rounded-full transition-all ${i === active ? 'w-8 bg-[#f5b83d]' : 'w-3 bg-white/50'}`}
          />
        ))}
      </div>
    </section>
  );
}