# Rosé Theme Design

## Status

Implemented on `feat/rose-theme`.

## Date

2026-08-11

## Context

`salon-app` already supports `light`, `dark`, and `system` through
`next-themes`. Its semantic CSS tokens currently use an Apple-inspired blue
primary palette. The product needs an additional premium pink visual style for
the salon application without removing the existing modes or changing the
client/admin applications in this task.

The implementation follows the project’s [feature structure](../../architecture/02-frontend/feature.md)
and [architecture handbook](../../architecture/README.md).

## Decision

Add a fourth selectable theme named `rose` internally and displayed as `Rosé`
in the Settings UI.

The existing theme provider remains the source of truth:

```tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
```

When selected, `next-themes` applies the `rose` class to the document root and
persists the selection using its existing storage behavior. The global salon
stylesheet defines a `.rose` token set that replaces the blue semantic values
with a coordinated rose palette.

The Rosé theme is a complete visual palette, not a one-off button color:

- primary and primary foreground;
- background, foreground, card, and popover surfaces;
- secondary and muted surfaces;
- accent and focus ring;
- border and input colors;
- destructive, success, and warning colors;
- glass/material overlay colors and shadows where the existing stylesheet has
  explicit blue/light/dark assumptions.

Existing `light`, `dark`, and `system` behavior remains unchanged. The
`rose` option is intentionally a standalone theme mode for this iteration;
combining Rosé independently with dark/system modes is out of scope.

## User experience

The Appearance section presents four choices:

```text
Claro | Oscuro | Sistema | Rosé
```

The Rosé card uses the same keyboard-accessible `<button>` interaction and
selected-state treatment as the existing options. The visual selection is not
communicated by color alone: the selected border, check icon, and accessible
button label remain available.

## Proposed changes

### Runtime composition

No new provider or state store is required. `AppProviders.tsx` already exposes
the `next-themes` context to the entire salon application.

### Settings

Update the appearance option list in
`apps/salon-app/src/features/settings/components/Settings.tsx`:

```ts
{ id: 'rose', name: 'Rosé', icon: Sparkles }
```

The implementation must keep the `theme` value typed as the values accepted by
the existing provider and preserve `setTheme` behavior.

### Global tokens

Update `apps/salon-app/src/theme/globals.css` with a `.rose` block using
semantic custom properties. The palette should use a restrained rose primary
with warm blush surfaces and sufficient contrast for normal text and controls.

Raw color values should remain centralized in the theme stylesheet; feature
components should continue using semantic Tailwind classes such as
`bg-primary`, `text-foreground`, and `border-border`.

### Translations

The theme name is user-visible. Add typed translation keys for the Rosé label
and description to `@emme/i18n` rather than embedding new user-facing strings
inside the Settings component. Preserve English and Spanish key parity.

## Scope boundaries

In scope:

- salon-app theme selection and persistence;
- Rosé semantic tokens and related overlay styles;
- Settings labels and descriptions in English and Spanish;
- focused tests for theme option exposure and token/boundary invariants.

Out of scope:

- changing the existing Light, Dark, or System palettes;
- adding a theme selector to client-app or admin-app;
- backend/API/database changes;
- user-configurable color pickers;
- independent accent selection combined with every light/dark mode.

## Accessibility and visual constraints

- Preserve visible keyboard focus for every theme option.
- Preserve the selected-state check icon and text label.
- Verify normal text contrast against Rosé background and surface tokens.
- Keep destructive/error colors distinguishable from the primary rose color.
- Avoid gradients or additional decorative effects not already used by the
  salon visual language.
- Verify at mobile and desktop widths because the four-option grid changes from
  three to four cards at larger breakpoints.

## Testing strategy

Follow Red → Green → Refactor:

1. Add a failing Settings test that expects the `Rosé` option and verifies its
   selection calls the theme boundary with `rose`.
2. Add a failing stylesheet/boundary assertion that requires the `.rose`
   semantic tokens and key overlay states.
3. Implement the minimum Settings, translation, and CSS changes.
4. Refactor duplicated theme option metadata only if it improves clarity without
   broadening scope.
5. Run focused tests, the salon test suite, typecheck, architecture validation,
   documentation validation, and the salon build.

Required evidence:

| Boundary | Evidence |
| --- | --- |
| Theme selection | Settings component test with a fake theme context or provider |
| Persisted theme contract | Existing `next-themes` integration behavior remains intact |
| CSS token coverage | Theme stylesheet boundary test checks `.rose` and required variables |
| Translation parity | `@emme/i18n` validation |
| App integration | Salon typecheck, tests, and build |

## Alternatives considered

### Replace blue globally

Rejected because it removes the user’s current visual choice and changes the
existing Light/Dark/System experience.

### Add an independent accent selector

Deferred because it requires a second persisted preference and a matrix of
Rose + Light/Dark/System combinations. That is a larger design-system change
than the requested standalone theme.

### Add `pink` as the identifier

Rejected in favor of `rose`, which is more premium, brand-appropriate, and less
generic while remaining understandable in code.

## Definition of done

- [x] Appearance settings show Light, Dark, System, and Rosé.
- [x] Selecting Rosé applies the `rose` root class and persists through the
      existing theme provider.
- [x] Rosé semantic tokens replace the blue visual language throughout the
      salon shell and existing components.
- [x] English and Spanish translations remain key-parity valid.
- [x] Focused tests cover selection and stylesheet boundary requirements.
- [x] `bun run docs:check` passes.
- [x] `bun run architecture:check` passes.
- [x] Salon typecheck, tests, and build pass.
