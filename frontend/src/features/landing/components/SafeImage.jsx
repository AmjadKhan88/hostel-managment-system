import { useState } from 'react';
import { ImageOff } from 'lucide-react';

export default function SafeImage({ src, alt, className = '', ...rest }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-gradient-to-br from-[#12285a] to-[#0b1b3a] text-white/40 ${className}`}
      >
        <ImageOff size={28} />
      </div>
    );
  }

  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={className} {...rest} />;
}