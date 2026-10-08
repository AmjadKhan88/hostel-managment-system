import { useEffect, useState } from 'react';
import '@/features/landing/landing.css';
import LandingNavbar from '@/features/landing/components/LandingNavbar.jsx';
import HeroSection from '@/features/landing/components/HeroSection.jsx';
import StatsStrip from '@/features/landing/components/StatsStrip.jsx';
import FeaturesSection from '@/features/landing/components/FeaturesSection.jsx';
import RoomsSection from '@/features/landing/components/RoomsSection.jsx';
import FoodSection from '@/features/landing/components/FoodSection.jsx';
import GallerySection from '@/features/landing/components/GallerySection.jsx';
import TestimonialsSection from '@/features/landing/components/TestimonialsSection.jsx';
import LocationSection from '@/features/landing/components/LocationSection.jsx';
import ContactSection from '@/features/landing/components/ContactSection.jsx';
import LandingFooter from '@/features/landing/components/LandingFooter.jsx';
import FloatingWhatsApp from '@/features/landing/components/FloatingWhatsApp.jsx';
import { brand, contact, mapConfig, heroSlides } from '@/features/landing/landingContent';

function buildJsonLd() {
  const hasCoords = mapConfig.lat != null && mapConfig.lng != null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Hostel',
    name: brand.name,
    description: brand.description,
    url: window.location.origin,
    image: heroSlides[0].src,
    telephone: contact.phoneTel,
    email: contact.email,
    priceRange: 'PKR',
    address: { '@type': 'PostalAddress', streetAddress: contact.address, addressCountry: 'PK' },
    ...(hasCoords && { geo: { '@type': 'GeoCoordinates', latitude: mapConfig.lat, longitude: mapConfig.lng } }),
    sameAs: [contact.facebook, contact.instagram].filter((u) => u && u !== '#'),
  };
}

function setMeta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

export default function LandingPage() {
  const [inquiryRoom, setInquiryRoom] = useState('');

  useEffect(() => {
    document.documentElement.classList.add('lp-smooth');
    return () => document.documentElement.classList.remove('lp-smooth');
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${brand.name} — ${brand.seoTitleSuffix}`;
    setMeta('name', 'description', brand.description);
    setMeta('property', 'og:title', document.title);
    setMeta('property', 'og:description', brand.description);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:image', heroSlides[0].src);

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(buildJsonLd());
    document.head.appendChild(script);

    return () => {
      document.title = previousTitle;
      script.remove();
    };
  }, []);

  const handleEnquire = (roomName) => {
    setInquiryRoom(roomName);
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing overflow-x-hidden bg-white text-slate-900">
      <LandingNavbar />
      <main>
        <HeroSection />
        <StatsStrip />
        <FeaturesSection />
        <RoomsSection onEnquire={handleEnquire} />
        <FoodSection />
        <GallerySection />
        <TestimonialsSection />
        <LocationSection />
        <ContactSection inquiryRoom={inquiryRoom} />
      </main>
      <LandingFooter />
      <FloatingWhatsApp />
    </div>
  );
}