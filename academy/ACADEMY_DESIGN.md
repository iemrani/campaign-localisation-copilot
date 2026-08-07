# Operations Hub Academy Design

The Academy app uses an isolated professional operations-hub training theme. It
does not share CSS with the main Operations Hub app, but it now follows the
same product direction: dark/light mode, restrained operational panels, and a
flag-based English/Italian language control.

## Theme Isolation

The Academy theme lives only in:

- `copilot-academy/src/styles.css`
- `copilot-academy/src/app.js`

The main Operations Hub app under `app/` is not imported or modified by the Academy.

## Theme Tokens

Edit these variables at the top of `src/styles.css` to adjust the Academy look:

```css
--academy-bg-base
--academy-bg-shell
--academy-bg-panel
--academy-bg-panel-strong
--academy-bg-elevated

--academy-accent-primary
--academy-accent-secondary
--academy-accent-magenta
--academy-accent-warning
--academy-accent-error

--academy-text-main
--academy-text-muted
--academy-text-soft

--academy-border
--academy-border-hot
--academy-border-cyan

--academy-font-display
--academy-font-body
--academy-font-mono
```

## Visual Pattern

The theme is aligned with the current Campaign Operations Hub:

- dark operational base with a clean light mode
- command-style sidebar navigation
- slim operations-hub top bar
- green, cyan, and Lavazza-gold status accents
- panel grid with subtle title bars, restrained borders, and compact evidence blocks
- compact KPI blocks and status chips

## Typography

Topic headings use `--academy-font-display`, which is tuned for a crisp
operations-dashboard feel. Explanatory text uses `--academy-font-body` so paragraphs stay
readable. If headings feel too strong, reduce the `clamp(...)` values for
`h1`, `.lesson-intro h2`, and `.hero-panel h2` in `src/styles.css`.

## Light Mode

Light mode is supported through `:root[data-theme="light"]` in `src/styles.css`.
The selected mode is persisted in browser local storage as `academy.theme`.
Light mode intentionally removes most neon glow shadows and uses softer slate
shadows so panels feel crisp on a pale surface.

## Safe Changes

To restyle the Academy without affecting the main app, only edit files inside
`copilot-academy/`.
