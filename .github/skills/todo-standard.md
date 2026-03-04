# Skill: Component TODO Standard

## Intent

Keep roadmap/backlog files consistent and CI-safe across components.

## Applies to

Component-level TODO files under `packages/svelte/src/lib/**/TODO.md`.

> Canonical filename: `TODO.md` (not `TODOS.md`).

## Required rule

Every checkbox item in `TODO.md` must follow the repository format enforced by `scripts/check-todo-format.mjs`.

Required item shape:

- `[ ] [M|S|C|W][P0|P1|P2|P3][Area: ...][Owner: ...][Target: ...] Description`

Examples:

- `- [ ] [M][P0][Area: Accessibility][Owner: Unassigned][Target: TBD] Improve screen reader announcements.`
- `- [x] [S][P2][Area: Docs][Owner: Team][Target: Done] Add migration note.`

## Recommended TODO structure

1. `# <Component> TODO`
2. `## Goal`
3. `## Backlog`
4. Optional sections such as `## Active`, `### Bugs`, `### Accessibility`, `### Performance`, `## Notes`

## Content quality rules

- Use one concern per TODO item.
- Keep descriptions actionable and testable.
- Keep status truthful (`[ ]` pending, `[x]` done).
- Keep `Area`, `Owner`, and `Target` populated.
- Prefer `Target: TBD` / `Target: Done` when no date is defined.

## Delivery checklist

- [ ] File is named `TODO.md`.
- [ ] Every checkbox line matches required format.
- [ ] New items are categorized by severity and priority.
- [ ] Completed work is marked with `[x]`.
- [ ] `bun run` workflow with `scripts/check-todo-format.mjs` would pass.
