# GitHub Copilot Instructions

## Project Map

- This is a pnpm monorepo: publishable library in `packages/ui`, docs/playground app in `docs`.
- Main public entrypoint is `packages/ui/src/lib/index.ts`; each component also has subpath exports (see `packages/ui/package.json` `exports`).
- Docs intentionally import source, not built dist: `docs/vite.config.ts` aliases `@human-kit/ui` to `../packages/ui/src/lib`.

## Core Dev Workflows

- Install dependencies: `pnpm install`.
- Run docs playground: `pnpm run dev` (root script filters to `docs`).
- Package library (sync + package + publint): `pnpm run build`.
- Run library tests: `pnpm run test -- --run`.
- Run type checks: `pnpm run typecheck`.
- Run formatting/lint checks: `pnpm run format`, `pnpm run lint`.
- Browser tests use Playwright Chromium (`packages/ui/vitest.config.ts`); if missing locally run `cd packages/ui && pnpm exec playwright install chromium`.

## Component Architecture Patterns

- Components are part-based and namespaced: `index.parts.ts` + `index.ts` pattern (example: `packages/ui/src/lib/popover/index.ts`).
- Typical structure: `root` owns state/context, child parts consume it (`trigger`, `content`, etc.).
- Use Svelte 5 runes everywhere (`$props`, `$state`, `$derived`, `$effect`, `$bindable`); keep new code in this style.
- Controlled/uncontrolled pattern is standard: bindable prop + internal state + callback sync (example: `packages/ui/src/lib/popover/root/popover-root.svelte`).
- Context contracts are explicit and typed in `root/context.ts`; child parts throw when used outside root where required (example: `packages/ui/src/lib/dialog/content/dialog-content.svelte`).

## Cross-Component Integrations

- Dialog/Popover behavior is built from shared primitives in `packages/ui/src/lib/primitives` (`floating`, `focus-trap`, `click-outside`, `scroll-lock`, `aria-hide-outside`).
- `DatePicker` composes existing parts instead of duplicating behavior: it wraps `Popover` and `Calendar` (`packages/ui/src/lib/datepicker/popover/date-picker-popover.svelte`, `packages/ui/src/lib/datepicker/calendar/date-picker-calendar.svelte`).
- `ComboBox` delegates option selection to `ListBox` and virtual focus hook (`packages/ui/src/lib/combobox/list/combobox-listbox.svelte`, `packages/ui/src/lib/hooks/use-virtual-focus.svelte.ts`).
- `Dialog` supports nested stacks via global stack helpers; only topmost handles escape/outside close (`packages/ui/src/lib/dialog/root/dialog-stack.ts`).

## Testing Conventions

- Tests live next to components as `*.test.ts`, with local Svelte harness files `*-test.svelte` (example: `packages/ui/src/lib/popover/root/popover.test.ts` + `popover-test.svelte`).
- Use `render` from `vitest-browser-svelte` and `expect.poll(...)` for portal/RAF-driven async UI updates.
- Portaled elements are commonly cleaned up in `afterEach` by removing `[role="dialog"]`.
- Vitest aliases `$app/*` to mocks in `packages/ui/src/lib/test-mocks`; preserve these imports in component code.
- Requirement: every exported public part folder must include at least one colocated `*.test.ts` file validating part behavior (and a `*-test.svelte` harness where needed).

## Contribution/CI Expectations

- CI runs lint, typecheck, tests, build (`.github/workflows/ci.yml`).
- If `packages/ui/src/**` changes, CI expects a changeset markdown file in `.changeset` (non-README).

## Skills

- Reusable skills live in `.github/skills`.
- Apply `.github/skills/part-readme-standard.md` whenever adding or updating public composable parts.
- Apply `.github/skills/component-readme-base-standard.md` whenever adding or updating `packages/ui/src/lib/<component>/README.md`.
- Apply `.github/skills/todo-standard.md` whenever adding or updating component `TODO.md` files.
- Requirement: every exported public part folder must include a `README.md` that follows the skill template (`API reference` section, part subsection, Name/Description, props table, and optional context utilities).
- Requirement: every exported public part folder must include colocated tests (`*.test.ts`, plus `*-test.svelte` harness if interaction setup is required).
- Requirement: part `README.md` files must follow the same structure and style used in `packages/ui/src/lib/combobox/*/README.md` (canonical reference format).
- Requirement: component-level TODO checkboxes must follow the repository format enforced by `scripts/check-todo-format.mjs`.
