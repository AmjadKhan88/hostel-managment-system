import { Link } from 'react-router-dom';
import { Bird, Facebook, Instagram } from 'lucide-react';
import { brand, contact, navLinks } from '../landingContent';

export default function LandingFooter() {
  return (
    <footer className="bg-[#0b1b3a] px-5 pb-8 pt-16 text-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5b83d] text-[#0b1b3a]">
              <Bird size={22} />
            </span>
            <span className="lp-display text-lg font-bold">{brand.name}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm">{brand.description}</p>
          <div className="mt-5 flex gap-3">
            <a href={contact.facebook} aria-label="Facebook" className="rounded-full bg-white/10 p-2.5 transition hover:bg-[#f5b83d] hover:text-[#0b1b3a]">
              <Facebook size={17} />
            </a>
            <a href={contact.instagram} aria-label="Instagram" className="rounded-full bg-white/10 p-2.5 transition hover:bg-[#f5b83d] hover:text-[#0b1b3a]">
              <Instagram size={17} />
            </a>
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold text-white">Explore</p>
          <ul className="space-y-2 text-sm">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition hover:text-[#f5b83d]">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold text-white">Access</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/portal/login" className="transition hover:text-[#f5b83d]">Resident Portal</Link></li>
            <li><Link to="/login" className="transition hover:text-[#f5b83d]">Staff Login</Link></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-6 text-center text-xs">
        © {new Date().getFullYear()} {brand.name}. All rights reserved.
      </div>
    </footer>
  );
}