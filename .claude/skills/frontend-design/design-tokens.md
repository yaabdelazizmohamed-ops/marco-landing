# Design Tokens Reference

Complete token inventory. All values live in `/styles/tokens.css`. This document is the reference — the CSS file is the implementation. When they disagree, fix the CSS file.

---

## Color Tokens

### Editorial Surface — Monochrome

```css
/* Backgrounds */
--white: #fafaf8;          /* Page background — warm off-white */
--light: #f0f0ed;          /* Slightly darker surface, alt card bg, note bg */

/* Text */
--black: #0a0a0a;          /* Primary text — warm near-black */
--gray: #6b6b63;           /* Secondary text, metadata, placeholders */
--gray-soft: #b0b0a8;      /* Tertiary text, decorative only, never for readable content */
--accent: #3a3a35;         /* Dark warm gray — emphasis without using full black */

/* Borders */
--border: #e2e2df;         /* Standard border — quiet but visible */
--border-soft: #ebebea;    /* Very quiet border — hover state borders, dividers */
```

**Usage rules:**
- `--white` is the page background. `--light` is the card/panel surface on top of it.
- `--gray-soft` fails WCAG AA for text — use only for icons or purely decorative non-informational elements.
- `--accent` is for secondary headings or callout text that needs more weight than `--gray` but shouldn't be full `--black`.
- Border tokens below 3:1 contrast against `--white` — do not use as the sole differentiator for interactive states (supplement with `--border` minimum `#c8c8c2` for chip outlines).

---

### Product Accent — Ink-Violet

```css
--product-deep:   #2c2e7a;  /* Primary CTA bg, strong interactive fill */
--product-accent: #6366cc;  /* Progress bars, active chips, badge fills */
--product-soft:   #eeeefa;  /* AI bubble backgrounds, tinted panels */
--product-soft-2: #f5f4fb;  /* Lighter tint — hover on product-soft elements */
```

**Usage rules:**
- `--product-deep` is the CTA color on product surfaces. Never on editorial surfaces.
- `--product-accent` is the mid-weight version — use for progress fills and active state indicators.
- `--product-soft` is the background for AI-originated content (chat bubbles, hint panels).
- `--product-soft-2` is the hover background for anything that rests at `--product-soft`.
- On `--product-deep` background, text must be `--white` or `#ffffff`. Verify contrast (the deep value passes at ~10:1 against white).
- On `--product-soft` background, text should be `--product-deep` for heading and `--black` for body (both pass AA comfortably).

---

### Semantic Colors

Always used as pairs: a text/border color + a background tint. Never use the background tint as text color, or the text color as a background.

```css
/* Success — green */
--success:       #16a34a;  /* Text, icon, border */
--success-soft:  #f0fdf4;  /* Background tint */

/* Warning — amber */
--warning:       #d97706;  /* Text, icon, border */
--warning-soft:  #fffbeb;  /* Background tint */

/* Danger — red */
--danger:        #dc2626;  /* Text, icon, border */
--danger-soft:   #fef2f2;  /* Background tint */
```

**Usage rules:**
- These colors communicate status. They are not available for decorative use.
- `--success` on `--success-soft` background: ~5.1:1 — passes AA.
- `--warning` on `--warning-soft` background: ~4.6:1 — passes AA.
- `--danger` on `--danger-soft` background: ~5.3:1 — passes AA.
- When using any semantic color, always pair it with a text label — never rely on color alone.

---

## Typography Tokens

### Font Families

```css
--font-serif: 'Instrument Serif', Georgia, serif;
--font-sans:  'DM Sans', system-ui, -apple-system, sans-serif;
--font-mono:  'JetBrains Mono', 'Fira Code', monospace;
```

**Google Fonts import:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,500;1,9..40,600&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

### Text Scale

```css
--text-xs:   0.72rem;   /* ~11.5px — timestamps, footnotes, meta */
--text-sm:   0.82rem;   /* ~13px   — chip labels, captions, helper text */
--text-base: 0.92rem;   /* ~14.7px — body copy, input text, table content */
--text-lg:   1.05rem;   /* ~16.8px — card titles, section subheadings */
--text-xl:   1.25rem;   /* ~20px   — page section headings (product) */
--text-2xl:  1.6rem;    /* ~25.6px — hero headings on product, large display */
```

On editorial surfaces, display headings bypass this scale and use `clamp()` for fluid sizing:
```css
/* Editorial H1 only */
font-size: clamp(2.4rem, 5vw, 4.2rem);
font-family: var(--font-serif);
font-style: italic;
letter-spacing: -0.02em;
line-height: var(--leading-tight);
```

---

### Weight Tokens

```css
--weight-regular:  400;
--weight-medium:   500;
--weight-semibold: 600;
```

DM Sans renders cleanly at all three weights. 300 (light) exists in the import for specific editorial body text but is not exposed as a token — if you need it, define it. 700+ weights are not loaded and should not be used.

---

### Leading (Line Height) Tokens

```css
--leading-tight:   1.15;   /* Large display headings only */
--leading-snug:    1.35;   /* Card titles, section headings, compact lists */
--leading-normal:  1.55;   /* Body copy, descriptions, form helper text */
--leading-relaxed: 1.75;   /* Long-form prose, legal text, onboarding copy */
```

---

### Letter Spacing

Not tokenized — applied directly with semantic intent:

```css
/* Display serif italic */
letter-spacing: -0.02em;

/* DM Sans at xl and above */
letter-spacing: -0.01em;

/* DM Sans at base and below */
letter-spacing: 0;

/* All-caps labels (use sparingly) */
letter-spacing: 0.06em;
```

---

## Spacing Tokens

Base unit: `--space-2` = 8px. All values are multiples of 4px.

```css
--space-1:  4px;    /* Icon-to-label gaps, sub-pixel nudges */
--space-2:  8px;    /* Gap between sibling elements */
--space-3:  12px;   /* Compact chip padding, tight list items */
--space-4:  16px;   /* Standard component internal padding */
--space-5:  20px;   /* Card padding (preferred) */
--space-6:  24px;   /* Section-internal gaps, form row gaps */
--space-7:  28px;   /* (available, use sparingly) */
--space-8:  32px;   /* Between distinct component groups */
--space-10: 40px;   /* Compact section padding */
--space-12: 48px;   /* Standard section padding */
--space-14: 56px;   /* Intermediate — nav height, large input areas */
--space-16: 64px;   /* Major section gaps */
--space-20: 80px;   /* Hero padding, generous section breathing room */
--space-24: 96px;   /* Maximum section padding — use for hero sections only */
```

Skip values are intentional — `--space-7`, `--space-9`, `--space-11` exist but see rare use. Prefer the round multiples of 8. When you need something between two tokens and you find yourself reaching for an arbitrary value, that is a signal to reconsider the layout rather than invent a new spacing value.

---

## Radius Tokens

```css
--radius-sm:   8px;      /* Small badges, code tags, tight indicators */
--radius-md:   16px;     /* Form inputs, secondary panels */
--radius-lg:   24px;     /* Cards, tiles, panels — the default card radius */
--radius-xl:   32px;     /* Large feature cards, hero elements */
--radius-pill: 9999px;   /* Buttons, chips, tags, avatars, progress bars */
```

These five values cover every use case. If you find yourself wanting `12px` or `20px`, you are between tokens — go to the nearest one.

---

## Shadow Tokens

Three levels. Each level has a specific purpose and should not be used at other levels.

```css
--shadow-sm: 0 1px 3px rgba(10, 10, 10, 0.06),
             0 1px 2px rgba(10, 10, 10, 0.04);

--shadow-md: 0 4px 16px rgba(10, 10, 10, 0.08),
             0 2px 6px rgba(10, 10, 10, 0.05);

--shadow-lg: 0 12px 40px rgba(10, 10, 10, 0.12),
             0 4px 12px rgba(10, 10, 10, 0.06);
```

| Token | Use |
|---|---|
| `--shadow-sm` | Card resting state. Gentle separation from background. |
| `--shadow-md` | Card hover elevation. Dropdown menus. Floating action buttons resting. |
| `--shadow-lg` | Modals, popovers, dialogs. Floating action buttons on hover. |

**Rules:**
- Do not use `--shadow-md` as the resting state for cards — it makes everything feel equally prominent.
- Do not add shadows to elements that are already visually differentiated by background color and border.
- No inset shadows, no colored shadows, no multi-stop shadow stacks beyond these two-layer values.

---

## Duration & Easing Tokens

```css
--duration-fast:  120ms;
--duration-base:  200ms;
--duration-slow:  350ms;

--ease-soft: cubic-bezier(0.16, 1, 0.3, 1);   /* Snappy deceleration — progress, expand */
--ease-out:  cubic-bezier(0.0, 0.0, 0.2, 1);   /* Standard ease-out — most UI transitions */
```

| Token | Use |
|---|---|
| `--duration-fast` | Color/border changes on hover. Focus outline appearance. |
| `--duration-base` | Transform + shadow on hover. State changes (active/inactive chips). |
| `--duration-slow` | Progress bar fill animation trigger. Panel expand/collapse. |
| `--ease-soft` | Anything that needs a springy overshoot feel — progress fills, slide-in panels. |
| `--ease-out` | Standard UI motion — buttons, cards, links. |

**Progress bar animation convention:**
```js
// Double-pump rAF pattern to trigger CSS transition after paint
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    bar.style.width = targetWidth + '%';
  });
});
```

Same pattern applies for SVG ring dashoffset animations. The double rAF ensures the browser has painted the initial state (0%) before transitioning to the target.

---

## Derived / Composite Values

Not tokens, but values that appear repeatedly and should be consistent:

```css
/* Standard card */
border: 1px solid var(--border);
border-radius: var(--radius-lg);
padding: var(--space-5);
background: var(--white);
box-shadow: var(--shadow-sm);

/* Primary button */
background: var(--black);
color: var(--white);
border-radius: var(--radius-pill);
padding: 0.6rem var(--space-6);
font-family: var(--font-sans);
font-size: var(--text-base);
font-weight: var(--weight-medium);

/* Chip / tag */
border-radius: var(--radius-pill);
padding: 0.3rem 0.8rem;
font-size: var(--text-sm);
font-weight: var(--weight-medium);
border: 1px solid var(--border);

/* Focus outline */
outline: 2px solid var(--black);
outline-offset: 2px;
```
