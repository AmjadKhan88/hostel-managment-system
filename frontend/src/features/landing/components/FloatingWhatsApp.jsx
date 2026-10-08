import { MessageCircle } from 'lucide-react';
import { contact } from '../landingContent';

export default function FloatingWhatsApp() {
  return (
    <a
      href={`https://wa.me/${contact.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="lp-pulse fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-xl transition hover:scale-110"
    >
      <MessageCircle size={26} />
    </a>
  );
}