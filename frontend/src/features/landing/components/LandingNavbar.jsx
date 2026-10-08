import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bird, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useScrolled } from '../hooks';
import { brand, navLinks } from '../landingContent';

export default function LandingNavbar() {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${solid ? 'bg-white/95 py-3 text-slate-900 shadow-sm backdrop-blur' : 'bg-transparent py-5 text-white'
        }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5">
        <a href="#home" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5b83d] text-[#0b1b3a]">
            <Bird size={22} />
          </span>
          <span className="leading-none">
            <span className="lp-display block text-lg font-bold">{brand.shortName}</span>
            <span
              className={`block text-[10px] font-semibold uppercase tracking-[0.3em] ${solid ? 'text-slate-500' : 'text-white/70'
                }`}
            >
              Hostel
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium opacity-90 transition hover:text-[#f5b83d] hover:opacity-100">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <Link to="/dashboard" className="lp-btn-gold lp-btn-sm">
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/portal/login"
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${solid ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-white/50 text-white hover:bg-white/15'
                  }`}
              >
                Resident Login
              </Link>
              <a href="#contact" className="lp-btn-gold lp-btn-sm">
                Book a Visit
              </a>
            </>
          )}
        </div>

        <button className="lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-5 pb-5 pt-3 text-slate-900 lg:hidden">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2.5 text-sm font-medium">
              {l.label}
            </a>
          ))}
          <div className="mt-3 flex gap-3">
            <Link to={user ? '/dashboard' : '/portal/login'} className="lp-btn-navy lp-btn-sm flex-1">
              {user ? 'Dashboard' : 'Resident Login'}
            </Link>
            <a href="#contact" onClick={() => setOpen(false)} className="lp-btn-gold lp-btn-sm flex-1">
              Book a Visit
            </a>
          </div>
        </div>
      )}
    </header>
  );
}