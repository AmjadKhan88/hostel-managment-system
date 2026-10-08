import { useEffect, useState } from 'react';
import { Phone, Mail, MessageCircle, Send } from 'lucide-react';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';
import { brand, contact, rooms } from '../landingContent';

export default function ContactSection({ inquiryRoom }) {
  const [form, setForm] = useState({ name: '', phone: '', room: rooms[1].name, moveIn: '', message: '' });

  useEffect(() => {
    if (inquiryRoom) setForm((f) => ({ ...f, room: inquiryRoom }));
  }, [inquiryRoom]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const text =
      `Assalam o Alaikum! I'm ${form.name} and I'd like to enquire about the ${form.room} at ${brand.name}.` +
      `${form.moveIn ? ` I'm planning to move in around ${form.moveIn}.` : ''}` +
      `${form.message ? ` ${form.message}` : ''} My phone number is ${form.phone}.`;
    window.open(`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#f5b83d] focus:ring-2 focus:ring-[#f5b83d]/30';

  return (
    <section id="contact" className="bg-slate-50 px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Book a Visit"
          title="Let's find your perfect room"
          subtitle="Send us your details and we'll reply on WhatsApp with availability and a visit time."
        />

        <div className="grid gap-8 lg:grid-cols-5">
          <Reveal className="space-y-4 lg:col-span-2">
            {[
              { icon: Phone, label: 'Call us', value: contact.phoneDisplay, href: `tel:${contact.phoneTel}` },
              { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with us now', href: `https://wa.me/${contact.whatsapp}` },
              { icon: Mail, label: 'Email', value: contact.email, href: `mailto:${contact.email}` },
            ].map(({ icon: Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0b1b3a] text-[#f5b83d]">
                  <Icon size={20} />
                </span>
                <div>
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="font-semibold text-[#0b1b3a]">{value}</p>
                </div>
              </a>
            ))}
          </Reveal>

          <Reveal delay={120} className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100">
              <div className="grid gap-4 sm:grid-cols-2">
                <input required placeholder="Your name" value={form.name} onChange={set('name')} className={inputCls} />
                <input required type="tel" placeholder="Phone number" value={form.phone} onChange={set('phone')} className={inputCls} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <select value={form.room} onChange={set('room')} className={inputCls}>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <input type="date" value={form.moveIn} onChange={set('moveIn')} className={inputCls} aria-label="Expected move-in date" />
              </div>
              <textarea rows={3} placeholder="Anything else we should know? (optional)" value={form.message} onChange={set('message')} className={inputCls} />
              <button type="submit" className="lp-btn-navy w-full">
                <Send size={17} /> Send enquiry on WhatsApp
              </button>
              <p className="text-center text-xs text-slate-400">This opens WhatsApp with your message ready to send.</p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}