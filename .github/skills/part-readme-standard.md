# Skill: Composable Part README Standard

## Intent

Guarantee that every public composable part has a README with consistent structure and useful API information.

## Applies to

Public composable parts under `packages/svelte/src/lib/**` that are exported through `index.parts.ts` (or equivalent part export surface).

Examples:

- `root`, `trigger`, `content`, `input`, `segment`, `popover`, `clock`, `calendar`, `wheel-column`, `wheel-item`, `axis`

## Required rule

Every exported public part folder **must** contain a `README.md`.
Every exported public part folder **must** include at least one colocated `*.test.ts` file for that part (with `*-test.svelte` harness when required by interaction setup).
Part `README.md` structure/style should mirror the canonical examples in `packages/svelte/src/lib/combobox/*/README.md`.

## README structure (required)

Use this structure in order:

1. `# <Component.Part>`
2. `## API reference`
3. `### <Component.Part>`
4. `Name:` line
5. `Description:` line
6. Props table with columns:
   - `Prop`
   - `Type`
   - `Default`
   - `Description`
7. Optional `### Context utilities` section when the part exposes or consumes typed context helpers.
8. Minimal usage snippet (optional but recommended).

## Content quality rules

- Keep names and prop types aligned with actual source code.
- Do not invent props not present in the component.
- Keep defaults accurate to implementation.
- Prefer concise, factual descriptions.
- If behavior is root-controlled (forbidden/ignored props), document it explicitly.
- If part is headless/styling-agnostic, call that out.

## Delivery checklist

- [ ] README exists for each touched public part.
- [ ] At least one colocated `*.test.ts` exists for each touched public part.
- [ ] README follows the required structure.
- [ ] Props table matches current implementation.
- [ ] Parent component README anatomy includes the part.
- [ ] Examples compile conceptually with current API.
