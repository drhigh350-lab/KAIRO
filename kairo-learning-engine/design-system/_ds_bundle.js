/* @ds-bundle: {"format":4,"namespace":"KairoDesignSystem_1c2e7f","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Checkbox","sourcePath":"components/core/Checkbox.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Radio","sourcePath":"components/core/Radio.jsx"},{"name":"Switch","sourcePath":"components/core/Switch.jsx"},{"name":"AnswerFeedback","sourcePath":"components/feedback/AnswerFeedback.jsx"},{"name":"Card","sourcePath":"components/feedback/Card.jsx"},{"name":"ProgressBar","sourcePath":"components/feedback/ProgressBar.jsx"},{"name":"ScoreBadge","sourcePath":"components/feedback/ScoreBadge.jsx"},{"name":"StreakBadge","sourcePath":"components/feedback/StreakBadge.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"KaiMessage","sourcePath":"components/kairo/KaiMessage.jsx"},{"name":"MissionCard","sourcePath":"components/kairo/MissionCard.jsx"},{"name":"QuestionCard","sourcePath":"components/kairo/QuestionCard.jsx"},{"name":"SessionSummaryCard","sourcePath":"components/kairo/SessionSummaryCard.jsx"},{"name":"BottomNav","sourcePath":"components/navigation/BottomNav.jsx"},{"name":"TopBar","sourcePath":"components/navigation/TopBar.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"c298d5c3bbfd","components/core/Button.jsx":"7a2ce4c2c5c3","components/core/Checkbox.jsx":"c59bd560ef99","components/core/IconButton.jsx":"33022d6f691f","components/core/Input.jsx":"7494d9add6f9","components/core/Radio.jsx":"fc8de0241d00","components/core/Switch.jsx":"30ab075a41d9","components/feedback/AnswerFeedback.jsx":"fe1d10dad255","components/feedback/Card.jsx":"693ac9941536","components/feedback/ProgressBar.jsx":"eda1d0d406b0","components/feedback/ScoreBadge.jsx":"cabfb9452249","components/feedback/StreakBadge.jsx":"d361a68d4f02","components/feedback/Toast.jsx":"f2a38abcf07f","components/kairo/KaiMessage.jsx":"b29315fb1b88","components/kairo/MissionCard.jsx":"a11479051800","components/kairo/QuestionCard.jsx":"25beacee77a8","components/kairo/SessionSummaryCard.jsx":"4431fed6d641","components/navigation/BottomNav.jsx":"612105ea2593","components/navigation/TopBar.jsx":"fcd164ff191a","ui_kits/kairo-app/App.jsx":"2c3e606972af","ui_kits/kairo-app/Home.jsx":"1063a5fd235f","ui_kits/kairo-app/Insights.jsx":"185735a0dbf3","ui_kits/kairo-app/Login.jsx":"2e2756904596","ui_kits/kairo-app/Onboarding.jsx":"b4de7352e30e","ui_kits/kairo-app/Practice.jsx":"663f12e29992","ui_kits/kairo-app/Profile.jsx":"188f38edd938","ui_kits/kairo-app/Review.jsx":"5c5aeeb122d0","ui_kits/kairo-app/SessionSummary.jsx":"6fcf0c94f25e"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.KairoDesignSystem_1c2e7f = window.KairoDesignSystem_1c2e7f || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function Badge({
  children,
  tone = 'neutral'
}) {
  const tones = {
    neutral: {
      background: 'var(--kairo-blue-100)',
      color: 'var(--kairo-navy-900)'
    },
    gold: {
      background: 'var(--accent-gold-bg)',
      color: 'var(--kairo-gold-600)'
    },
    success: {
      background: 'var(--state-success-bg)',
      color: 'var(--state-success)'
    },
    danger: {
      background: 'var(--state-danger-bg)',
      color: 'var(--state-danger)'
    },
    navy: {
      background: 'var(--kairo-navy-900)',
      color: '#fff'
    }
  };
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 12px',
      borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-caption)',
      fontWeight: 600,
      ...t
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const sizes = {
  sm: {
    padding: '10px 18px',
    fontSize: 'var(--fs-body-sm)'
  },
  md: {
    padding: '14px 24px',
    fontSize: 'var(--fs-body)'
  },
  lg: {
    padding: '16px 28px',
    fontSize: 'var(--fs-body-lg)'
  }
};
const variantStyle = (variant, disabled) => {
  if (disabled) {
    return {
      background: 'var(--kairo-ink-100)',
      color: 'var(--text-faint)',
      border: 'none'
    };
  }
  switch (variant) {
    case 'secondary':
      return {
        background: 'var(--color-bg-surface)',
        color: 'var(--kairo-navy-900)',
        border: '1.5px solid var(--kairo-navy-900)'
      };
    case 'ghost':
      return {
        background: 'transparent',
        color: 'var(--kairo-blue-700)',
        border: 'none'
      };
    case 'gold':
      return {
        background: 'var(--kairo-gold-500)',
        color: 'var(--kairo-navy-900)',
        border: 'none'
      };
    default:
      return {
        background: 'var(--kairo-navy-900)',
        color: '#fff',
        border: 'none'
      };
  }
};
function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  fullWidth = false,
  onClick,
  ...rest
}) {
  const vs = variantStyle(variant, disabled);
  const sz = sizes[size] || sizes.md;
  return /*#__PURE__*/React.createElement("button", _extends({
    onClick: disabled ? undefined : onClick,
    disabled: disabled,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      borderRadius: 'var(--radius-pill)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      minHeight: 'var(--touch-min)',
      width: fullWidth ? '100%' : 'auto',
      transition: 'background var(--dur-fast) var(--ease-standard), opacity var(--dur-fast)',
      ...sz,
      ...vs
    },
    onMouseOver: e => {
      if (!disabled && variant === 'primary') e.currentTarget.style.background = 'var(--kairo-navy-800)';
    },
    onMouseOut: e => {
      if (!disabled && variant === 'primary') e.currentTarget.style.background = 'var(--kairo-navy-900)';
    }
  }, rest), children, icon);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Checkbox.jsx
try { (() => {
function Checkbox({
  checked,
  onChange,
  label
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-body)',
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 22,
      height: 22,
      borderRadius: 6,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `2px solid ${checked ? 'var(--kairo-navy-900)' : 'var(--kairo-ink-300)'}`,
      background: checked ? 'var(--kairo-navy-900)' : 'transparent',
      transition: 'all var(--dur-fast)'
    }
  }, checked && /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "10",
    viewBox: "0 0 13 10",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 5L4.5 8.5L12 1",
    stroke: "white",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: checked,
    onChange: onChange,
    style: {
      display: 'none'
    }
  }), label);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function IconButton({
  children,
  variant = 'ghost',
  size = 44,
  active = false,
  onClick,
  ...rest
}) {
  const bg = active ? 'var(--kairo-blue-100)' : variant === 'filled' ? 'var(--kairo-navy-900)' : 'transparent';
  const color = variant === 'filled' ? '#fff' : 'var(--kairo-navy-900)';
  return /*#__PURE__*/React.createElement("button", _extends({
    onClick: onClick,
    style: {
      width: size,
      height: size,
      minWidth: 'var(--touch-min)',
      minHeight: 'var(--touch-min)',
      borderRadius: '50%',
      border: 'none',
      background: bg,
      color,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background var(--dur-fast) var(--ease-standard)'
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
function Input({
  label,
  placeholder,
  icon,
  type = 'text',
  error,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      width: '100%'
    }
  }, label && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-body-sm)',
      fontWeight: 600,
      color: 'var(--text-heading)',
      marginBottom: 8
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0 16px',
      height: 'var(--touch-min)',
      borderRadius: 'var(--radius-md)',
      background: '#fff',
      border: `1.5px solid ${error ? 'var(--state-danger)' : focused ? 'var(--kairo-blue-700)' : 'var(--color-border-subtle)'}`,
      boxShadow: focused ? 'var(--focus-ring)' : 'none',
      transition: 'border var(--dur-fast), box-shadow var(--dur-fast)'
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--kairo-blue-700)',
      display: 'flex'
    }
  }, icon), /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    placeholder: placeholder,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      border: 'none',
      outline: 'none',
      flex: 1,
      fontSize: 'var(--fs-body)',
      fontFamily: 'inherit',
      color: 'var(--text-body)',
      background: 'transparent'
    }
  }, rest))), error && /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--state-danger)',
      fontSize: 'var(--fs-caption)',
      marginTop: 6
    }
  }, error));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Radio.jsx
try { (() => {
function Radio({
  checked,
  onChange,
  label
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-body)',
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 22,
      height: 22,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `2px solid ${checked ? 'var(--kairo-navy-900)' : 'var(--kairo-ink-300)'}`
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 11,
      height: 11,
      borderRadius: '50%',
      background: 'var(--kairo-navy-900)'
    }
  })), /*#__PURE__*/React.createElement("input", {
    type: "radio",
    checked: checked,
    onChange: onChange,
    style: {
      display: 'none'
    }
  }), label);
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Radio.jsx", error: String((e && e.message) || e) }); }

// components/core/Switch.jsx
try { (() => {
function Switch({
  checked,
  onChange
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onChange,
    style: {
      width: 46,
      height: 26,
      borderRadius: 'var(--radius-pill)',
      border: 'none',
      cursor: 'pointer',
      background: checked ? 'var(--kairo-navy-900)' : 'var(--kairo-ink-100)',
      position: 'relative',
      transition: 'background var(--dur-fast)',
      padding: 3,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: checked ? 'flex-end' : 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: 'var(--shadow-xs)',
      transition: 'all var(--dur-fast)'
    }
  }));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Switch.jsx", error: String((e && e.message) || e) }); }

// components/feedback/AnswerFeedback.jsx
try { (() => {
function AnswerFeedback({
  correct,
  title,
  detail
}) {
  const tone = correct ? {
    border: 'var(--state-success)',
    bg: 'var(--state-success-bg)',
    color: 'var(--state-success)'
  } : {
    border: 'var(--state-danger)',
    bg: 'var(--state-danger-bg)',
    color: 'var(--state-danger)'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderLeft: `4px solid ${tone.border}`,
      background: tone.bg,
      borderRadius: 'var(--radius-md)',
      padding: '14px 16px',
      fontFamily: 'var(--font-body)',
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: tone.color,
      fontSize: 20,
      lineHeight: 1
    }
  }, correct ? '✓' : '✕'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: 'var(--text-heading)',
      fontSize: 'var(--fs-body)'
    }
  }, title), detail && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-body-sm)',
      color: 'var(--text-muted)',
      marginTop: 4
    }
  }, detail)));
}
Object.assign(__ds_scope, { AnswerFeedback });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/AnswerFeedback.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Card.jsx
try { (() => {
function Card({
  children,
  padding = 20,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      padding,
      fontFamily: 'var(--font-body)',
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Card.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ProgressBar.jsx
try { (() => {
function ProgressBar({
  value,
  max = 100,
  tone = 'blue',
  height = 8
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const color = tone === 'gold' ? 'var(--kairo-gold-500)' : tone === 'light' ? '#fff' : 'var(--kairo-blue-500)';
  const track = tone === 'light' ? 'rgba(255,255,255,0.25)' : 'var(--kairo-blue-100)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height,
      borderRadius: 'var(--radius-pill)',
      background: track,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${pct}%`,
      height: '100%',
      background: color,
      borderRadius: 'var(--radius-pill)',
      transition: 'width var(--dur-slow) var(--ease-out)'
    }
  }));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ScoreBadge.jsx
try { (() => {
function ScoreBadge({
  score,
  delta
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 800,
      fontSize: 28,
      color: 'var(--kairo-navy-900)'
    }
  }, score), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-caption)',
      color: 'var(--text-muted)'
    }
  }, "KAIRO Score")), delta != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-caption)',
      color: delta >= 0 ? 'var(--state-success)' : 'var(--state-danger)',
      fontWeight: 600
    }
  }, delta >= 0 ? '↑' : '↓', " ", Math.abs(delta)));
}
Object.assign(__ds_scope, { ScoreBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ScoreBadge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StreakBadge.jsx
try { (() => {
function StreakBadge({
  days
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 14px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--accent-gold-bg)',
      color: 'var(--kairo-gold-600)',
      fontFamily: 'var(--font-body)',
      fontWeight: 700,
      fontSize: 'var(--fs-body-sm)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2c1 4-3 5-3 9a3 3 0 006 0c0-1-.5-2-1-2 1 3-1 4-2 4a2 2 0 01-2-2c0-3 3-4 2-9z"
  })), days, " day streak");
}
Object.assign(__ds_scope, { StreakBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StreakBadge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function Toast({
  children,
  tone = 'default'
}) {
  const bg = tone === 'success' ? 'var(--state-success)' : tone === 'danger' ? 'var(--state-danger)' : 'var(--kairo-navy-900)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      color: '#fff',
      padding: '14px 18px',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-body-sm)',
      boxShadow: 'var(--shadow-md)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      maxWidth: 340
    }
  }, children);
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/kairo/KaiMessage.jsx
try { (() => {
function KaiMessage({
  children,
  compact = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      background: 'var(--kairo-blue-100)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/illustration-kai-mascot.png",
    alt: "Kai",
    style: {
      width: '160%',
      height: '160%',
      objectFit: 'cover',
      objectPosition: '20% 30%'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: compact ? 'transparent' : 'var(--kairo-blue-100)',
      padding: compact ? 0 : '10px 14px',
      borderRadius: 'var(--radius-md)',
      fontSize: 'var(--fs-body-sm)',
      color: 'var(--text-body)',
      lineHeight: 1.5,
      maxWidth: 320
    }
  }, children));
}
Object.assign(__ds_scope, { KaiMessage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/kairo/KaiMessage.jsx", error: String((e && e.message) || e) }); }

// components/kairo/MissionCard.jsx
try { (() => {
function MissionCard({
  eyebrow = "TODAY'S MISSION",
  title,
  reason,
  duration,
  progress,
  ctaLabel = 'Start Mission',
  onStart
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--kairo-navy-900)',
      borderRadius: 'var(--radius-xl)',
      padding: 24,
      color: '#fff',
      fontFamily: 'var(--font-body)',
      boxShadow: 'var(--shadow-lg)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: '.08em',
      color: 'var(--kairo-blue-300)',
      fontWeight: 700
    }
  }, eyebrow), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 700,
      fontSize: 22,
      marginTop: 10,
      lineHeight: 1.25
    }
  }, title), reason && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-body-sm)',
      color: 'var(--kairo-blue-200)',
      marginTop: 10
    }
  }, reason), duration && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-caption)',
      color: 'var(--kairo-blue-300)',
      marginTop: 8
    }
  }, duration), progress != null && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      borderRadius: 'var(--radius-pill)',
      background: 'rgba(255,255,255,0.2)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${progress}%`,
      height: '100%',
      background: '#fff'
    }
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: onStart,
    style: {
      marginTop: 20,
      width: '100%',
      minHeight: 'var(--touch-min)',
      background: '#fff',
      color: 'var(--kairo-navy-900)',
      border: 'none',
      borderRadius: 'var(--radius-pill)',
      fontWeight: 700,
      fontSize: 'var(--fs-body-lg)',
      cursor: 'pointer'
    }
  }, ctaLabel));
}
Object.assign(__ds_scope, { MissionCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/kairo/MissionCard.jsx", error: String((e && e.message) || e) }); }

// components/kairo/QuestionCard.jsx
try { (() => {
const {
  useState
} = React;
function QuestionCard({
  subject,
  progressLabel,
  stem,
  options,
  onSubmit
}) {
  const [selected, setSelected] = useState(null);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-caption)',
      color: 'var(--text-muted)',
      fontWeight: 600
    }
  }, subject, " \xB7 ", progressLabel), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      lineHeight: 1.55,
      color: 'var(--text-body)',
      marginTop: 14,
      fontWeight: 500
    }
  }, stem), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      marginTop: 18
    }
  }, options.map((opt, i) => {
    const isSelected = selected === i;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => setSelected(i),
      style: {
        textAlign: 'left',
        minHeight: 'var(--touch-min)',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        border: `1.5px solid ${isSelected ? 'var(--kairo-navy-900)' : 'var(--color-border-subtle)'}`,
        background: isSelected ? 'var(--kairo-blue-100)' : '#fff',
        color: 'var(--text-body)',
        fontSize: 'var(--fs-body)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'flex',
        gap: 10,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 22,
        height: 22,
        borderRadius: '50%',
        border: `1.5px solid ${isSelected ? 'var(--kairo-navy-900)' : 'var(--kairo-ink-300)'}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: 12,
        fontWeight: 700,
        background: isSelected ? 'var(--kairo-navy-900)' : 'transparent',
        color: isSelected ? '#fff' : 'var(--text-muted)'
      }
    }, String.fromCharCode(65 + i)), opt);
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => onSubmit && onSubmit(selected),
    disabled: selected === null,
    style: {
      marginTop: 20,
      width: '100%',
      minHeight: 'var(--touch-min)',
      border: 'none',
      borderRadius: 'var(--radius-pill)',
      background: selected === null ? 'var(--kairo-ink-100)' : 'var(--kairo-navy-900)',
      color: selected === null ? 'var(--text-faint)' : '#fff',
      fontWeight: 700,
      fontSize: 'var(--fs-body-lg)',
      cursor: selected === null ? 'not-allowed' : 'pointer'
    }
  }, "Submit Answer"));
}
Object.assign(__ds_scope, { QuestionCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/kairo/QuestionCard.jsx", error: String((e && e.message) || e) }); }

// components/kairo/SessionSummaryCard.jsx
try { (() => {
function SessionSummaryCard({
  headline,
  strengths = [],
  nextSteps = [],
  scoreDelta
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 700,
      fontSize: 20,
      color: 'var(--text-heading)'
    }
  }, headline), strengths.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-caption)',
      fontWeight: 700,
      color: 'var(--state-success)',
      letterSpacing: '.04em',
      textTransform: 'uppercase'
    }
  }, "Strengths"), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: '6px 0 0',
      paddingLeft: 18,
      color: 'var(--text-body)',
      fontSize: 'var(--fs-body-sm)'
    }
  }, strengths.map((s, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      marginBottom: 4
    }
  }, s)))), nextSteps.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-caption)',
      fontWeight: 700,
      color: 'var(--kairo-blue-700)',
      letterSpacing: '.04em',
      textTransform: 'uppercase'
    }
  }, "Recommended next"), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: '6px 0 0',
      paddingLeft: 18,
      color: 'var(--text-body)',
      fontSize: 'var(--fs-body-sm)'
    }
  }, nextSteps.map((s, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      marginBottom: 4
    }
  }, s)))), scoreDelta != null && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-body-sm)',
      color: 'var(--text-muted)'
    }
  }, "KAIRO Score ", scoreDelta >= 0 ? 'moved up' : 'dipped', " ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text-heading)'
    }
  }, Math.abs(scoreDelta)), " \u2014 mostly from remembering things you'd struggled with before."));
}
Object.assign(__ds_scope, { SessionSummaryCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/kairo/SessionSummaryCard.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BottomNav.jsx
try { (() => {
function BottomNav({
  items,
  active,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      background: '#fff',
      borderTop: '1px solid var(--color-border-subtle)',
      padding: '10px 4px',
      fontFamily: 'var(--font-body)'
    }
  }, items.map(item => {
    const isActive = item.key === active;
    return /*#__PURE__*/React.createElement("button", {
      key: item.key,
      onClick: () => onChange && onChange(item.key),
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        background: 'none',
        border: 'none',
        color: isActive ? 'var(--kairo-navy-900)' : 'var(--text-faint)',
        cursor: 'pointer',
        minWidth: 48,
        minHeight: 48,
        fontWeight: isActive ? 700 : 500
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex'
      }
    }, item.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11
      }
    }, item.label));
  }));
}
Object.assign(__ds_scope, { BottomNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BottomNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TopBar.jsx
try { (() => {
function TopBar({
  title,
  left,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      fontFamily: 'var(--font-body)',
      background: 'transparent'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      minWidth: 44
    }
  }, left), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 'var(--fs-body-lg)',
      color: 'var(--text-heading)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      minWidth: 44,
      justifyContent: 'flex-end'
    }
  }, right));
}
Object.assign(__ds_scope, { TopBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TopBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/kairo-app/App.jsx
try { (() => {
const kairoStyles = {
  shell: {
    maxWidth: 420,
    margin: '40px auto',
    background: '#fff',
    minHeight: 844,
    borderRadius: 32,
    overflow: 'hidden',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'var(--font-body)',
    position: 'relative'
  },
  statusBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 24px 6px',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-heading)'
  }
};
function StatusBar({
  dark
}) {
  const color = dark ? '#fff' : 'var(--text-heading)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...kairoStyles.statusBar,
      color
    }
  }, /*#__PURE__*/React.createElement("span", null, "9:41"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "12",
    viewBox: "0 0 18 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7",
    width: "3",
    height: "5",
    rx: "1",
    fill: color
  }), /*#__PURE__*/React.createElement("rect", {
    x: "5",
    y: "5",
    width: "3",
    height: "7",
    rx: "1",
    fill: color
  }), /*#__PURE__*/React.createElement("rect", {
    x: "10",
    y: "3",
    width: "3",
    height: "9",
    rx: "1",
    fill: color
  }), /*#__PURE__*/React.createElement("rect", {
    x: "15",
    y: "0",
    width: "3",
    height: "12",
    rx: "1",
    fill: color
  })), /*#__PURE__*/React.createElement("svg", {
    width: "24",
    height: "12",
    viewBox: "0 0 24 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "21",
    height: "11",
    rx: "2.5",
    stroke: color
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "16",
    height: "8",
    rx: "1.5",
    fill: color
  }), /*#__PURE__*/React.createElement("rect", {
    x: "22",
    y: "4",
    width: "1.5",
    height: "4",
    rx: "0.75",
    fill: color
  }))));
}
function BottomNavBar({
  active,
  onChange
}) {
  const {
    BottomNav
  } = window.KairoDesignSystem_1c2e7f;
  const icon = d => /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: d
  }));
  return /*#__PURE__*/React.createElement(BottomNav, {
    active: active,
    onChange: onChange,
    items: [{
      key: 'home',
      label: 'Home',
      icon: icon('M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z')
    }, {
      key: 'practice',
      label: 'Practice',
      icon: icon('M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z')
    }, {
      key: 'review',
      label: 'Review',
      icon: icon('M1 4v6h6M3.5 15a9 9 0 1 0 2-9.4L1 10')
    }, {
      key: 'insights',
      label: 'Insights',
      icon: icon('M4 20V10M12 20V4M20 20v-7')
    }, {
      key: 'profile',
      label: 'Profile',
      icon: icon('M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z')
    }]
  });
}
function App() {
  const [screen, setScreen] = React.useState('onboarding');
  const [tab, setTab] = React.useState('home');
  const showNav = ['home', 'practice-hub', 'review', 'insights', 'profile'].includes(screen);
  function go(next) {
    setScreen(next);
  }
  function onTabChange(key) {
    setTab(key);
    if (key === 'practice') setScreen('practice-hub');else setScreen(key);
  }
  let body;
  if (screen === 'onboarding') body = /*#__PURE__*/React.createElement(window.KairoUI.Onboarding, {
    onDone: () => go('login')
  });else if (screen === 'login') body = /*#__PURE__*/React.createElement(window.KairoUI.Login, {
    onSignIn: () => {
      go('home');
      setTab('home');
    }
  });else if (screen === 'home') body = /*#__PURE__*/React.createElement(window.KairoUI.Home, {
    onStartMission: () => go('practice')
  });else if (screen === 'practice-hub') body = /*#__PURE__*/React.createElement(window.KairoUI.Home, {
    onStartMission: () => go('practice')
  });else if (screen === 'practice') body = /*#__PURE__*/React.createElement(window.KairoUI.Practice, {
    onFinish: () => go('summary'),
    onExit: () => go('home')
  });else if (screen === 'summary') body = /*#__PURE__*/React.createElement(window.KairoUI.SessionSummary, {
    onDone: () => {
      go('home');
      setTab('home');
    }
  });else if (screen === 'review') body = /*#__PURE__*/React.createElement(window.KairoUI.Review, null);else if (screen === 'insights') body = /*#__PURE__*/React.createElement(window.KairoUI.Insights, null);else if (screen === 'profile') body = /*#__PURE__*/React.createElement(window.KairoUI.Profile, null);
  const dark = screen === 'practice' || screen === 'onboarding';
  return /*#__PURE__*/React.createElement("div", {
    style: kairoStyles.shell
  }, screen !== 'practice' && /*#__PURE__*/React.createElement(StatusBar, {
    dark: false
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }
  }, body), showNav && /*#__PURE__*/React.createElement(BottomNavBar, {
    active: tab,
    onChange: onTabChange
  }));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/kairo-app/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/kairo-app/Home.jsx
try { (() => {
function Home({
  onStartMission
}) {
  const {
    MissionCard,
    StreakBadge,
    Badge,
    Card,
    KaiMessage
  } = window.KairoDesignSystem_1c2e7f;
  const quickActions = [{
    label: 'Subject Practice',
    d: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z'
  }, {
    label: 'Topic Practice',
    d: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 8a4 4 0 100 8 4 4 0 000-8z'
  }, {
    label: 'Mixed Practice',
    d: 'M16 3h5v5M4 20L21 3M21 16v5h-5M4 4l5 5'
  }, {
    label: 'Weak Areas',
    d: 'M3 17l6-6 4 4 8-8M14 6h7v7'
  }, {
    label: 'Mistake Review',
    d: 'M1 4v6h6M3.5 15a9 9 0 1 0 2-9.4L1 10'
  }, {
    label: 'Bookmarked',
    d: 'M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 20px 24px',
      fontFamily: 'var(--font-body)',
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 800,
      fontSize: 22,
      color: 'var(--text-heading)'
    }
  }, "Kairo"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--kairo-navy-900)",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      background: 'var(--kairo-blue-100)'
    }
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--text-muted)'
    }
  }, "Good morning, Wisdom \uD83D\uDC4B"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 800,
      fontSize: 26,
      color: 'var(--text-heading)',
      marginTop: 2
    }
  }, "Seize the Moment."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(StreakBadge, {
    days: 12
  }), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 8
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, "Level 4")))), /*#__PURE__*/React.createElement(MissionCard, {
    title: "Continue Biology: Cell Division",
    reason: "You're 68% complete",
    duration: "Last studied yesterday \xB7 Focus: Weak areas",
    progress: 68,
    onStart: onStartMission
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: 'var(--text-heading)',
      fontSize: 15
    }
  }, "Quick Actions"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      fontSize: 13
    }
  }, "See all")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 10,
      marginTop: 10
    }
  }, quickActions.map(q => /*#__PURE__*/React.createElement(Card, {
    key: q.label,
    padding: 14,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--kairo-blue-700)",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: q.d
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--text-heading)',
      lineHeight: 1.3
    }
  }, q.label))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: 'var(--text-heading)',
      fontSize: 15
    }
  }, "Continue Where You Left Off"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      fontSize: 13
    }
  }, "See all")), /*#__PURE__*/React.createElement(Card, {
    style: {
      marginTop: 10,
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 10,
      background: 'var(--kairo-blue-100)',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      color: 'var(--text-heading)'
    }
  }, "Chemistry: Atomic Structure"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)',
      marginTop: 4
    }
  }, "34% complete \xB7 Last opened 2 days ago")))), /*#__PURE__*/React.createElement(Card, {
    style: {
      background: 'var(--kairo-blue-100)'
    }
  }, /*#__PURE__*/React.createElement(KaiMessage, {
    compact: true
  }, "\"Small consistent steps today create big results tomorrow.\"")));
}
window.KairoUI = window.KairoUI || {};
window.KairoUI.Home = Home;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/kairo-app/Home.jsx", error: String((e && e.message) || e) }); }

// ui_kits/kairo-app/Insights.jsx
try { (() => {
function Insights() {
  const {
    Card,
    ScoreBadge,
    ProgressBar
  } = window.KairoDesignSystem_1c2e7f;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 20px 24px',
      fontFamily: 'var(--font-body)',
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 800,
      fontSize: 22,
      color: 'var(--text-heading)'
    }
  }, "Insights"), /*#__PURE__*/React.createElement(Card, {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(ScoreBadge, {
    score: 842,
    delta: 12
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)',
      marginTop: 12
    }
  }, "Your score moved up mostly because you're getting harder questions right more often, not just more questions overall.")), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15,
      color: 'var(--text-heading)'
    }
  }, "This Week"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)',
      marginTop: 6
    }
  }, "You showed up four different days this week \u2014 that's the rhythm that moves your score."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--text-faint)',
      textTransform: 'uppercase',
      letterSpacing: '.04em'
    }
  }, "Accuracy"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 18,
      color: 'var(--text-heading)'
    }
  }, "78%")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--text-faint)',
      textTransform: 'uppercase',
      letterSpacing: '.04em'
    }
  }, "Confidence"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 18,
      color: 'var(--state-success)'
    }
  }, "Rising")))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15,
      color: 'var(--text-heading)'
    }
  }, "Subject Health"), [['Chemistry', 82], ['Physics', 54], ['Biology', 91]].map(([s, v]) => /*#__PURE__*/React.createElement("div", {
    key: s,
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 13,
      color: 'var(--text-body)',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", null, s)), /*#__PURE__*/React.createElement(ProgressBar, {
    value: v,
    tone: v < 60 ? 'gold' : 'blue'
  })))));
}
window.KairoUI = window.KairoUI || {};
window.KairoUI.Insights = Insights;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/kairo-app/Insights.jsx", error: String((e && e.message) || e) }); }

// ui_kits/kairo-app/Login.jsx
try { (() => {
function Login({
  onSignIn
}) {
  const {
    Input,
    Button
  } = window.KairoDesignSystem_1c2e7f;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '32px 24px',
      fontFamily: 'var(--font-body)',
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/kairo-logo-lockup.png",
    style: {
      height: 90,
      margin: '0 auto',
      objectFit: 'contain'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 700,
      fontSize: 24,
      color: 'var(--text-heading)'
    }
  }, "Welcome back."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--text-muted)',
      marginTop: 6
    }
  }, "Continue where you left off.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Email Address",
    placeholder: "Enter your email",
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M4 4h16v16H4zM4 6l8 7 8-7"
    }))
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "5",
      y: "11",
      width: "14",
      height: "9",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M8 11V7a4 4 0 018 0v4"
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Forgot Password?")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    onClick: onSignIn
  }, "Sign In"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      color: 'var(--text-faint)',
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 1,
      background: 'var(--color-border-subtle)'
    }
  }), " OR ", /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 1,
      background: 'var(--color-border-subtle)'
    }
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    fullWidth: true
  }, "Continue with Google")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 13,
      color: 'var(--text-muted)',
      marginTop: 'auto'
    }
  }, "Don't have an account? ", /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Create one")));
}
;
window.KairoUI = window.KairoUI || {};
window.KairoUI.Login = Login;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/kairo-app/Login.jsx", error: String((e && e.message) || e) }); }

// ui_kits/kairo-app/Onboarding.jsx
try { (() => {
function Onboarding({
  onDone
}) {
  const {
    Button
  } = window.KairoDesignSystem_1c2e7f;
  const slides = [{
    title: 'Built to Last.',
    body: "Preparation isn't built in one night. Every question you answer, every mistake you correct, every day you return — moves you closer to your goal.",
    img: '../../assets/illustration-student-studying.png'
  }, {
    title: 'Learn by Doing.',
    body: 'Kairo doesn\u2019t replace your teacher. It helps you understand concepts through carefully selected questions, clear explanations, and consistent practice.',
    img: null
  }, {
    title: 'Meet Kai.',
    body: 'Kai encourages you, explains difficult concepts, celebrates your progress, and keeps you moving — even on difficult days.',
    img: '../../assets/illustration-kai-mascot.png'
  }, {
    title: 'Small Steps. Big Results.',
    body: "Your progress isn't measured by speed alone. Kairo helps you build consistency, improve accuracy, and become more confident over time.",
    img: null
  }, {
    title: 'Seize the Moment.',
    body: 'Every great result begins with a single decision to start. Your journey begins now.',
    img: '../../assets/illustration-seize-the-moment.png',
    final: true
  }];
  const [i, setI] = React.useState(0);
  const s = slides[i];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '20px 24px 28px',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      fontSize: 13,
      color: 'var(--text-muted)',
      cursor: 'pointer'
    },
    onClick: onDone
  }, !s.final && 'Skip'), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 700,
      fontSize: 28,
      color: 'var(--text-heading)',
      lineHeight: 1.15
    }
  }, s.title), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 3,
      background: 'var(--kairo-gold-500)',
      margin: '10px 0 14px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      color: 'var(--text-muted)',
      lineHeight: 1.55
    }
  }, s.body)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12
    }
  }, s.img && /*#__PURE__*/React.createElement("img", {
    src: s.img,
    style: {
      maxHeight: 260,
      borderRadius: 16
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 6,
      marginBottom: 18
    }
  }, slides.map((_, idx) => /*#__PURE__*/React.createElement("span", {
    key: idx,
    style: {
      width: idx === i ? 18 : 6,
      height: 6,
      borderRadius: 3,
      background: idx === i ? 'var(--kairo-navy-900)' : 'var(--kairo-ink-100)',
      transition: 'all var(--dur-base)'
    }
  }))), s.final ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    icon: /*#__PURE__*/React.createElement("span", null, "\u2192"),
    onClick: onDone
  }, "Get Started"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    fullWidth: true,
    onClick: onDone
  }, "I Already Have an Account")) : /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    icon: /*#__PURE__*/React.createElement("span", null, "\u2192"),
    onClick: () => setI(i + 1)
  }, "Continue"));
}
window.KairoUI = window.KairoUI || {};
window.KairoUI.Onboarding = Onboarding;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/kairo-app/Onboarding.jsx", error: String((e && e.message) || e) }); }

// ui_kits/kairo-app/Practice.jsx
try { (() => {
function Practice({
  onFinish,
  onExit
}) {
  const {
    IconButton,
    ProgressBar,
    AnswerFeedback,
    Button
  } = window.KairoDesignSystem_1c2e7f;
  const [selected, setSelected] = React.useState(null);
  const [submitted, setSubmitted] = React.useState(false);
  const correctIndex = 1;
  const options = ['2 m/s²', '3 m/s²', '4 m/s²', '5 m/s²'];
  function submit() {
    setSubmitted(true);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--color-bg-canvas)',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 20px 8px'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    onClick: onExit
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 6l12 12M18 6L6 18"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--text-muted)'
    }
  }, "Question 4 of 12"), /*#__PURE__*/React.createElement(IconButton, null, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 20px'
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    value: 4,
    max: 12
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      flex: 1,
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--kairo-blue-700)',
      letterSpacing: '.03em',
      textTransform: 'uppercase'
    }
  }, "Physics \xB7 Mechanics"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      lineHeight: 1.55,
      color: 'var(--text-body)',
      marginTop: 14,
      fontWeight: 500
    }
  }, "A body of mass 2kg is acted on by a constant force of 10N. What is its acceleration?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      marginTop: 20
    }
  }, options.map((opt, i) => {
    const isSelected = selected === i;
    const isCorrect = submitted && i === correctIndex;
    const isWrongPick = submitted && isSelected && i !== correctIndex;
    let border = 'var(--color-border-subtle)';
    let bg = '#fff';
    if (!submitted && isSelected) {
      border = 'var(--kairo-navy-900)';
      bg = 'var(--kairo-blue-100)';
    }
    if (isCorrect) {
      border = 'var(--state-success)';
      bg = 'var(--state-success-bg)';
    }
    if (isWrongPick) {
      border = 'var(--state-danger)';
      bg = 'var(--state-danger-bg)';
    }
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      disabled: submitted,
      onClick: () => setSelected(i),
      style: {
        textAlign: 'left',
        minHeight: 48,
        padding: '12px 16px',
        borderRadius: 14,
        border: `1.5px solid ${border}`,
        background: bg,
        color: 'var(--text-body)',
        fontSize: 15,
        cursor: submitted ? 'default' : 'pointer',
        fontFamily: 'inherit',
        display: 'flex',
        gap: 10,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 22,
        height: 22,
        borderRadius: '50%',
        border: `1.5px solid ${isSelected || isCorrect ? border : 'var(--kairo-ink-300)'}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: 12,
        fontWeight: 700,
        background: isSelected && !submitted ? 'var(--kairo-navy-900)' : isCorrect ? 'var(--state-success)' : isWrongPick ? 'var(--state-danger)' : 'transparent',
        color: isSelected && !submitted || isCorrect || isWrongPick ? '#fff' : 'var(--text-muted)'
      }
    }, String.fromCharCode(65 + i)), opt);
  })), submitted && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement(AnswerFeedback, {
    correct: selected === correctIndex,
    title: selected === correctIndex ? "Nice — that's correct" : 'Not quite',
    detail: selected === correctIndex ? 'You correctly applied a = F / m = 10 / 2.' : 'Try dividing force by mass: a = F / m.'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 20px 24px'
    }
  }, !submitted ? /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    disabled: selected === null,
    onClick: submit
  }, "Submit Answer") : /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    onClick: onFinish
  }, "Next")));
}
window.KairoUI = window.KairoUI || {};
window.KairoUI.Practice = Practice;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/kairo-app/Practice.jsx", error: String((e && e.message) || e) }); }

// ui_kits/kairo-app/Profile.jsx
try { (() => {
function Profile() {
  const {
    Card,
    Badge,
    Switch
  } = window.KairoDesignSystem_1c2e7f;
  const [notif, setNotif] = React.useState(true);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 20px 24px',
      fontFamily: 'var(--font-body)',
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 800,
      fontSize: 22,
      color: 'var(--text-heading)'
    }
  }, "Profile"), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: 'var(--kairo-blue-100)'
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 16,
      color: 'var(--text-heading)'
    }
  }, "Wisdom Adeyemi"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, "UTME 2027 Candidate \xB7 74 days to go"))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      color: 'var(--text-heading)',
      marginBottom: 10
    }
  }, "What I'm Aiming For"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, "Target University"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: 'var(--text-heading)'
    }
  }, "University of Lagos")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, "Target Course"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: 'var(--text-heading)'
    }
  }, "Medicine & Surgery")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, "Target Score"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: 'var(--text-heading)'
    }
  }, "320")))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      color: 'var(--text-heading)',
      marginBottom: 10
    }
  }, "Achievement Highlights"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "gold"
  }, "Reinforced: Mole Concept"), /*#__PURE__*/React.createElement(Badge, {
    tone: "gold"
  }, "12 Day Streak"), /*#__PURE__*/React.createElement(Badge, {
    tone: "gold"
  }, "First Full Mock"))), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14,
      color: 'var(--text-heading)'
    }
  }, "Academic Nudges"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, "Fading concepts & review reminders")), /*#__PURE__*/React.createElement(Switch, {
    checked: notif,
    onChange: () => setNotif(!notif)
  })));
}
window.KairoUI = window.KairoUI || {};
window.KairoUI.Profile = Profile;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/kairo-app/Profile.jsx", error: String((e && e.message) || e) }); }

// ui_kits/kairo-app/Review.jsx
try { (() => {
function Review() {
  const {
    Card,
    Badge,
    Button
  } = window.KairoDesignSystem_1c2e7f;
  const categories = [{
    label: 'Due for Review',
    desc: '2 concepts are starting to fade — a quick pass now keeps them from slipping further.',
    count: 2
  }, {
    label: 'Recent Mistakes',
    desc: 'From your last 3 sessions.',
    count: 4
  }, {
    label: 'Weak Topics',
    desc: 'Organic Chemistry could use a confidence check.',
    count: 3
  }, {
    label: 'Bookmarks',
    desc: 'Questions you\u2019ve saved for later.',
    count: 6
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 20px 24px',
      fontFamily: 'var(--font-body)',
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 800,
      fontSize: 22,
      color: 'var(--text-heading)'
    }
  }, "Review"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--text-muted)'
    }
  }, "3 things are ready to come back to you."), /*#__PURE__*/React.createElement(Card, {
    style: {
      background: 'var(--kairo-navy-900)',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: '.06em',
      color: 'var(--kairo-blue-300)',
      fontWeight: 700
    }
  }, "SUGGESTED REVIEW"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 700,
      fontSize: 18,
      marginTop: 8
    }
  }, "Quick pass on 2 fading concepts"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--kairo-blue-200)',
      marginTop: 8
    }
  }, "About 10 minutes"), /*#__PURE__*/React.createElement(Button, {
    variant: "gold",
    size: "md",
    style: {
      marginTop: 16
    },
    fullWidth: true
  }, "Start Review")), categories.map(c => /*#__PURE__*/React.createElement(Card, {
    key: c.label,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      color: 'var(--text-heading)'
    }
  }, c.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)',
      marginTop: 4,
      maxWidth: 240
    }
  }, c.desc)), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, c.count))));
}
window.KairoUI = window.KairoUI || {};
window.KairoUI.Review = Review;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/kairo-app/Review.jsx", error: String((e && e.message) || e) }); }

// ui_kits/kairo-app/SessionSummary.jsx
try { (() => {
function SessionSummary({
  onDone
}) {
  const {
    SessionSummaryCard,
    Button,
    Card
  } = window.KairoDesignSystem_1c2e7f;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '32px 20px 24px',
      fontFamily: 'var(--font-body)',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: '50%',
      background: 'var(--accent-gold-bg)',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "30",
    height: "30",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--kairo-gold-600)",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2c1 4-3 5-3 9a3 3 0 006 0c0-1-.5-2-1-2 1 3-1 4-2 4a2 2 0 01-2-2c0-3 3-4 2-9z"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 800,
      fontSize: 22,
      color: 'var(--text-heading)',
      marginTop: 14
    }
  }, "Session Complete")), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(SessionSummaryCard, {
    headline: "You reinforced 2 concepts and steadied 1 that was fading",
    strengths: ['Cell Division — Reinforced', 'Newton\u2019s Second Law — Held'],
    nextSteps: ['Review: Atomic Structure (still fading)', 'Come back tomorrow — that\u2019s enough for today'],
    scoreDelta: 12
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)',
      fontStyle: 'italic',
      textAlign: 'center'
    }
  }, "\"You remembered the redox concept yesterday \u2014 that's the second time it's stuck.\""), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    onClick: onDone,
    style: {
      marginTop: 'auto'
    }
  }, "Back to Home"));
}
window.KairoUI = window.KairoUI || {};
window.KairoUI.SessionSummary = SessionSummary;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/kairo-app/SessionSummary.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.AnswerFeedback = __ds_scope.AnswerFeedback;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.ScoreBadge = __ds_scope.ScoreBadge;

__ds_ns.StreakBadge = __ds_scope.StreakBadge;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.KaiMessage = __ds_scope.KaiMessage;

__ds_ns.MissionCard = __ds_scope.MissionCard;

__ds_ns.QuestionCard = __ds_scope.QuestionCard;

__ds_ns.SessionSummaryCard = __ds_scope.SessionSummaryCard;

__ds_ns.BottomNav = __ds_scope.BottomNav;

__ds_ns.TopBar = __ds_scope.TopBar;

})();
