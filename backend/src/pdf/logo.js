const cache = new Map(); // url -> { buffer | null, at }
const HIT_TTL_MS = 10 * 60 * 1000;
const MISS_TTL_MS = 60 * 1000; // don't hammer a down CDN on every download
const MAX_BYTES = 1_000_000;

/**
 * Fetches the hostel logo for embedding in a PDF. Fail-soft by design: any
 * problem (timeout, 404, too large, not an image) returns null and the PDF
 * is simply generated without a logo — a logo must never block an invoice.
 *
 * PDFKit only reads PNG/JPEG, and the logo could have been uploaded as
 * WebP or SVG, so Cloudinary is asked to convert it to PNG on the fly. The
 * URL is the server-set Cloudinary URL from the hostel record, not
 * user-supplied input.
 */
export async function fetchLogoBuffer(url) {
  if (!url) return null;

  const cached = cache.get(url);
  if (cached && Date.now() - cached.at < (cached.buffer ? HIT_TTL_MS : MISS_TTL_MS)) {
    return cached.buffer;
  }

  const target = url.includes('/upload/')
    ? url.replace('/upload/', '/upload/f_png,w_240,c_limit/')
    : url;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(target, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_BYTES) throw new Error('logo too large');
    cache.set(url, { buffer, at: Date.now() });
    return buffer;
  } catch {
    cache.set(url, { buffer: null, at: Date.now() });
    return null;
  } finally {
    clearTimeout(timer);
  }
}
