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

export function KairoMark({ tone = 'navy', size = 40 }: KairoMarkProps) {
  const color = tone === 'white' ? '#fff' : 'var(--kairo-navy-900)';
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        WebkitMaskImage: "url('/assets/kairo-mark-mask.png')",
        maskImage: "url('/assets/kairo-mark-mask.png')",
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
  return (
    <div
      style={{
        width,
        height: width * 0.42,
        backgroundColor: color,
        WebkitMaskImage: "url('/assets/kairo-wordmark-mask.png')",
        maskImage: "url('/assets/kairo-wordmark-mask.png')",
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
