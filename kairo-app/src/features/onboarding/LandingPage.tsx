import { useState } from 'react';
import { Button, KairoWordmark } from '../../components';
import { SkipLink } from './shared';

export interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

interface ExperienceStep {
  step: string;
  title: string;
  quote: string;
  image: string;
  alt: string;
}

const EXPERIENCE_STEPS: ExperienceStep[] = [
  {
    step: '01',
    title: 'YOU PRACTISE',
    quote: 'Start with deliberate practice.',
    image: '/assets/kairo-step-1-practice.png',
    alt: 'Kairo Practice Hub showing topic and session selection',
  },
  {
    step: '02',
    title: 'KAIRO READS YOUR PERFORMANCE',
    quote: 'Your results become useful information.',
    image: '/assets/kairo-step-2-performance.png',
    alt: 'Kairo Session Summary breaking down accuracy and strengthened areas',
  },
  {
    step: '03',
    title: 'KAIRO FINDS THE PATTERN',
    quote: 'See where the real gap is.',
    image: '/assets/kairo-step-3-insight.png',
    alt: 'Kairo explanation screen detailing concept gaps and common traps',
  },
  {
    step: '04',
    title: 'KNOW WHAT TO FIX NEXT',
    quote: 'Turn the insight into your next action.',
    image: '/assets/kairo-step-4-weak-topics.png',
    alt: 'Kairo recommended next steps and targeted weak area drills',
  },
];

const LOOP_STEPS = [
  'PRACTISE',
  'SEE WHAT HAPPENED',
  'UNDERSTAND THE GAP',
  'FIX IT',
  'PRACTISE AGAIN',
];

export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const [activeStep, setActiveStep] = useState<number>(0);

  return (
    <div
      id="kairo-landing-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-body)',
        background: 'var(--dark-bg-canvas)',
        color: 'var(--dark-text-body)',
        minHeight: '100vh',
        width: '100%',
        overflowX: 'hidden',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          TOP APP HEADER / BRAND BAR
          ───────────────────────────────────────────────────────────── */}
      <header
        id="landing-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          maxWidth: 1040,
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <KairoWordmark tone="white" width={118} />
          <span
            style={{
              fontSize: 10,
              letterSpacing: '0.12em',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--dark-text-faint)',
              borderLeft: '1px solid rgba(255,255,255,0.14)',
              paddingLeft: 10,
              lineHeight: 1,
            }}
          >
            TECHMED SYSTEM
          </span>
        </div>

        <button
          id="btn-header-signin"
          onClick={onSignIn}
          type="button"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: 8,
            color: 'var(--dark-text-heading)',
            fontSize: 13,
            fontWeight: 500,
            padding: '7px 14px',
            cursor: 'pointer',
            transition: 'background 0.15s ease, border-color 0.15s ease',
          }}
        >
          Sign In
        </button>
      </header>

      {/* Main content container constrained for mobile-first precision and desktop readability */}
      <main
        style={{
          width: '100%',
          maxWidth: 680,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          padding: '0 20px',
        }}
      >
        {/* ─────────────────────────────────────────────────────────────
            SECTION 1: HERO
            ───────────────────────────────────────────────────────────── */}
        <section
          id="hero-section"
          style={{
            padding: '48px 0 36px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 20,
          }}
        >
          {/* Eyebrow badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(46, 124, 246, 0.12)',
              border: '1px solid rgba(46, 124, 246, 0.28)',
              color: 'var(--dark-accent-blue)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'var(--dark-accent-blue)',
              }}
            />
            Practice with Intelligence
          </div>

          {/* Primary Headline */}
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 'clamp(28px, 6vw, 42px)',
              lineHeight: 1.15,
              color: 'var(--dark-text-heading)',
              letterSpacing: '-0.025em',
              margin: 0,
              maxWidth: 580,
            }}
          >
            PRACTICE SHOULD TELL YOU WHAT TO DO NEXT.
          </h1>

          {/* Supporting Copy */}
          <p
            style={{
              fontSize: 'clamp(15px, 2.5vw, 17px)',
              color: 'var(--dark-text-body)',
              lineHeight: 1.6,
              maxWidth: 520,
              margin: 0,
            }}
          >
            Kairo helps you turn questions into useful feedback — so you can understand your mistakes, find what needs attention, and practise with purpose.
          </p>

          {/* Primary CTA Block */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              marginTop: 10,
              width: '100%',
              maxWidth: 380,
            }}
          >
            <Button
              variant="darkAccent"
              size="lg"
              fullWidth
              onClick={onGetStarted}
            >
              START PRACTISING →
            </Button>

            <span
              style={{
                fontSize: 13,
                color: 'var(--dark-text-muted)',
                lineHeight: 1.4,
              }}
            >
              Built for the way serious UTME preparation actually works.
            </span>
          </div>
        </section>

        {/* Subtle Divider */}
        <div
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            margin: '8px 0 36px',
          }}
        />

        {/* ─────────────────────────────────────────────────────────────
            SECTION 2: THE REAL PROBLEM
            ───────────────────────────────────────────────────────────── */}
        <section
          id="real-problem-section"
          style={{
            padding: '12px 0 40px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {/* Section Headline */}
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 'clamp(20px, 4.5vw, 26px)',
              lineHeight: 1.25,
              color: 'var(--dark-text-heading)',
              textAlign: 'center',
              margin: 0,
              letterSpacing: '-0.015em',
            }}
          >
            DOING MORE QUESTIONS ISN&apos;T THE SAME AS GETTING BETTER.
          </h2>

          {/* 3 Compact Pain Point Cards */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              marginTop: 6,
            }}
          >
            {/* Card 1 */}
            <div
              id="pain-point-1"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '16px 18px',
                background: 'rgba(15, 42, 82, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'rgba(255, 92, 108, 0.15)',
                  border: '1px solid rgba(255, 92, 108, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--dark-danger)',
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                ✕
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--dark-text-heading)',
                    letterSpacing: '0.02em',
                  }}
                >
                  YOU GOT IT WRONG.
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: 'var(--dark-text-muted)',
                    marginTop: 3,
                    lineHeight: 1.4,
                  }}
                >
                  Why?
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div
              id="pain-point-2"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '16px 18px',
                background: 'rgba(15, 42, 82, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'rgba(245, 185, 68, 0.15)',
                  border: '1px solid rgba(245, 185, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--dark-caution)',
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                ?
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--dark-text-heading)',
                    letterSpacing: '0.02em',
                  }}
                >
                  YOU GOT IT RIGHT.
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: 'var(--dark-text-muted)',
                    marginTop: 3,
                    lineHeight: 1.4,
                  }}
                >
                  Do you actually understand it?
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div
              id="pain-point-3"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '16px 18px',
                background: 'rgba(15, 42, 82, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'rgba(46, 124, 246, 0.15)',
                  border: '1px solid rgba(46, 124, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--dark-accent-blue)',
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                ↑
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--dark-text-heading)',
                    letterSpacing: '0.02em',
                  }}
                >
                  YOUR SCORE CHANGED.
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: 'var(--dark-text-muted)',
                    marginTop: 3,
                    lineHeight: 1.4,
                  }}
                >
                  What should you work on next?
                </div>
              </div>
            </div>
          </div>

          {/* Compact Closing line */}
          <div
            style={{
              textAlign: 'center',
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--dark-text-heading)',
              padding: '8px 12px',
              fontStyle: 'italic',
            }}
          >
            &ldquo;That&apos;s where practice becomes useful.&rdquo;
          </div>
        </section>

        {/* Subtle Divider */}
        <div
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            margin: '8px 0 40px',
          }}
        />

        {/* ─────────────────────────────────────────────────────────────
            SECTION 3: SHOW THE KAIRO EXPERIENCE
            ───────────────────────────────────────────────────────────── */}
        <section
          id="kairo-experience-section"
          style={{
            padding: '8px 0 48px',
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--dark-accent-blue)',
                marginBottom: 8,
              }}
            >
              INSIDE KAIRO
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 'clamp(22px, 5vw, 28px)',
                lineHeight: 1.25,
                color: 'var(--dark-text-heading)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              HOW KAIRO TRANSFORMS YOUR PRACTICE
            </h2>
          </div>

          {/* Quick Step Selector Tabs on Mobile/Tablet */}
          <div
            id="experience-step-tabs"
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
              overflowX: 'auto',
              paddingBottom: 4,
            }}
          >
            {EXPERIENCE_STEPS.map((step, idx) => (
              <button
                key={step.step}
                type="button"
                onClick={() => setActiveStep(idx)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  border: activeStep === idx
                    ? '1px solid var(--dark-accent-blue)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  background: activeStep === idx
                    ? 'rgba(46, 124, 246, 0.16)'
                    : 'transparent',
                  color: activeStep === idx
                    ? 'var(--dark-text-heading)'
                    : 'var(--dark-text-muted)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.step}
              </button>
            ))}
          </div>

          {/* The 4 Experience Steps displayed in sequence with real screenshots */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 32,
            }}
          >
            {EXPERIENCE_STEPS.map((item, index) => {
              const isSelected = activeStep === index;
              return (
                <div
                  key={item.step}
                  id={`experience-card-${item.step}`}
                  onClick={() => setActiveStep(index)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: isSelected
                      ? 'rgba(15, 42, 82, 0.65)'
                      : 'rgba(15, 42, 82, 0.3)',
                    border: isSelected
                      ? '1px solid rgba(46, 124, 246, 0.45)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 18,
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected
                      ? '0 12px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(46, 124, 246, 0.15)'
                      : 'none',
                  }}
                >
                  {/* Step Header */}
                  <div
                    style={{
                      padding: '20px 22px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: 13,
                          fontWeight: 800,
                          letterSpacing: '0.08em',
                          color: 'var(--accent-gold)',
                        }}
                      >
                        {item.step} —
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: 14,
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          color: 'var(--dark-text-heading)',
                        }}
                      >
                        {item.title}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: 16,
                        color: 'var(--dark-text-body)',
                        margin: 0,
                        fontStyle: 'italic',
                        lineHeight: 1.5,
                      }}
                    >
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  {/* Real Kairo Interface Screenshot Frame */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '12px 20px 24px',
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 320,
                        borderRadius: 14,
                        overflow: 'hidden',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        background: '#041d42',
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.alt}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Subtle Divider */}
        <div
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            margin: '8px 0 40px',
          }}
        />

        {/* ─────────────────────────────────────────────────────────────
            SECTION 4: KAIRO LOOP
            ───────────────────────────────────────────────────────────── */}
        <section
          id="kairo-loop-section"
          style={{
            padding: '8px 0 44px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 22,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--accent-gold)',
                marginBottom: 8,
              }}
            >
              CONTINUOUS CYCLE
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: 'clamp(20px, 4.5vw, 26px)',
                lineHeight: 1.25,
                color: 'var(--dark-text-heading)',
                letterSpacing: '-0.015em',
                margin: 0,
              }}
            >
              PRACTISE. UNDERSTAND. CORRECT. RETURN.
            </h2>
          </div>

          {/* Visual Sequence Loop */}
          <div
            id="loop-flow"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              maxWidth: 320,
              margin: '8px auto',
            }}
          >
            {LOOP_STEPS.map((text, idx) => {
              const isLast = idx === LOOP_STEPS.length - 1;
              return (
                <div
                  key={text}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: idx === 0 || isLast
                        ? 'linear-gradient(135deg, rgba(46, 124, 246, 0.22), rgba(15, 42, 82, 0.7))'
                        : 'rgba(15, 42, 82, 0.45)',
                      border: idx === 0 || isLast
                        ? '1px solid rgba(46, 124, 246, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 10,
                      fontFamily: 'var(--font-heading)',
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      color: idx === 0 || isLast
                        ? 'var(--dark-text-heading)'
                        : 'var(--dark-text-body)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    {text}
                  </div>

                  {!isLast && (
                    <div
                      style={{
                        padding: '6px 0',
                        color: 'var(--dark-accent-blue)',
                        fontSize: 16,
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                    >
                      ↓
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Closing Statement */}
          <p
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: 'var(--dark-text-heading)',
              lineHeight: 1.5,
              maxWidth: 420,
              margin: '6px 0 0',
            }}
          >
            &ldquo;Kairo doesn&apos;t replace the work. It makes the work more intelligent.&rdquo;
          </p>
        </section>

        {/* Subtle Divider */}
        <div
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            margin: '8px 0 36px',
          }}
        />

        {/* ─────────────────────────────────────────────────────────────
            SECTION 5: FOUNDATION PROTOCOL BANNER
            ───────────────────────────────────────────────────────────── */}
        <section
          id="foundation-protocol-banner"
          style={{
            margin: '8px 0 40px',
            padding: '24px 22px',
            borderRadius: 16,
            background: 'linear-gradient(145deg, #05264b 0%, #031c39 100%)',
            border: '1px solid rgba(201, 162, 39, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
          }}
        >
          {/* Header Row with ecosystem mark */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 6,
                background: 'rgba(201, 162, 39, 0.15)',
                border: '1px solid rgba(201, 162, 39, 0.3)',
                color: 'var(--accent-gold)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              TECHMED ECOSYSTEM
            </div>

            <img
              src="/assets/techmed-mark.png"
              alt="TECHMED"
              style={{
                height: 18,
                width: 'auto',
                opacity: 0.8,
              }}
            />
          </div>

          <div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 'clamp(17px, 3.8vw, 21px)',
                lineHeight: 1.3,
                color: '#FFFFFF',
                margin: '0 0 10px 0',
                letterSpacing: '-0.01em',
              }}
            >
              BEFORE YOU PRACTISE HARD, BUILD THE FOUNDATION.
            </h3>

            <p
              style={{
                fontSize: 14,
                color: 'var(--dark-text-body)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Kairo helps you turn practice into feedback. The TECHMED Foundation Protocol helps you build the foundation you&apos;re going to practise on.
            </p>
          </div>

          {/* Value proposition pill */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--kairo-gold-200)',
              letterSpacing: '0.02em',
            }}
          >
            30 DAYS TO BUILD YOUR UTME FOUNDATION — AT NO COST.
          </div>

          {/* External CTA Link */}
          <div>
            <a
              id="link-foundation-protocol"
              href="https://techmedng.com/foundation-protocol"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: '#FFFFFF',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                borderRadius: 8,
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textDecoration: 'none',
                transition: 'background 0.15s ease',
              }}
            >
              EXPLORE FOUNDATION PROTOCOL →
            </a>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            SECTION 6: FINAL CTA
            ───────────────────────────────────────────────────────────── */}
        <section
          id="final-cta-section"
          style={{
            padding: '24px 0 56px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 20,
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 'clamp(24px, 5.5vw, 34px)',
              lineHeight: 1.18,
              color: 'var(--dark-text-heading)',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            DON&apos;T JUST PRACTISE.<br />
            LEARN FROM YOUR PRACTICE.
          </h2>

          <p
            style={{
              fontSize: 16,
              color: 'var(--dark-text-muted)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            &ldquo;Your next question is waiting.&rdquo;
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              width: '100%',
              maxWidth: 380,
              marginTop: 6,
            }}
          >
            <Button
              id="btn-final-start-practising"
              variant="darkAccent"
              size="lg"
              fullWidth
              onClick={onGetStarted}
            >
              START PRACTISING →
            </Button>

            <a
              id="link-final-foundation-protocol"
              href="https://techmedng.com/foundation-protocol"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 14,
                color: 'var(--dark-accent-blue)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Explore the Foundation Protocol →
            </a>

            <div style={{ marginTop: 6 }}>
              <SkipLink tone="dark" onClick={onSignIn}>
                Already have an account? Sign in
              </SkipLink>
            </div>
          </div>
        </section>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          FOOTER / ECOSYSTEM ENDORSEMENT
          ───────────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '28px 24px 88px', // bottom padding ensures content isn't obscured by sticky bar
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          background: 'rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <KairoWordmark tone="white" width={90} />
          <span style={{ color: 'var(--dark-text-faint)', fontSize: 13 }}>•</span>
          <img
            src="/assets/techmed-lockup-white.png"
            alt="TECHMED"
            style={{ height: 16, width: 'auto', opacity: 0.75 }}
          />
        </div>
        <div style={{ fontSize: 12, color: 'var(--dark-text-faint)' }}>
          Kairo is the intelligent practice engine of the TECHMED preparation system.
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────
          STICKY MOBILE ACTION BAR
          ───────────────────────────────────────────────────────────── */}
      <div
        id="sticky-mobile-cta"
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 40,
          padding: '14px 20px 20px',
          background: 'rgba(1, 39, 72, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div style={{ width: '100%', maxWidth: 440 }}>
          <Button
            id="btn-sticky-start"
            variant="darkAccent"
            size="lg"
            fullWidth
            onClick={onGetStarted}
          >
            START PRACTISING →
          </Button>
        </div>
        <button
          type="button"
          onClick={onSignIn}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--dark-text-muted)',
            fontSize: 13,
            cursor: 'pointer',
            padding: '2px 8px',
          }}
        >
          I already have an account
        </button>
      </div>
    </div>
  );
}
