import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';
import SafeImage from './SafeImage.jsx';
import { gallery } from '../landingContent';

export default function GallerySection() {
  const [index, setIndex] = useState(null);

  useEffect(() => {
    if (index === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setIndex(null);
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % gallery.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + gallery.length) % gallery.length);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [index]);

  const step = (dir) => setIndex((i) => (i + dir + gallery.length) % gallery.length);

  return (
    <section id="gallery" className="px-5 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Gallery" title="A look around Shaheen Hostel" subtitle="Tap any photo to view it full size." />

        <div className="grid auto-rows-[170px] grid-cols-2 gap-4 md:grid-cols-4">
          {gallery.map((g, i) => (
            <Reveal key={g.src + i} delay={(i % 3) * 80} className={`h-full ${g.className}`}>
              <button
                onClick={() => setIndex(i)}
                className="group relative h-full w-full overflow-hidden rounded-2xl"
                aria-label={`Open photo: ${g.alt}`}
              >
                <SafeImage src={g.src} alt={g.alt} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                <span className="absolute inset-0 flex items-center justify-center bg-[#0b1b3a]/0 opacity-0 transition group-hover:bg-[#0b1b3a]/50 group-hover:opacity-100">
                  <ZoomIn className="text-white" size={26} />
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {index !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" onClick={() => setIndex(null)}>
          <button onClick={() => setIndex(null)} className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Close">
            <X size={22} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); step(-1); }}
            className="absolute left-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            aria-label="Previous photo"
          >
            <ChevronLeft size={24} />
          </button>
          <img
            src={gallery[index].src}
            alt={gallery[index].alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain"
          />
          <button
            onClick={(e) => { e.stopPropagation(); step(1); }}
            className="absolute right-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            aria-label="Next photo"
          >
            <ChevronRight size={24} />
          </button>
          <p className="absolute bottom-6 text-sm text-white/70">{gallery[index].alt}</p>
        </div>
      )}
    </section>
  );
}