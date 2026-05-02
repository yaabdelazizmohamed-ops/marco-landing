# Component Patterns

Each section covers: purpose, CSS pattern, key rules, and anti-patterns. Code snippets show the essential structure — extend as needed without adding arbitrary values.

---

## 1. Cards

**Purpose:** Container for a discrete unit of content. Cards group related information and provide a tappable/hoverable surface.

### Base Card

```css
.card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  transition: transform var(--duration-base) var(--ease-out),
              box-shadow var(--duration-base) var(--ease-out);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

### KPI / Metric Card Variant

For dashboard rows where all cards must align vertically despite variable content length:

```css
.card-kpi {
  min-height: 120px;                /* Enforce uniform row height */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
```

### Key Rules

- `border-radius: var(--radius-lg)` is the default for all cards. Use `--radius-xl` only for large hero-level feature cards.
- The hover effect is `translateY(-2px)` — not `-4px`, not `-1px`. Subtle elevation, not a jump.
- Background stays `--white` on hover — never change card background color as a hover signal.
- Cards on a `--light` surface background may use `--white` to create contrast. Cards on a `--white` background may use `--light` or add `--shadow-sm`. Do not stack both a colored background and a heavy shadow.

### Anti-Patterns

- **Cards inside cards**: a card containing another card with its own border and shadow. The inner element should be a row, a table, or a styled list item — not another card.
- **Missing min-height on KPI rows**: cards in a flex row that display different heights depending on content break the visual grid.
- **`transition: all`**: causes layout thrash. Specify only `transform` and `box-shadow`.
- **Shadow on hover only**: start with `--shadow-sm` at rest so the hover elevation (`--shadow-md`) is perceptible. Zero-to-md looks like an abrupt pop.

---

## 2. Chips / Tags

**Purpose:** Small interactive or informational labels. Used for filters, category tags, active state selectors, and status indicators.

### Base Chip

```css
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 0.3rem 0.8rem;
  font-family: var(--font-sans);
  font-size: 0.78rem;                    /* between --text-xs and --text-sm */
  font-weight: var(--weight-medium);
  border-radius: var(--radius-pill);
  border: 1px solid #c8c8c2;            /* Minimum viable contrast on --white bg */
  background: var(--white);
  color: var(--gray);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out),
              color var(--duration-fast) var(--ease-out),
              border-color var(--duration-fast) var(--ease-out);
  user-select: none;
}

.chip:hover {
  background: var(--light);
  color: var(--black);
  border-color: var(--border);
}

/* Active / selected state */
.chip.active,
.chip[aria-pressed="true"] {
  background: var(--black);
  color: var(--white);
  border-color: var(--black);
}

/* Product variant — accent active */
.chip.active-accent {
  background: var(--product-deep);
  color: var(--white);
  border-color: var(--product-deep);
}
```

### Key Rules

- Inactive chips **must** have a visible border. `#c8c8c2` is the minimum on `--white`. Never rely on background-color difference alone — it fails at 3:1 UI contrast.
- Active state is black background + white text as the default. Use accent active only on product surfaces where the product accent family is in use.
- Chip font size is approximately `0.78rem` — deliberately between `--text-xs` and `--text-sm` because the pill padding provides enough visual presence that a full `--text-sm` reads too large.
- Use `aria-pressed="true"/"false"` for toggle chips in addition to the `.active` class.

### Anti-Patterns

- **No border on inactive**: background-only differentiation fails the 3:1 UI component contrast requirement.
- **Too large**: chips with `font-size: var(--text-base)` look like buttons. They are not buttons.
- **Color-only active state**: a background tint with no border change is insufficient. Active state must be clearly distinct from both inactive and hover.

---

## 3. Buttons

**Purpose:** Trigger actions. Not for navigation (use `<a>` for navigation).

### Primary Button

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0.6rem var(--space-6);
  background: var(--black);
  color: var(--white);
  border: none;
  border-radius: var(--radius-pill);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: filter var(--duration-fast) var(--ease-out);
}

.btn-primary:hover {
  filter: brightness(0.85);
}

/* Product surface primary — uses accent */
.btn-primary-accent {
  background: var(--product-deep);
  color: var(--white);
}
```

### Secondary Button

```css
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0.6rem var(--space-6);
  background: var(--light);
  color: var(--black);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out),
              border-color var(--duration-fast) var(--ease-out);
}

.btn-secondary:hover {
  background: var(--white);
  border-color: var(--accent);
}
```

### Ghost Button

```css
.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0.5rem var(--space-4);
  background: transparent;
  color: var(--gray);
  border: none;
  border-radius: var(--radius-pill);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: var(--weight-regular);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out);
}

.btn-ghost:hover {
  color: var(--black);
}
```

### Disabled State (All Variants)

```css
.btn-primary:disabled,
.btn-secondary:disabled,
.btn-ghost:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: none;
}
```

Apply the same three properties together on every button variant. Do not simulate disabled by just changing background — it won't block interaction without `pointer-events: none`.

### Floating CTA

```css
.btn-cta-floating {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  z-index: 100;
  padding: 0.75rem var(--space-8);
  background: var(--black);
  color: var(--white);
  border: none;
  border-radius: var(--radius-pill);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: transform var(--duration-base) var(--ease-out),
              box-shadow var(--duration-base) var(--ease-out);
}

.btn-cta-floating:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

### Key Rules

- All buttons use `--radius-pill`. No exceptions. `--radius-md` is for form inputs.
- Primary buttons never change color family on hover — `filter: brightness(0.85)` is the hover signal.
- Ghost buttons have no border — if you want a bordered low-emphasis button, use secondary.
- Floating CTAs use `position: fixed`, not `absolute` — they stay visible on scroll.

### Anti-Patterns

- **`<div>` as a button**: always use `<button>` or `<a>`.
- **Missing `type="button"`**: add `type="button"` to every `<button>` that is not a form submit, or it will trigger form submission.
- **Hover color jump**: primary going from black to purple is disorienting. Brightness shift stays in the same color family.
- **Small tap target**: minimum 44px height for all interactive elements on mobile.

---

## 4. Progress Bars

**Purpose:** Communicate completion percentage for tasks, courses, or assignments.

```css
.progress-track {
  width: 100%;
  height: 6px;
  background: var(--light);
  border-radius: var(--radius-pill);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  width: 0%;                             /* Start at 0, animate to target via JS */
  border-radius: var(--radius-pill);
  background: linear-gradient(
    90deg,
    var(--product-deep),
    var(--product-accent)
  );
  transition: width var(--duration-slow) var(--ease-soft);
}
```

```js
// Animate on DOMContentLoaded via rAF double-pump
document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.progress-fill').forEach(bar => {
        bar.style.width = bar.dataset.progress + '%';
      });
    });
  });
});
```

```html
<div class="progress-track" role="progressbar"
     aria-valuenow="72" aria-valuemin="0" aria-valuemax="100"
     aria-label="Progreso del módulo">
  <div class="progress-fill" data-progress="72"></div>
</div>
```

### Key Rules

- Height: 5-6px. Anything taller starts looking like a slider or UI control.
- Gradient direction: left-to-right (90deg). `--product-deep` → `--product-accent` — darker to lighter, communicating forward progress.
- The `width: 0%` initial state is mandatory for the rAF animation to trigger the CSS transition. If the initial width matches the target, no transition fires.
- `role="progressbar"` + aria attributes on the track element, not the fill.

### Anti-Patterns

- **Tall bars (10px+)**: reads as a range input.
- **Hard edge**: `border-radius: 0` on a bar that is full-width looks clipped and unfinished.
- **No animation**: static progress bars lose the communicative value of showing "this is a live computed percentage."

---

## 5. SVG Ring Progress

**Purpose:** Circular progress indicator for student profiles, completion summaries, or any metric requiring a radial display.

```html
<svg width="80" height="80" viewBox="0 0 80 80" aria-label="72% completado" role="img">
  <!-- Track ring -->
  <circle cx="40" cy="40" r="32"
    fill="none"
    stroke="var(--light)"
    stroke-width="6"/>
  <!-- Progress ring -->
  <circle cx="40" cy="40" r="32"
    fill="none"
    stroke="var(--product-accent)"
    stroke-width="6"
    stroke-linecap="round"
    stroke-dasharray="201.06"
    stroke-dashoffset="201.06"
    class="ring-fill"
    data-progress="72"
    transform="rotate(-90 40 40)"/>
</svg>
```

```css
.ring-fill {
  transition: stroke-dashoffset var(--duration-slow) var(--ease-soft);
}
```

```js
// stroke-dasharray = 2 * Math.PI * r
// stroke-dashoffset = dasharray * (1 - progress/100)
document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.ring-fill').forEach(ring => {
        const progress = parseFloat(ring.dataset.progress) / 100;
        const circumference = parseFloat(ring.getAttribute('stroke-dasharray'));
        ring.style.strokeDashoffset = circumference * (1 - progress);
      });
    });
  });
});
```

### Key Rules

- `stroke-dasharray` = `2πr`. For r=32: `2 * Math.PI * 32 ≈ 201.06`.
- Start at full `stroke-dashoffset` (= dasharray = fully hidden). Animate toward target.
- `transform="rotate(-90 40 40)"` — start progress at 12 o'clock, not 3 o'clock.
- `stroke-linecap="round"` — the rounded endpoints differentiate this from a mechanical gauge.
- Same rAF double-pump as bar progress.

### Anti-Patterns

- **Missing rotate transform**: progress starting at 3 o'clock looks unpolished.
- **square linecap**: use `round` always for this component.
- **`stroke-dasharray` as a shorthand for "fake 70%"**: compute it properly from the radius.

---

## 6. Chat Bubbles

**Purpose:** Display AI-student conversation in the cuaderno/chat interface. The AI is the protagonist — its messages should feel visually prominent and distinct.

### AI Message (Protagonist)

```css
.bubble-ai {
  max-width: 80%;
  align-self: flex-start;
  padding: var(--space-4) var(--space-5);
  background: var(--product-soft);
  color: var(--black);
  border-radius: var(--radius-lg);
  border-bottom-left-radius: var(--radius-sm);  /* "tail" direction */
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
}

/* AI name / label above bubble */
.bubble-ai-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--product-accent);
  margin-bottom: var(--space-1);
}
```

### User Message

```css
.bubble-user {
  max-width: 75%;
  align-self: flex-end;
  padding: var(--space-3) var(--space-5);
  background: var(--light);
  color: var(--black);
  border-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-sm);  /* "tail" direction */
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
}
```

### Chat Container

```css
.chat-thread {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
}
```

### Key Rules

- AI bubble uses `--product-soft` background. User bubble uses `--light`. This makes the AI visually distinct and "owned" by the product brand.
- AI bubble is visually more prominent: larger max-width (80% vs 75%), branded color, labeled with the AI name.
- The `border-radius` "tail" is optional but improves readability of conversation direction. Use the asymmetric radius pattern (`border-bottom-left-radius: --radius-sm` for AI, `border-bottom-right-radius: --radius-sm` for user).
- Text color in both bubbles is `--black` — never use `--product-deep` as body text on `--product-soft` background (it reads as too heavy).

### Anti-Patterns

- **Equal visual weight for AI and user**: the AI is the protagonist; its messages should command more visual presence.
- **Dark bubble backgrounds**: `--product-deep` as a bubble background creates high contrast that is tiring at chat length. Keep backgrounds light.
- **Centered bubbles**: chat layouts are always left-aligned (AI) and right-aligned (user), never centered.

---

## 7. Badges / Urgency Indicators

**Purpose:** Compact status communication. Always pair color with a text label.

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-pill);
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  white-space: nowrap;
}

/* Overdue */
.badge-overdue {
  background: var(--danger-soft);
  color: var(--danger);
}

/* Due soon (2-4 days) */
.badge-soon {
  background: var(--warning-soft);
  color: var(--warning);
}

/* Completed */
.badge-done {
  background: var(--success-soft);
  color: var(--success);
}

/* New / unread */
.badge-new {
  background: var(--product-soft);
  color: var(--product-deep);
}

/* Neutral (no deadline / 5+ days) */
.badge-neutral {
  background: var(--light);
  color: var(--gray);
}
```

### Key Rules

- Font size: `--text-xs` (0.72rem). Badges are metadata, not content.
- Always include a text label. `badge-overdue` with only a red dot fails accessibility — add "Atrasado".
- Never use `--danger` or `--warning` as background colors — use only the `-soft` tints as backgrounds.
- `white-space: nowrap` prevents badge text from wrapping and breaking the pill shape.

### Anti-Patterns

- **Color-only badges**: a red dot with no label is not accessible.
- **Large badges**: if a badge exceeds ~80px wide, reconsider — it may need to be a status chip, not a badge.
- **Semantic colors for non-status use**: `badge-overdue` styling on a "Categories" label is wrong.

---

## 8. Forms

**Purpose:** Collect input from users. Forms on editorial surfaces (landing contact) differ slightly from forms on product surfaces (student submission), but the pattern is the same.

### Form Group

```css
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--black);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.65rem var(--space-4);
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  color: var(--black);
  transition: border-color var(--duration-fast) var(--ease-out);
  outline: none;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--black);          /* border darkens on focus — no ring */
}

.form-input::placeholder {
  color: var(--gray-soft);
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}
```

### Error State

```css
.form-input.error,
.form-textarea.error {
  border-color: var(--danger);
}

.form-helper {
  font-size: var(--text-xs);
  color: var(--gray);
}

.form-helper.error {
  color: var(--danger);
}
```

```html
<div class="form-group">
  <label class="form-label" for="email">Correo electrónico</label>
  <input class="form-input error" type="email" id="email" name="email"
         placeholder="tu@colegio.es" aria-describedby="email-error">
  <span class="form-helper error" id="email-error" role="alert">
    Introduce un correo válido
  </span>
</div>
```

### Key Rules

- Label always above input — never `placeholder` as sole label.
- Focus state: border-color darkens to `--black`. No outline ring — the outline is suppressed with `outline: none` and the border carries the focus signal. (Note: this removes the default focus ring — only acceptable when a clearly visible alternative — the dark border — is provided.)
- Error state: border `--danger` + helper text in `--danger` + `role="alert"` on the error message.
- Textarea: `min-height: 80px`, `resize: vertical`. Never `resize: none` unless absolutely required by layout.
- Select elements must be styled to match inputs — don't leave them as browser defaults.

### Anti-Patterns

- **Placeholder as label**: disappears on focus, fails accessibility.
- **Missing `for`/`id` association**: label and input must be linked.
- **Color-only error**: red border with no text message is insufficient.
- **`outline: none` without a substitute**: always provide a visible focus indicator.

---

## 9. Navigation Tabs (Demo / Audience Selector)

**Purpose:** Allow switching between audience views (student / teacher / director) or between content sections within a product screen.

### Audience Tab Group

```css
.tab-group-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.tab-group-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--gray);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tab-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.tab-separator {
  width: 1px;
  height: 20px;
  background: var(--border);
  margin: 0 var(--space-1);
}

.tab {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem var(--space-4);
  border-radius: var(--radius-pill);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--gray);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out),
              color var(--duration-fast) var(--ease-out),
              border-color var(--duration-fast) var(--ease-out);
  white-space: nowrap;
}

.tab:hover {
  background: var(--light);
  color: var(--black);
}

.tab.active {
  background: var(--black);
  color: var(--white);
  border-color: var(--black);
}
```

### Key Rules

- Inactive tabs must have a visible border (`var(--border)` at minimum, prefer `#c8c8c2` on `--white` backgrounds for 3:1 compliance).
- Active tab is black background + white text — the same pattern as active chips.
- Use a separator element between tab groups when multiple audience groups are adjacent. This is clearer than spacing alone.
- The group label (ALUMNOS / PROFESORES) uses all-caps with `letter-spacing: 0.06em` — one of the few permitted uses of tracked all-caps.

### Anti-Patterns

- **Underline-only tabs**: underline alone fails the 3:1 UI contrast threshold for the inactive border requirement.
- **Text color as sole active indicator**: color change without background fill is insufficient — ensure active state is unambiguous.
- **Too many tabs**: more than 5-6 items per group suggests a different navigation pattern is needed (dropdown, sidebar).

---

## 10. Avatars

**Purpose:** Represent a person or the AI agent. Two distinct treatments: AI/brand avatar (serif italic monogram) and user avatar (sans-serif initial, lighter treatment).

### AI / Brand Avatar

```css
.avatar-ai {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--black);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.1rem;
  font-weight: 400;
  flex-shrink: 0;
  user-select: none;
}
```

### User / Student Avatar

```css
.avatar-user {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--light);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  flex-shrink: 0;
  user-select: none;
}
```

### Photo Avatar

```css
.avatar-photo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
```

### Size Variants

```css
/* Small — inline, nav, list items */
.avatar-sm { width: 28px; height: 28px; font-size: 0.7rem; }

/* Default — 36-40px (see above) */

/* Large — profile headers, onboarding */
.avatar-lg { width: 64px; height: 64px; font-size: 1.6rem; }

/* XL — hero/profile page */
.avatar-xl { width: 96px; height: 96px; font-size: 2.2rem; }
```

### Key Rules

- AI avatar uses Instrument Serif italic, black background. This is the only non-editorial surface use of the serif — because the avatar IS a brand mark.
- User avatar uses DM Sans, lighter background (`--light`). The contrast between the two styles immediately signals "this is the AI" vs "this is the student."
- Photo avatars use `object-fit: cover` to prevent distortion. Always provide a fallback initial avatar in case the image fails to load.
- `flex-shrink: 0` on all avatar variants — they must never compress in a flex row.
- Add `alt` attribute or `aria-label` on all avatar images. For decorative initials in a `<div>`: `aria-hidden="true"` if the name appears adjacent as visible text.

### Anti-Patterns

- **User avatar as serif italic**: the serif italic is the AI's identity signal. User avatars are sans-serif.
- **Missing `flex-shrink: 0`**: avatars in flex rows will compress when text is long.
- **Avatar without fallback**: if using `<img>`, always have an `onerror` handler or CSS fallback that shows the initial.
- **Oversized AI avatar in chat thread**: in a message list, the AI avatar should be `avatar-sm` (28-32px). Reserve large avatars for header/profile contexts.
