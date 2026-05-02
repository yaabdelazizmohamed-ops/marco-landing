---
name: frontend-design
description: Opinionated frontend design system guide — typography, color, spacing, components, states and accessibility for hand-coded HTML/CSS interfaces
tools: [Read, Write, Edit, Bash]
---

# Frontend Design Skill

A reference for building high-quality UI without a framework. Pure HTML/CSS. No Tailwind. No build steps. Everything in this document reflects decisions tested against real product screens.

---

## When to Invoke

Use this skill when:

- Building or refactoring a hand-coded HTML/CSS prototype or production page
- Adding a new component to an existing design system (cards, chips, buttons, progress, etc.)
- Reviewing UI for consistency against an established token system
- Deciding how to handle a new state (hover, disabled, error, urgency) without introducing arbitrary values
- A screen is visually "off" and the cause needs diagnosing (inconsistent radii, bad color usage, missing contrast)
- Adding a new color or spacing value — the token must be defined before it can be used

---

## Core Philosophy

### 1. Tokens First
Every color, font, spacing value, radius, shadow, and duration lives in a CSS custom-property token before it appears anywhere else. No inline hex codes. No magic numbers. If you need a value that doesn't exist, define it in `tokens.css`, name it meaningfully, and then use it. This makes the system refactorable from one place.

### 2. Dual Surface Rule
There are exactly two surface types: **editorial** and **product**. Editorial surfaces (landing pages, marketing, auth, legal) use strict monochrome — cream, black, and grays only. Product surfaces (app screens, dashboards, chat) inherit all editorial tokens and add one functional accent family. Never bring product accent colors onto editorial surfaces and never bring arbitrary color onto product surfaces.

### 3. One Accent Maximum
A product surface gets one accent color family (e.g., ink-violet: deep / accent / soft). That accent does one job: indicate interactivity, progress, or AI presence. It is not decorative. If you find yourself wanting a second accent for "variety," that is a sign the layout or hierarchy is broken — fix the structure, not the palette.

### 4. Earn Every Decoration
Shadows, gradients, borders, and background fills all carry visual weight. Each must justify its presence. A shadow should indicate elevation or interactivity — not just "make it look nicer." A gradient on a progress fill is earned because it communicates directionality. A gradient on a card header is not earned. When in doubt, remove the decoration and see if the screen improves.

### 5. Structure Before Style
Rhythm, hierarchy, and whitespace do more work than color and decoration. If a screen feels "off," check spacing and type scale before touching color. Most "ugly" screens are actually screens with collapsed whitespace, mismatched type sizes, and inconsistent alignment — none of which color fixes.

### 6. Respect the Audience Context
UI for students (8-16) should be generous with whitespace and radius, calm in color, and unambiguous in affordance. It must not be infantilized with excessive decoration or gamified with color noise. UI for institutional users (teachers, directors) requires professional restraint — data density is acceptable, but only when justified by the use case.

---

## Typography System

### Font Roles

| Role | Font | When to Use |
|---|---|---|
| Display / Hero | `Instrument Serif`, italic | H1 on editorial surfaces only. Section-opening pull quotes. Never for UI labels. |
| Body / UI | `DM Sans` | Everything else: body text, labels, nav, inputs, buttons, captions, data |
| Mono | `JetBrains Mono` | Code, technical identifiers, timestamps requiring exact-width alignment |

### Size Scale

| Token | Value | Use |
|---|---|---|
| `--text-xs` | 0.72rem | Meta labels, timestamps, legal footnotes |
| `--text-sm` | 0.82rem | Chip labels, secondary captions, helper text |
| `--text-base` | 0.92rem | Body copy, input text, table content |
| `--text-lg` | 1.05rem | Card titles, section subheadings, emphasized body |
| `--text-xl` | 1.25rem | Page section headings (product surfaces) |
| `--text-2xl` | 1.6rem | Hero headings (product surfaces), large display on small cards |

On editorial surfaces, display headings use Instrument Serif italic at fluid sizes (clamp). On product surfaces, headings stay in DM Sans — serif italic is a marketing voice, not a product voice.

### Letter-Spacing Rules

- Instrument Serif italic display: `letter-spacing: -0.02em` — tighten, always
- DM Sans at `--text-xl` and above: `letter-spacing: -0.01em` — slight tightening
- DM Sans at `--text-base` and below: `letter-spacing: 0` — never track out body text
- All-caps labels (use sparingly): `letter-spacing: 0.06em`

### When NOT to Use Italic

Italic Instrument Serif is reserved for editorial surface display. Never use it:
- On buttons
- On UI labels, chips, or badges
- On body copy
- On product surface headings (dashboards, cuadernos, chat)
- As emphasis within body text (use `font-weight: 600` in DM Sans for emphasis)

### Line Height

- Tight (1.15): Large display headings only
- Snug (1.35): Card titles, section headings
- Normal (1.55): Body text, descriptions
- Relaxed (1.75): Long-form prose, legal text

---

## Color System

### Editorial Surface (Monochrome)

The complete palette for marketing, landing, auth, and legal surfaces. No accent colors cross this boundary.

```
Background:   --white: #fafaf8       (warm off-white, not pure white)
Text:         --black: #0a0a0a       (near-black, not pure black)
Secondary:    --gray: #6b6b63        (muted warm gray)
Tertiary:     --gray-soft: #b0b0a8   (lighter warm gray)
Surface:      --light: #f0f0ed       (slightly darker than background)
Borders:      --border: #e2e2df      (visible but quiet)
Soft borders: --border-soft: #ebebea (very quiet, hover states)
Accent text:  --accent: #3a3a35      (dark warm gray, for emphasis without black)
```

### Product Accent (Ink-Violet)

One accent family added to the product surface. Used for primary CTAs, progress indicators, AI presence, and active states.

```
--product-deep:   #2c2e7a   (primary CTA backgrounds, dark text on light)
--product-accent: #6366cc   (chips active, progress fill, badge accent)
--product-soft:   #eeeefa   (tinted backgrounds, AI bubble bg)
--product-soft-2: #f5f4fb   (even lighter tint, hover on product-soft elements)
```

### Semantic Colors

Used only for status communication. Never decoratively.

```
--success:       #16a34a   (green text on light bg)
--success-soft:  #f0fdf4   (green-tinted bg)
--warning:       #d97706   (amber text on light bg)
--warning-soft:  #fffbeb   (amber-tinted bg)
--danger:        #dc2626   (red text on light bg)
--danger-soft:   #fef2f2   (red-tinted bg)
```

### Token Naming Convention

Tokens follow `--category[-variant]` naming:
- `--white`, `--black`, `--gray`, `--gray-soft` — base palette
- `--product-deep`, `--product-accent`, `--product-soft` — product accent family
- `--success`, `--success-soft` — semantic pair pattern (always define both)
- Never name tokens after their hex value (`--color-6366cc` is forbidden)
- Never name tokens after a single use case (`--submit-button-bg` belongs in a component, not the global token sheet)

### Anti-Patterns

- **Arbitrary hex codes in component CSS** — if you're typing `#` followed by a hex code anywhere other than `tokens.css`, stop
- **Purple-without-purpose** — the product accent is not for decoration; if an element has no interactive or status meaning, it should be in the monochrome palette
- **Gradient abuse** — gradients are earned by directionality (progress bars) or depth (hero backgrounds). Card headers, section titles, and chip backgrounds do not get gradients
- **Bringing accent colors onto editorial surfaces** — `--product-deep` never appears on the landing page, legal pages, or auth screens
- **Semantic colors for non-semantic purposes** — `--danger` is not "a nice red for this heading"

---

## Spacing & Rhythm

### 8px Grid

All spacing values are multiples of 4px, preferring multiples of 8px for most cases. The base unit is `--space-2` = 8px.

| Token | Value | Typical Use |
|---|---|---|
| `--space-1` | 4px | Icon-to-label gaps, tight inline padding |
| `--space-2` | 8px | Gap between related elements |
| `--space-3` | 12px | Chip padding, compact list items |
| `--space-4` | 16px | Standard internal padding (cards, inputs) |
| `--space-5` | 20px | Card padding (preferred) |
| `--space-6` | 24px | Section-internal gaps |
| `--space-8` | 32px | Between distinct groups |
| `--space-10` | 40px | Section padding top/bottom (compact) |
| `--space-12` | 48px | Section padding (standard) |
| `--space-16` | 64px | Major section gaps |
| `--space-20` | 80px | Hero padding, large section breathing room |
| `--space-24` | 96px | Maximum section padding |

### Margin vs Padding Philosophy

- **Padding** defines a component's internal breathing room. Do not collapse it contextually.
- **Margin** (or gap in flex/grid) defines the distance between components. Prefer `gap` over margin on flex/grid containers.
- **Never** use margin on a component's outermost element to create layout spacing — the parent container's `gap` or `padding` should handle that. This makes components portable.

### Section Breathing Room

Between top-level page sections, use `padding-block: --space-16` minimum on editorial surfaces, `padding-block: --space-12` on product surfaces. Product screens are denser — they earn less space between sections — but still need clear visual separation. Do not close up sections to "fit more content." That is a layout problem, not a spacing one.

---

## Radius Scale

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 8px | Badges, inline code, tight tags |
| `--radius-md` | 16px | Input fields, secondary chips |
| `--radius-lg` | 24px | Cards, panels, modals |
| `--radius-xl` | 32px | Large feature cards, hero elements |
| `--radius-pill` | 9999px | Buttons, chips, progress bars, avatars |

### When to Use Each

- **`--radius-sm`**: Small, utilitarian elements that need some softening but are primarily data-dense (status badges, inline metric indicators).
- **`--radius-md`**: Form inputs and controls. Consistent with form convention that fields are rounder than content but not pill-shaped.
- **`--radius-lg`**: The default card radius. Nearly all cards, tiles, and panels use this. Creates the "generous, respirable" feel appropriate for the audience.
- **`--radius-xl`**: Hero cards, large feature showcases, or any element that needs to feel landmark-level prominent.
- **`--radius-pill`**: All interactive affordances where the pill shape communicates "tappable" — buttons, chips, pills, tags, avatar circles.

### Anti-Patterns

- Mixing radii randomly within a single card (the card itself is `--radius-lg`, its image crop should match or be `--radius-md`)
- Using `--radius-sm` on primary CTA buttons (they must be pill)
- Using pixel values not on the scale: `border-radius: 6px`, `12px`, `20px` — go to the nearest token

---

## States

### Hover

Hover communicates "this is interactive" without changing the element's identity.

- **Cards**: `transform: translateY(-2px)` + `box-shadow: var(--shadow-md)`. Never change the card's background color on hover.
- **Primary buttons**: Subtle darkening (`filter: brightness(0.88)`) or background shift to `--accent`. Never change to a completely different color family.
- **Chips (inactive)**: Background shifts to `--light` from `--white`. Border must remain visible.
- **Links / ghost elements**: `text-decoration: underline` or `color: --black` from `--gray`. Transition `color 200ms`.
- **All transitions**: Use `transition: [property] var(--duration-base) var(--ease-out)` for consistency. Never use `transition: all` — it causes layout thrashing.

### Disabled

```css
opacity: 0.35;
cursor: not-allowed;
pointer-events: none;
```

All three properties together, always. `opacity: 0.35` (not 0.5, not 0.4) — low enough to be unambiguous, not so low it looks broken.

### Urgency / Due-Date States

| State | Condition | Background Token | Text Token |
|---|---|---|---|
| Neutral | No deadline, or 5+ days | `--light` | `--gray` |
| Due Soon | 2–4 days remaining | `--warning-soft` | `--warning` |
| Urgent / Overdue | Today or past due | `--danger-soft` | `--danger` |
| Done | Completed | `--success-soft` | `--success` |

Never use color alone to communicate urgency — pair it with a text label ("Hoy", "Atrasado", "Entregado").

### Focus

```css
outline: 2px solid var(--black);
outline-offset: 2px;
```

On product surfaces where the black outline conflicts with dark backgrounds, use `var(--product-accent)`. Never remove the focus outline. Never replace it with a box-shadow-only approach (it fails in forced-color/high-contrast modes).

---

## Accessibility

### Contrast Minimums

- **Text on background**: 4.5:1 (AA). This is a floor, not a target. Aim for 7:1 (AAA) for body text.
- **UI components and graphical objects**: 3:1 against adjacent colors.
- `--gray` (#6b6b63) on `--white` (#fafaf8) passes at ~5.2:1. Acceptable for secondary text.
- `--gray-soft` (#b0b0a8) on `--white` (#fafaf8) is ~2.6:1. Too low for text — use only for decorative/non-informational elements.

### Border Visibility on Inactive Chips

Inactive chips on a `--white` background must have a visible border. `--border` (#e2e2df) achieves ~1.5:1 against `--white` — this is below 3:1. Use `#c8c8c2` or darker for chip borders to reach the 3:1 UI component minimum. Do not rely on a background-only color difference to distinguish a chip from its surroundings.

### Alt and ARIA Rules

- Decorative SVGs and icons that accompany visible text: `aria-hidden="true"`
- Standalone icon buttons (no visible label): `aria-label="[action]"` on the `<button>`, `aria-hidden="true"` on the SVG inside
- Informational images: `alt="[concise description]"` — not "image of" or "photo of"
- Avatar images: `alt="[Name]'s avatar"` or `alt=""` if the name appears adjacent in text
- Progress bars: `role="progressbar"` + `aria-valuenow` + `aria-valuemin` + `aria-valuemax` + `aria-label`

### Never Rely on Color Alone

Every status must have a second signal: an icon, a text label, or a pattern. The urgency system (above) always pairs color with copy. Do not create a system where the only difference between "active" and "inactive" states is a background color change.

### Semantic HTML

- Buttons that navigate: use `<a>`, not `<button onclick>`
- Buttons that perform actions: use `<button>`, not `<a>` or `<div onclick>`
- Use `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<article>` where semantically correct
- Form labels: always `<label for="input-id">` or wrapping `<label>`, never `placeholder` as the only label

---

## Anti-Patterns

These patterns make UI look generic, AI-generated, or low-craft. Each one has appeared in well-intentioned mockups and been deliberately avoided.

### Glassmorphism
`backdrop-filter: blur(...)` with semi-transparent backgrounds. It looks sophisticated in isolation; on real content it creates illegibility and pseudo-depth that conflicts with the flat editorial system. Banned.

### Rainbow Gradients
Multi-stop gradients spanning unrelated hue families on any element that is not a purely decorative illustration. Progress fills get one two-stop gradient within the product accent family. Nothing else.

### Emoji Decoration
Emoji in headings, nav labels, card titles, or CTAs. The brand voice is considered and direct. Emoji connote consumer apps and casualness. If you feel the need for an emoji, the copy is probably not doing its job — rewrite the copy.

### Every Heading Italic
Using Instrument Serif italic on all heading levels, in the product UI, or throughout a page as a general "sophisticated" style. The italic serif is effective because it is rare — reserved for the single H1 or pull quote on editorial surfaces. Overuse destroys the signal.

### Inconsistent Radii
A card at `border-radius: 12px` inside a page where all other cards are at `--radius-lg: 24px`. Or a button at `--radius-md` when all other buttons are `--radius-pill`. Inconsistency reads as "unfinished." Use the scale tokens and nothing else.

### Shadow Soup
Three or four different box-shadow values across different components with no system. A shadow system has three levels: sm (card resting), md (card hover / dropdown), lg (modal). Those three values, defined as tokens, are all that's needed.

### Card-ception
Cards inside cards inside cards. A `--radius-lg` card containing a `--radius-md` card containing a chip. Depth levels should be: page > card > inline element. A "card" inside a card is a list item or a row, not a card. Rename it and style it accordingly.

### Arbitrary Color Introduction
"I need a green here for this metric" — and a hex code gets written directly into component CSS. Every new color must be defined as a token first. If a semantic color (success/warning/danger) applies, use that token. If the use case doesn't map to any existing token, it needs a design conversation, not an inline hex.

### Hover Color Jumps
Primary buttons or interactive elements that change to a completely different color family on hover. Hover should be a refinement of the resting state (slightly darker, slightly elevated), not a state change. Color-family changes on hover are disorienting.

### `transition: all`
Produces layout thrashing, animates properties that should never animate (height, display), and makes performance unpredictable. Always specify the exact properties: `transition: transform var(--duration-base), box-shadow var(--duration-base)`.

---

## File Conventions

### Single-File HTML for Prototypes
Each screen in `/brand-examples/` is a self-contained `.html` file with `<style>` in the `<head>` and all JS inline before `</body>`. No external dependencies except Google Fonts and the shared `tokens.css`. This keeps prototypes portable, diffable, and immediately openable in a browser without a build step.

### tokens.css as Single Source of Truth
All design tokens live in `/styles/tokens.css`. Component files reference those tokens. When a value needs to change, it changes in one place. Never define a token locally inside a component's `<style>` block if it belongs to the global system.

### Spanish Copy, English Code
All visible text, UI labels, and copy: Spanish. All CSS class names, JavaScript variable names, function names, HTML IDs, and code comments: English. Never mix languages in either direction (`clase="encabezado"` is wrong; `<!-- este es el header -->` is wrong).

### Mobile-First Responsive
Write base styles for ≤420px viewport. Use `@media (min-width: 768px)` for tablet and `@media (min-width: 1200px)` for desktop. Never target mobile with overrides from a desktop base — the reverse is always harder to maintain.

### Validate Before Shipping
Before marking a screen complete: open it at 375px viewport width, check focus states by tabbing through all interactive elements, and verify that no color is the only signal for any status. These three checks catch 80% of accessibility and mobile issues.
