# UI Redesign (Minimal Elegante) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the existing TranslateAI client (React + Vite) into a "minimal elegante" dark theme — refined palette, Inter typography, and noticeable-but-tasteful CSS animations — without changing layout structure or app logic.

**Architecture:** Pure CSS (custom properties + `@keyframes`), no new npm dependencies. Animation state (icon rotation, remount-triggered reveals, error shake) is driven by small pieces of existing React state plus the `key` prop trick to replay CSS animations on remount.

**Tech Stack:** React 19 + TypeScript + Vite (client), plain CSS files (no CSS-in-JS, no animation library).

## Global Constraints

- Design spec: `docs/superpowers/specs/2026-07-25-ui-redesign-design.md` — follow it verbatim for palette/typography/component treatment.
- No new npm dependencies (approved approach A: pure CSS). Font is loaded via a Google Fonts `<link>` in `client/index.html`, not an npm package.
- Dark theme only — no light/dark toggle, no `prefers-color-scheme: light` overrides.
- Keep the existing layout/grid structure exactly as-is (two columns + bottom panel, single column below 900px). Only the visual skin and animations change.
- Accent color: `#4f6bf6` (indigo), light variant `#8ba3ff`, strong/hover variant `#3a54e0`.
- This repo has no test framework configured. Verification for `.tsx` changes is `pnpm --filter client build` (TypeScript + Vite compile check). Verification for CSS-only changes is running the dev server and checking the page loads (curl 200) plus a visual check in the browser.
- Git repo exists and is pushed to `https://github.com/OscarNarvaez/traductor_IA.git` on `main`. Commit after each task; push after each commit since the remote is already connected and authorized.
- The dev servers may already be running in the background from earlier in the session (`pnpm dev` at repo root — client on `:5173`, server on `:3000`). If `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/` doesn't return `200`, start them with `pnpm dev` from the repo root before verifying.

---

### Task 1: Design tokens + global reset

**Files:**
- Modify: `client/index.html`
- Modify: `client/src/index.css`

**Interfaces:**
- Produces: CSS custom properties on `:root` that all later tasks consume: `--bg-base`, `--bg-base-end`, `--surface`, `--surface-border`, `--surface-border-hover`, `--accent`, `--accent-light`, `--accent-strong`, `--text-primary`, `--text-secondary`, `--success`, `--success-bg`, `--error`, `--radius-lg`.

- [ ] **Step 1: Add the Inter font link and update the page title in `client/index.html`**

Replace the full file with:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <title>TranslateAI · Traductor Didáctico</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Replace `client/src/index.css` with design tokens + a dark-only global reset**

```css
:root {
  color-scheme: dark;

  --bg-base: #0a0e17;
  --bg-base-end: #0d1220;
  --surface: #111827;
  --surface-border: rgba(255, 255, 255, 0.06);
  --surface-border-hover: rgba(79, 107, 246, 0.45);

  --accent: #4f6bf6;
  --accent-light: #8ba3ff;
  --accent-strong: #3a54e0;

  --text-primary: #e8ecf5;
  --text-secondary: #8b96ab;

  --success: #86efac;
  --success-bg: rgba(134, 239, 172, 0.08);
  --error: #fca5a5;

  --radius-lg: 14px;

  font-family: 'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color: var(--text-primary);
  background-color: var(--bg-base);

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(1200px 600px at 15% -10%, rgba(79, 107, 246, 0.16), transparent 60%),
    radial-gradient(900px 500px at 100% 0%, rgba(139, 163, 255, 0.08), transparent 55%),
    var(--bg-base-end);
}

a {
  font-weight: 500;
  color: var(--accent-light);
  text-decoration: inherit;
}
a:hover {
  color: var(--accent);
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
}
```

- [ ] **Step 3: Verify the app still loads with no console errors**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/`
Expected: `200`

Then open `http://localhost:5173` in a browser and confirm: dark gradient background is visible (not flat `#242424`), no layout is broken, no console errors about the font or CSS.

- [ ] **Step 4: Commit and push**

```bash
git add client/index.html client/src/index.css
git commit -m "style: add design tokens, Inter font, dark-only global reset"
git push
```

---

### Task 2: App shell visual redesign (header, panes, textareas, buttons)

**Files:**
- Modify: `client/src/App.css`

**Interfaces:**
- Consumes: CSS custom properties from Task 1 (`--bg-base`, `--surface`, `--surface-border`, `--accent`, `--accent-light`, `--accent-strong`, `--text-secondary`, `--error`, `--radius-lg`).
- Produces: `.swap-icon` and `.spinner` classes/animations that Task 3 (`App.tsx`) will attach to markup.

- [ ] **Step 1: Replace `client/src/App.css` with the full redesigned stylesheet**

```css
#root {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 48px;
}

.header {
  margin-bottom: 28px;
}

.header h1 {
  margin: 0 0 8px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #ffffff 0%, var(--accent-light) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle {
  color: var(--text-secondary);
  letter-spacing: 0.01em;
  margin: 0;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    'left right'
    'bottom bottom';
  gap: 20px;
}

.pane {
  background: var(--surface);
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: 0 8px 24px -12px rgba(0, 0, 0, 0.5);
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

.pane:focus-within {
  border-color: var(--surface-border-hover);
  box-shadow: 0 0 0 3px rgba(79, 107, 246, 0.15), 0 8px 24px -12px rgba(0, 0, 0, 0.5);
}

.pane-left {
  grid-area: left;
}

.pane-right {
  grid-area: right;
}

.pane-bottom {
  grid-area: bottom;
}

.label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--accent-light);
  margin-bottom: 10px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.swap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--surface);
  border: 1px solid var(--surface-border);
  color: var(--text-primary);
  padding: 7px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 200ms ease, border-color 200ms ease;
}

.swap:hover {
  border-color: var(--surface-border-hover);
  background: rgba(79, 107, 246, 0.1);
}

.swap-icon {
  display: inline-block;
  transition: transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.textarea {
  width: 100%;
  min-height: 220px;
  resize: vertical;
  background: var(--bg-base);
  color: var(--text-primary);
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  padding: 14px;
  line-height: 1.6;
  font-family: inherit;
  transition: border-color 200ms ease;
}

.textarea:focus {
  outline: none;
  border-color: var(--surface-border-hover);
}

.textarea::placeholder {
  color: var(--text-secondary);
  font-style: italic;
}

.muted {
  color: var(--text-secondary);
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.btn {
  position: relative;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
  border: none;
  color: white;
  padding: 11px 18px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 16px -6px rgba(79, 107, 246, 0.5);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px -6px rgba(79, 107, 246, 0.6);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-left: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 900ms ease-in-out infinite;
  vertical-align: middle;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

.error {
  color: var(--error);
  animation: shake 380ms ease;
}

@keyframes shake {
  10%,
  90% {
    transform: translateX(-1px);
  }
  20%,
  80% {
    transform: translateX(2px);
  }
  30%,
  50%,
  70% {
    transform: translateX(-4px);
  }
  40%,
  60% {
    transform: translateX(4px);
  }
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
    grid-template-areas: 'left' 'right' 'bottom';
  }
}
```

- [ ] **Step 2: Verify visually**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/`
Expected: `200`

Open `http://localhost:5173` and confirm: gradient header title, rounded surface cards with soft shadow, gradient "Analizar y corregir" button. It's fine if the swap icon doesn't rotate yet and the button has no spinner yet — that lands in Task 3.

- [ ] **Step 3: Commit and push**

```bash
git add client/src/App.css
git commit -m "style: redesign app shell (header, panes, buttons) with minimal elegante theme"
git push
```

---

### Task 3: App.tsx animation hooks (swap rotation, loading spinner, error shake, result reveal trigger)

**Files:**
- Modify: `client/src/App.tsx`

**Interfaces:**
- Consumes: `.swap-icon` and `.spinner` CSS from Task 2; `AnalysisPanel` component (props: `{ data?: Analysis }`) from `client/src/components/AnalysisPanel.tsx` (unchanged signature).
- Produces: passes a `key={resultVersion}` prop to `<AnalysisPanel>` — Task 4 relies on this remount-per-new-result behavior to replay its reveal animation.

- [ ] **Step 1: Add `swapCount` and `resultVersion` state, and wire up the swap icon rotation**

In `client/src/App.tsx`, add two state variables right after the existing `useState` declarations (after the `result` state on line 17):

```tsx
  const [swapCount, setSwapCount] = useState(0)
  const [resultVersion, setResultVersion] = useState(0)
```

- [ ] **Step 2: Increment `resultVersion` on successful analyze**

In `onAnalyze`, right after `setResult(data)`, add:

```tsx
      setResult(data)
      setResultVersion((v) => v + 1)
```

- [ ] **Step 3: Increment `swapCount` in the swap handler**

Change the `swapLanguages` function's first line so it also bumps the rotation counter:

```tsx
  const swapLanguages = () => {
    setSwapCount((c) => c + 1)
    setFromLang((prev) => {
```

(the rest of `swapLanguages` stays exactly as-is)

- [ ] **Step 4: Update the swap button markup to use a rotating icon span**

Replace:

```tsx
            <button className="swap" type="button" onClick={swapLanguages}>
              ↔️ Intercambiar
            </button>
```

with:

```tsx
            <button className="swap" type="button" onClick={swapLanguages}>
              <span className="swap-icon" style={{ transform: `rotate(${swapCount * 180}deg)` }}>↔️</span>
              Intercambiar
            </button>
```

- [ ] **Step 5: Add the loading spinner to the analyze button**

Replace:

```tsx
            <button className="btn" onClick={onAnalyze} disabled={loading || !original.trim()}>
              {loading ? 'Analizando…' : 'Analizar y corregir'}
            </button>
```

with:

```tsx
            <button className="btn" onClick={onAnalyze} disabled={loading || !original.trim()}>
              {loading ? (
                <>
                  Analizando…
                  <span className="spinner" />
                </>
              ) : (
                'Analizar y corregir'
              )}
            </button>
```

- [ ] **Step 6: Make error messages replay the shake animation and pass `resultVersion` as the panel key**

Replace:

```tsx
          {autoError && <div className="error">{autoError}</div>}
```

with:

```tsx
          {autoError && <div key={autoError} className="error">{autoError}</div>}
```

Replace:

```tsx
            {error && <span className="error">{error}</span>}
```

with:

```tsx
            {error && <span key={error} className="error">{error}</span>}
```

Replace:

```tsx
          <AnalysisPanel data={result || undefined} />
```

with:

```tsx
          <AnalysisPanel key={resultVersion} data={result || undefined} />
```

- [ ] **Step 7: Verify the client still compiles**

Run: `pnpm --filter client build`
Expected: build succeeds with no TypeScript errors (exit code 0).

- [ ] **Step 8: Manual verification in the browser**

Open `http://localhost:5173`. Type some text, click "Intercambiar" twice and confirm the icon rotates 180° each time (ending back at 0°/360°, not snapping backwards). Click "Analizar y corregir" and confirm the small pulsing dot appears next to "Analizando…".

- [ ] **Step 9: Commit and push**

```bash
git add client/src/App.tsx
git commit -m "feat: animate swap icon rotation, loading spinner, and error shake"
git push
```

---

### Task 4: Analysis panel reveal + staggered explanation cards

**Files:**
- Modify: `client/src/components/AnalysisPanel.tsx`
- Modify: `client/src/components/analysis-panel.css`

**Interfaces:**
- Consumes: `key={resultVersion}` remount behavior from Task 3 (this is what makes the reveal/stagger animations replay on every new analysis result). CSS custom properties from Task 1 (`--surface`, `--surface-border`, `--bg-base`, `--accent-light`, `--success`, `--success-bg`, `--text-secondary`).
- Produces: none consumed by later tasks (this is the last task).

- [ ] **Step 1: Wrap the result content in a `.reveal` container in `client/src/components/AnalysisPanel.tsx`**

Replace the entire file content with:

```tsx
import type { Analysis } from '../api'
import './analysis-panel.css'

export function AnalysisPanel({ data }: { data?: Analysis }) {
    if (!data) {
        return (
            <div className="panel">
                <p className="muted">Aquí verás las correcciones y explicaciones.</p>
            </div>
        )
    }

    return (
        <div className="panel">
            <div className="reveal">
                <div className="reveal-inner">
                    <div className="block">
                        <h3>Corrección del texto original</h3>
                        <p className="mono">{data.originalCorrection}</p>
                    </div>

                    <div className="block">
                        <h3>Explicaciones</h3>
                        {data.explanations?.length ? (
                            <ul className="explanations">
                                {data.explanations.map((e, i) => (
                                    <li
                                        key={i}
                                        className="explanation"
                                        style={{ animationDelay: `${i * 60}ms` }}
                                    >
                                        {e.type && <span className="tag">{e.type}</span>}
                                        <div className="reason">{e.reason}</div>
                                        {(e.original || e.corrected) && (
                                            <div className="pair">
                                                {e.original && <div><strong>Tu versión:</strong> {e.original}</div>}
                                                {e.corrected && <div><strong>Correcto:</strong> {e.corrected}</div>}
                                            </div>
                                        )}
                                        {e.example && (
                                            <div className="pair">
                                                <div><strong>Ej. mal:</strong> {e.example.wrong}</div>
                                                <div><strong>Ej. bien:</strong> {e.example.right}</div>
                                            </div>
                                        )}
                                        {e.tip && <div className="tip">💡 {e.tip}</div>}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="muted">Sin observaciones adicionales.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
```

- [ ] **Step 2: Replace `client/src/components/analysis-panel.css` with the reveal + stagger styles**

```css
.panel {
    background: var(--surface);
    color: var(--text-primary);
    border-radius: var(--radius-lg);
    padding: 18px;
    border: 1px solid var(--surface-border);
    box-shadow: 0 8px 24px -12px rgba(0, 0, 0, 0.5);
}

.reveal {
    display: grid;
    animation: revealGrow 420ms ease forwards;
}

.reveal-inner {
    overflow: hidden;
    min-height: 0;
}

@keyframes revealGrow {
    from {
        grid-template-rows: 0fr;
        opacity: 0;
    }
    to {
        grid-template-rows: 1fr;
        opacity: 1;
    }
}

.block {
    margin-bottom: 18px;
}

.block:last-child {
    margin-bottom: 0;
}

.block h3 {
    margin: 0 0 10px;
    font-size: 16px;
    font-weight: 600;
    color: var(--accent-light);
}

.mono {
    white-space: pre-wrap;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    background: var(--bg-base);
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid var(--surface-border);
}

.explanations {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 12px;
}

.explanation {
    background: var(--bg-base);
    border: 1px solid var(--surface-border);
    border-radius: 10px;
    padding: 12px;
    opacity: 0;
    animation: fadeSlideUp 420ms ease forwards;
}

@keyframes fadeSlideUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.tag {
    display: inline-block;
    background: rgba(79, 107, 246, 0.18);
    color: var(--accent-light);
    font-size: 12px;
    font-weight: 500;
    padding: 3px 8px;
    border-radius: 999px;
    margin-bottom: 8px;
}

.pair {
    display: grid;
    gap: 4px;
    margin-top: 8px;
}

.reason {
    margin-top: 4px;
}

.tip {
    margin-top: 8px;
    padding: 8px 10px;
    border-radius: 8px;
    background: var(--success-bg);
    color: var(--success);
}

.muted {
    color: var(--text-secondary);
}
```

- [ ] **Step 3: Verify the client still compiles**

Run: `pnpm --filter client build`
Expected: build succeeds with no TypeScript errors (exit code 0).

- [ ] **Step 4: Manual verification in the browser**

Open `http://localhost:5173`, write a sentence in the original textarea, and click "Analizar y corregir". Confirm: the analysis panel grows into view (not a hard pop-in), and each explanation card fades/slides in slightly after the previous one. Click "Analizar y corregir" again with different text and confirm the animation replays.

- [ ] **Step 5: Commit and push**

```bash
git add client/src/components/AnalysisPanel.tsx client/src/components/analysis-panel.css
git commit -m "feat: animate analysis panel reveal and staggered explanation cards"
git push
```
