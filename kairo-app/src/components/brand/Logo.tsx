import { useEffect, useState } from 'react';

/**
 * Kairo's logo and wordmark are official brand assets, never raster images with
 * their original background. They're rendered as CSS mask shapes so they can
 * inherit Kairo Navy on light surfaces or white on dark surfaces, with no
 * background plate, shadow, gradient or distortion.
 */
export interface KairoMarkProps {
  tone?: 'navy' | 'white';
  size?: number;
}

export interface KairoWordmarkProps {
  tone?: 'navy' | 'white';
  width?: number;
}

/** A CSS `mask-image` renders nothing at all until its resource loads — on a slow connection that's a blank gap where the logo should be. Preloads the mask so callers can show a skeleton instead. */
function useMaskLoaded(src: string): boolean {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => { if (!cancelled) setLoaded(true); };
    img.onerror = () => { if (!cancelled) setLoaded(true); }; // fail open — never block forever on a real load error
    img.src = src;
    if (img.complete) setLoaded(true);
    return () => { cancelled = true; };
  }, [src]);
  return loaded;
}

const MARK_SRC = '/assets/kairo-mark-mask.png';
const WORDMARK_SRC = '/assets/kairo-wordmark-mask.png';

export function KairoMark({ tone = 'navy', size = 40 }: KairoMarkProps) {
  const color = tone === 'white' ? '#fff' : 'var(--kairo-navy-900)';
  const loaded = useMaskLoaded(MARK_SRC);
  if (!loaded) {
    return <div className="kairo-skeleton" style={{ width: size, height: size, borderRadius: '30%', flexShrink: 0 }} />;
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        WebkitMaskImage: `url('${MARK_SRC}')`,
        maskImage: `url('${MARK_SRC}')`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        flexShrink: 0,
      }}
    />
  );
}

export function KairoWordmark({ tone = 'navy', width = 128 }: KairoWordmarkProps) {
  const color = tone === 'white' ? '#fff' : 'var(--kairo-navy-900)';
  const height = width * 0.42;
  const loaded = useMaskLoaded(WORDMARK_SRC);
  if (!loaded) {
    return <div className="kairo-skeleton" style={{ width, height, borderRadius: 'var(--radius-md, 8px)' }} />;
  }
  return (
    <div
      style={{
        width,
        height,
        backgroundColor: color,
        WebkitMaskImage: `url('${WORDMARK_SRC}')`,
        maskImage: `url('${WORDMARK_SRC}')`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  );
}
