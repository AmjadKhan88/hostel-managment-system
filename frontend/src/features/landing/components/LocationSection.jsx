import { MapPin, Navigation, ExternalLink, Clock, Phone } from 'lucide-react';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';
import { contact, mapConfig, landmarks } from '../landingContent';

const hasCoords = mapConfig.lat != null && mapConfig.lng != null;
const destination = hasCoords ? `${mapConfig.lat},${mapConfig.lng}` : mapConfig.query;

const embedSrc =
  mapConfig.embedUrl || `https://www.google.com/maps?q=${encodeURIComponent(destination)}&output=embed`;
const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
const openUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;

export default function LocationSection() {
  return (
    <section id="location" className="px-5 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Find Us"
          title="Right where you need to be"
          subtitle="Close to campus, markets and transport — see us live on the map."
        />

        <div className="grid gap-8 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <div className="h-full rounded-3xl bg-[#0b1b3a] p-8 text-white shadow-xl">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f5b83d] text-[#0b1b3a]">
                  <MapPin size={20} />
                </span>
                <div>
                  <p className="lp-display font-semibold">Shaheen Hostel</p>
                  <p className="mt-1 text-sm text-white/70">{contact.address}</p>
                </div>
              </div>

              <div className="mt-5 space-y-2 text-sm text-white/75">
                <p className="flex items-center gap-2"><Clock size={15} className="text-[#f5b83d]" /> {contact.hours}</p>
                <p className="flex items-center gap-2"><Phone size={15} className="text-[#f5b83d]" /> {contact.phoneDisplay}</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="lp-btn-gold lp-btn-sm">
                  <Navigation size={15} /> Get Directions
                </a>
                <a href={openUrl} target="_blank" rel="noopener noreferrer" className="lp-btn-ghost lp-btn-sm">
                  <ExternalLink size={15} /> Open in Maps
                </a>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/50">Nearby</p>
                <ul className="space-y-2.5">
                  {landmarks.map((l) => (
                    <li key={l.name} className="flex items-center justify-between text-sm">
                      <span className="text-white/80">{l.name}</span>
                      <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs text-[#f5b83d]">{l.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-3">
            <div className="relative h-[420px] overflow-hidden rounded-3xl shadow-xl ring-1 ring-slate-200 lg:h-full lg:min-h-[480px]">
              <iframe
                title="Shaheen Hostel location on Google Maps"
                src={embedSrc}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}