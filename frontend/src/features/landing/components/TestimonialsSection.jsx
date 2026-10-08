import { useEffect, useState } from 'react';
import { Quote, Star } from 'lucide-react';
import SectionHeading from './SectionHeading.jsx';
import { testimonials } from '../landingContent';

export default function TestimonialsSection() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % testimonials.length), 5500);
    return () => clearInterval(t);
  }, []);

  const t = testimonials[i];

  return (
    <section className="bg-slate-50 px-5 py-24">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="Testimonials" title="Hear it from our residents" />
        <div key={i} className="lp-fade-up relative rounded-3xl bg-white p-10 text-center shadow-xl ring-1 ring-slate-100">
          <Quote className="mx-auto mb-4 text-[#f5b83d]" size={36} />
          <p className="text-lg leading-relaxed text-slate-700">“{t.quote}”</p>
          <div className="mt-5 flex justify-center text-[#f5b83d]">
            {[0, 1, 2, 3, 4].map((n) => (
              <Star key={n} size={16} fill="currentColor" />
            ))}
          </div>
          <p className="lp-display mt-3 font-semibold text-[#0b1b3a]">{t.name}</p>
          <p className="text-sm text-slate-400">{t.role}</p>
        </div>
        <div className="mt-6 flex justify-center gap-2">
          {testimonials.map((_, n) => (
            <button
              key={n}
              onClick={() => setI(n)}
              aria-label={`Show testimonial ${n + 1}`}
              className={`h-2 rounded-full transition-all ${n === i ? 'w-8 bg-[#0b1b3a]' : 'w-2 bg-slate-300'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}