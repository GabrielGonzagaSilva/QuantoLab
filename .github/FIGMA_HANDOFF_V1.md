# QuantoLab · Figma V1 → Runtime handoff

Source of truth for this handoff:

1. production behavior and validated product decisions;
2. `main` calculation/data logic;
3. Figma V1 system and responsive contract;
4. this mapping for implementation details.

Figma: `https://www.figma.com/design/z70NM1LpAOAafs4cMZLJ17`

## Layout contract

| Context | Width | Grid | Margin | Gutter | Runtime behavior |
| --- | --- | --- | --- | --- | --- |
| Desktop | `>=1200` | 12 columns | centered, max container 1160 | 24 | calculator form/result may remain parallel; result can be sticky |
| Tablet | `768–1199` | 8 columns | 32–40 | 20–24 | fluid container; calculator becomes vertical |
| Mobile | `320–767` | 4 columns | 20 | 16 | vertical progression; no lateral result; 44px minimum interactive targets |

Mandatory QA widths: `1440`, `1024`, `834`, `768`, `480`, `390`, `320`.

Runtime tokens are exposed in `sprint5.css` using `--ql-*` custom properties. They correspond to the Layout variables in Figma.

## Component mapping

| Figma | Runtime selector / implementation |
| --- | --- |
| `Button / V1` | `.btn`, `.btn-secondary`; shared styles in `theme.css`, `style.css`, `sprint5.css` |
| `Field / V1` | `.field`, `.input-wrap`, `.field-help`; generated calculator fields in `tools-core.js` |
| `Result Panel / V1` | `.panel.result`, `[data-tool-result]`, `[data-result-state]` |
| `Header / V1` | `.header`, `.nav`, `.navlinks`, `.mobile-menu-toggle`, `.mobile-nav-panel` |
| `Footer / V1` | `.footer`, `.footer-grid`, `.footer-meta` |
| `Search Field / V1` | `.catalog-search` |
| `Filter Chip / V1` | `.filter-chip[aria-pressed]` |
| `Related Tool / V1` | `.decision-card` |
| `Source Note / V1` | `.source-note` |
| `Saved Reference Note / V1` | `.saved-reference-note` |
| `View Tabs / V1` | `.calculator-tabs` |

This repository is static HTML/CSS/JavaScript, so Code Connect is not forced onto non-component source. Selector mapping is the canonical bridge until runtime components are migrated into a component framework.

## State contract

### Buttons

`Default → Hover → Focus → Pressed → Disabled → Loading`.

The runtime must preserve visible focus and a minimum interactive target of 44px. Disabled/busy actions must not look active.

### Fields

`Default → Focus → Error → Disabled`.

- visible `label` remains associated with the control;
- helper text is connected with `aria-describedby`;
- invalid controls use `aria-invalid=true`;
- mobile input text is at least 16px.

### Results

`Waiting → Calculated | Error`, with compact waiting behavior allowed on narrow screens.

- result region uses `role=status` and `aria-live=polite`;
- waiting state remains visible before calculation;
- calculated state prioritizes the answer, then breakdown and methodology;
- mobile never depends on a lateral/sticky result.

## Catalog discovery

The Figma `Catalog Discovery` pattern is implemented by `sprint5.js`:

- natural-language/name search;
- context chips (`Todos`, `CLT`, `PJ`, `Freelancer`, `Financeiro`);
- four decision shortcuts;
- query/filter state reflected in the URL;
- result count announced through a polite live region;
- whole tool cards remain navigable links.

## Local continuity

`Meus números` remains optional and local-only. Compatible fields may be prefilled by `QuantoLabProfile`, but the origin may not be invisible: calculators show `.saved-reference-note` whenever saved references are present. The user can always edit a prefilled value or manage the stored references.

## Accessibility contract

- minimum touch target: 44px;
- visible keyboard focus;
- mobile menu supports keyboard Escape and returns focus to its trigger;
- search/filter controls expose state programmatically;
- fields keep label/helper relationships;
- calculated results are announced without aggressive focus movement;
- `prefers-reduced-motion` is respected;
- no functional horizontal scrolling at supported QA widths.

## QA automation

`.github/workflows/responsive-qa.yml` runs:

- `tests/responsive.spec.cjs`
- `tests/no-dashes.spec.cjs`
- `tests/calculator-model.spec.cjs`
- `tests/editorial.spec.cjs`
- `tests/sprint5-handoff.spec.cjs`

Sprint 5 cannot be marked PASS from visual inspection alone. The branch must pass the automated browser suite and a Vercel preview smoke test before the Figma Sprint Status is closed.
