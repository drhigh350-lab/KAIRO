# Kairo — Web (Next.js)

The MVP frontend. Lives in its own npm workspace so the root
`kairo-learning-engine` package stays a plain library with no
framework dependencies.

## Run

```bash
npm install
npm run dev
```

## Splash screen

`components/splash/SplashScreen.tsx` implements the app's entry
splash. Usage:

```tsx
<SplashScreen duration={1800} onComplete={() => router.replace("/welcome")} />
```

`duration` is the time the splash stays visible before its exit fade
starts (defaults to 1.8s, within the 1.5–2s spec range). `onComplete`
fires only after the exit fade has fully finished — the component
does not route on its own.

### Known asset limitation

`public/kairo-icon.svg` and `public/kairo-wordmark.svg` are
hand-built recreations from `design-system/assets/kairo-mark*.png`
and the splash reference screenshot — the repo has no outlined/vector
source for the logo, only flattened PNGs. If TECHMED provides real
vector logo files, drop them in under the same filenames; no component
code needs to change. The wordmark is rendered as inline SVG text in
`SplashWordmark.tsx` (not loaded from the public file) so it can
inherit the page's real Poppins font instead of falling back to a
system font — see the comment in that file.
