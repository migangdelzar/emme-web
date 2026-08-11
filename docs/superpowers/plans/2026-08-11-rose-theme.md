# Rosé Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persisted `rose` theme option to the current `salon-app` while preserving Light, Dark, and System behavior.

**Architecture:** Reuse the existing `next-themes` provider as the runtime theme boundary. Keep theme metadata in the Settings feature, keep translations in `@emme/i18n`, and keep all visual token changes centralized in `apps/salon-app/src/theme/globals.css`. The theme is a standalone fourth mode, not an independently combinable accent preference.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, `next-themes`, `@emme/i18n`, Vitest, Testing Library, Bun.

## Global Constraints

- Internal theme identifier is exactly `rose`.
- User-facing theme name is `Rosé` in English and `Rosé` in Spanish.
- Existing `light`, `dark`, and `system` behavior must remain unchanged.
- Theme state must continue to be provided by `next-themes`; do not add a second theme store.
- Raw theme colors belong in `apps/salon-app/src/theme/globals.css`; components use semantic classes.
- User-visible labels and descriptions must use typed `@emme/i18n` translation keys.
- Every behavior change follows Red → Green → Refactor.
- Do not modify `client-app`, `admin-app`, backend packages, or the existing untracked `e2e/src/.auth/` directory.

---

## File Map

| File | Responsibility |
| --- | --- |
| `apps/salon-app/src/features/settings/theme-options.ts` | Typed theme option metadata and supported theme IDs. |
| `apps/salon-app/src/features/settings/theme-options.test.ts` | Pure contract tests for option IDs, labels, and descriptions. |
| `apps/salon-app/src/features/settings/components/Settings.tsx` | Render translated theme cards and call the existing `setTheme` boundary. |
| `apps/salon-app/src/theme/globals.css` | Rosé semantic tokens and overlay/surface styles. |
| `apps/salon-app/src/app/style-source-boundary.test.ts` | CSS source and Rosé token boundary assertions. |
| `packages/i18n/src/data/translations/en-US.json` | English Rosé theme labels and descriptions. |
| `packages/i18n/src/data/translations/es-MX.json` | Spanish Rosé theme labels and descriptions. |
| `docs/superpowers/specs/2026-08-11-rose-theme-design.md` | Approved feature design and scope. |

## Task 1: Add the typed theme option contract

**Files:**

- Create: `apps/salon-app/src/features/settings/theme-options.ts`
- Test: `apps/salon-app/src/features/settings/theme-options.test.ts`

**Interfaces:**

- Produces `themeOptions` and `SalonTheme` for the Settings feature.
- Each option exposes `id`, `labelKey`, `descriptionKey`, and a Lucide icon component.

- [ ] **Step 1: Write the failing test**

Create `theme-options.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { themeOptions } from './theme-options';

describe('salon theme options', () => {
  it('exposes the existing modes plus the Rosé mode in stable order', () => {
    expect(themeOptions.map((option) => option.id)).toEqual([
      'light',
      'dark',
      'system',
      'rose',
    ]);
  });

  it('uses translated labels and descriptions for every option', () => {
    expect(themeOptions.every((option) => option.labelKey.startsWith('settings.'))).toBe(true);
    expect(themeOptions.every((option) => option.descriptionKey.startsWith('settings.'))).toBe(
      true,
    );
  });
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
bun run --filter salon-app test -- src/features/settings/theme-options.test.ts
```

Expected: FAIL because `./theme-options` does not exist.

- [ ] **Step 3: Write the minimal implementation**

Create `theme-options.ts`:

```ts
import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sparkles, Sun } from 'lucide-react';

export const themeOptions = [
  {
    id: 'light',
    labelKey: 'settings.themeLight',
    descriptionKey: 'settings.themeLightDescription',
    icon: Sun,
  },
  {
    id: 'dark',
    labelKey: 'settings.themeDark',
    descriptionKey: 'settings.themeDarkDescription',
    icon: Moon,
  },
  {
    id: 'system',
    labelKey: 'settings.themeSystem',
    descriptionKey: 'settings.themeSystemDescription',
    icon: Monitor,
  },
  {
    id: 'rose',
    labelKey: 'settings.themeRose',
    descriptionKey: 'settings.themeRoseDescription',
    icon: Sparkles,
  },
] as const satisfies readonly {
  id: string;
  labelKey: `settings.${string}`;
  descriptionKey: `settings.${string}`;
  icon: LucideIcon;
}[];

export type SalonTheme = (typeof themeOptions)[number]['id'];
```

- [ ] **Step 4: Run the focused test to verify it passes**

Run:

```bash
bun run --filter salon-app test -- src/features/settings/theme-options.test.ts
```

Expected: PASS with 2 tests.

- [ ] **Step 5: Commit**

```bash
git add apps/salon-app/src/features/settings/theme-options.ts apps/salon-app/src/features/settings/theme-options.test.ts
git commit -m "test(settings): define salon theme option contract"
```

## Task 2: Add translations and connect Settings to the contract

**Files:**

- Modify: `packages/i18n/src/data/translations/en-US.json` under `settings`
- Modify: `packages/i18n/src/data/translations/es-MX.json` under `settings`
- Modify: `apps/salon-app/src/features/settings/components/Settings.tsx` imports and Appearance section

**Interfaces:**

- Consumes `themeOptions` and `SalonTheme` from Task 1.
- Consumes typed `settings.theme*` translation keys through `useAppTranslation`.
- Produces the same four clickable theme cards and invokes `setTheme(option.id)`.

- [ ] **Step 1: Write the failing test**

Extend `theme-options.test.ts` with a translation-key contract:

```ts
it('defines the Rosé option with the rose identifier and translated copy keys', () => {
  expect(themeOptions[3]).toMatchObject({
    id: 'rose',
    labelKey: 'settings.themeRose',
    descriptionKey: 'settings.themeRoseDescription',
  });
});
```

The test fails until the option contract contains the exact `rose` metadata.

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
bun run --filter salon-app test -- src/features/settings/theme-options.test.ts
```

Expected: FAIL if the `rose` metadata is absent or has a different identifier/key.

- [ ] **Step 3: Write the minimum implementation**

Add these keys to both locale catalogs:

```json
{
  "themeLight": "Light",
  "themeLightDescription": "Use the light appearance",
  "themeDark": "Dark",
  "themeDarkDescription": "Use the dark appearance",
  "themeSystem": "System",
  "themeSystemDescription": "Follow your device preference",
  "themeRose": "Rosé",
  "themeRoseDescription": "Use the warm Rosé appearance"
}
```

Use the equivalent Spanish values:

```json
{
  "themeLight": "Claro",
  "themeLightDescription": "Usar la apariencia clara",
  "themeDark": "Oscuro",
  "themeDarkDescription": "Usar la apariencia oscura",
  "themeSystem": "Sistema",
  "themeSystemDescription": "Seguir la preferencia de tu dispositivo",
  "themeRose": "Rosé",
  "themeRoseDescription": "Usar la cálida apariencia Rosé"
}
```

In `Settings.tsx`, import `themeOptions` and replace the inline three-item array and dynamic hardcoded copy with:

```tsx
{themeOptions.map((option) => (
  <button
    type="button"
    key={option.id}
    aria-pressed={theme === option.id}
    className={cn(/* preserve the existing card classes */)}
    onClick={() => setTheme(option.id)}
  >
    {/* preserve the existing selected-state, icon, and layout markup */}
    <option.icon className="size-8 stroke-[1.5]" />
    <h3>{t(option.labelKey)}</h3>
    <p>{t(option.descriptionKey)}</p>
  </button>
))}
```

Keep the existing responsive grid classes, selected border/check icon, and
keyboard-native `<button>` interaction. Change `md:grid-cols-3` to
`md:grid-cols-4` so four options remain balanced on larger screens.

- [ ] **Step 4: Run translation and focused tests**

Run:

```bash
bun run --filter salon-app test -- src/features/settings/theme-options.test.ts
bun run --filter @emme/i18n test
bun run --filter @emme/i18n validate
```

Expected: all commands pass and the locale catalog reports matching key parity.

- [ ] **Step 5: Commit**

```bash
git add packages/i18n/src/data/translations/en-US.json packages/i18n/src/data/translations/es-MX.json apps/salon-app/src/features/settings/components/Settings.tsx
git commit -m "feat(settings): add rose theme option"
```

## Task 3: Add the Rosé semantic palette and CSS boundary coverage

**Files:**

- Modify: `apps/salon-app/src/theme/globals.css`
- Modify: `apps/salon-app/src/app/style-source-boundary.test.ts`

**Interfaces:**

- Consumes the `rose` class emitted by `next-themes`.
- Produces semantic CSS variables consumed by existing Tailwind classes and salon visual effects.

- [ ] **Step 1: Write the failing test**

Extend `style-source-boundary.test.ts`:

```ts
it('defines the complete Rosé semantic token set', () => {
  expect(globalStyles).toContain('.rose {');
  for (const token of [
    '--background:',
    '--foreground:',
    '--card:',
    '--primary:',
    '--primary-foreground:',
    '--secondary:',
    '--muted:',
    '--accent:',
    '--border:',
    '--input:',
    '--ring:',
    '--color-bg:',
    '--color-surface:',
    '--color-text:',
    '--color-primary:',
    '--color-border:',
  ]) {
    expect(globalStyles).toContain(token);
  }
  expect(globalStyles).toContain('.rose .material-thick');
  expect(globalStyles).toContain('.rose .material-regular');
  expect(globalStyles).toContain('.rose .material-thin');
});
```

- [ ] **Step 2: Run the boundary test to verify it fails**

Run:

```bash
bun run --filter salon-app test -- src/app/style-source-boundary.test.ts
```

Expected: FAIL because `globals.css` does not contain `.rose` or Rosé overlay rules.

- [ ] **Step 3: Write the minimum implementation**

Add a `.rose` block after the existing light/dark token blocks. Use a restrained rose palette such as:

```css
.rose {
  --background: #fff8fb;
  --foreground: #3b1828;
  --card: #ffffff;
  --card-foreground: #3b1828;
  --popover: #ffffff;
  --popover-foreground: #3b1828;
  --primary: #c84f7d;
  --primary-foreground: #ffffff;
  --secondary: #fce8f0;
  --secondary-foreground: #6f2947;
  --muted: #fdf0f5;
  --muted-foreground: #8b6172;
  --accent: #f8d7e4;
  --accent-foreground: #6f2947;
  --destructive: #c23b4a;
  --destructive-foreground: #ffffff;
  --border: #edc4d3;
  --input: #dfadbf;
  --ring: #c84f7d;
  --color-bg: #fff8fb;
  --color-surface: #ffffff;
  --color-text: #3b1828;
  --color-text-muted: #8b6172;
  --color-primary: #c84f7d;
  --color-primary-hover: #b9416d;
  --color-border: #edc4d3;
  --color-danger: #c23b4a;
  --color-success: #2f8f68;
  --color-warning: #a86d2f;
}
```

Add Rosé-specific material/glass and focus overrides using the existing style vocabulary:

```css
.rose .material-thick { background: rgba(255, 255, 255, 0.92); border-color: rgba(237, 196, 211, 0.45); }
.rose .material-regular { background: rgba(255, 248, 251, 0.84); border-color: rgba(237, 196, 211, 0.38); }
.rose .material-thin { background: rgba(255, 248, 251, 0.70); border-color: rgba(237, 196, 211, 0.34); }
.rose .premium-input:focus { box-shadow: 0 0 0 4px rgba(200, 79, 125, 0.14); }
```

Keep existing `.dark` rules unchanged. Do not replace raw colors throughout feature components; their semantic classes should resolve through the new token set.

- [ ] **Step 4: Run the boundary test to verify it passes**

Run:

```bash
bun run --filter salon-app test -- src/app/style-source-boundary.test.ts
```

Expected: PASS with the existing source-boundary test and the new Rosé token test.

- [ ] **Step 5: Commit**

```bash
git add apps/salon-app/src/theme/globals.css apps/salon-app/src/app/style-source-boundary.test.ts
git commit -m "feat(theme): add rose semantic palette"
```

## Task 4: Verify the complete feature

**Files:**

- Modify: `docs/superpowers/specs/2026-08-11-rose-theme-design.md` only if implementation evidence changes the status or acceptance checklist.

- [ ] **Step 1: Run focused salon tests**

```bash
bun run --filter salon-app test -- src/features/settings/theme-options.test.ts src/app/style-source-boundary.test.ts
```

Expected: all focused tests pass with zero skipped tests.

- [ ] **Step 2: Run repository checks**

```bash
bun run docs:check
bun run architecture:check
bun run typecheck
bun run --filter salon-app lint
bun run --filter salon-app test
bun run --filter salon-app build
```

Expected: every command exits with code 0. Existing lint warnings are acceptable only if there are zero new errors.

- [ ] **Step 3: Inspect the rendered theme manually**

Run:

```bash
bun run --filter salon-app dev
```

Open Settings → Appearance and verify at desktop and mobile widths:

1. Four cards render without overflow.
2. Selecting Rosé changes primary actions, borders, focus rings, cards, and glass surfaces to the rose palette.
3. Reloading preserves Rosé.
4. Switching to Light, Dark, and System still behaves as before.
5. Keyboard focus and selected check state remain visible.

- [ ] **Step 4: Update the design status and commit verification evidence**

Change the spec status to `Implemented` and check the completed Definition of Done items after all commands pass.

```bash
git add docs/superpowers/specs/2026-08-11-rose-theme-design.md
git commit -m "docs(theme): mark rose theme implemented"
```

- [ ] **Step 5: Push and verify the remote branch**

```bash
git push origin feat/rose-theme
git log --oneline origin/feat/rose-theme -1
git status --short
```

Expected: the remote contains the final commit and only the pre-existing untracked `e2e/src/.auth/` directory remains outside the feature changes.
