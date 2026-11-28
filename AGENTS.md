# Instructions for coding agents

This file is for an agent that changes this repository. To use the library in a different project, read `skills/human-kit-ui/SKILL.md`.

`CONTRIBUTING.md` has the full workflow. This file gives the rules that agents break most frequently.

## Layout

- `packages/ui` is the library, `@human-kit/ui`. The public entry point is `packages/ui/src/lib/index.ts`, and each component also has a subpath export in `packages/ui/package.json`.
- `docs` is the documentation site. It imports the source of the library, not the build output.
- `docs/src/content/<page>/index.md` is one page of the site. Its demos are in `demos/`, and `api.json` is its API table.
- `rfcs` holds the design documents.

## Commands

```bash
pnpm install
pnpm run dev         # the docs site
pnpm run lint        # prettier, eslint, the TODO format, the prose check, the imports
pnpm run typecheck   # svelte-check for the library and the docs
pnpm run test        # the tests of the library, in a real browser
pnpm run build       # the package, its docs folder and publint
pnpm run docs:api    # make api.json again after a change to a prop or its JSDoc
```

Before a pull request with new demos, also run `pnpm --filter docs build`. The build crawls each link of each demo. A link to a page that does not exist fails only the deploy of the site, and CI stays green.

## Components

- Use Svelte 5 runes (`$props`, `$state`, `$derived`, `$effect`, `$bindable`) in all new code.
- A component is a namespace of parts (`index.parts.ts` and `index.ts`). The root holds the state in a typed context (`root/context.ts`), and the other parts read it.
- Follow the patterns of the existing components: the props, the names, the controlled state (`bind:value`, `defaultValue`, `controlledValue`), the data attributes and the keyboard. A new component must look like a sibling of the others.
- Use the shared code in `packages/ui/src/lib/primitives` for floating elements, the focus trap, an outside click, the scroll lock and the hidden content outside a modal.
- Each public part folder has a `README.md` (`.github/skills/part-readme-standard.md`) and at least one colocated `*.test.ts`.

## Tests

- The tests run in a real browser. Drive real events with `userEvent`, and assert what the user can see or hear: the focus, the ARIA attributes, the text. An assert on an internal value only is not a test of the behavior.
- Use `expect.poll` for content in a portal or content that changes after an animation frame.
- A test that passes alone and fails in CI after a different file can be the mouse. The real cursor stays where an earlier file left it, over your component. Move it away with `userEvent.hover` in the setup.

## Prose

- All of the text that a person reads is in ASD-STE100 (Simplified Technical English). This includes the docs pages, the READMEs, the JSDoc of the props and this file. It also includes the pull request titles and bodies, and the comments on GitHub. `pnpm run lint` checks the mechanical rules. Read the "Documentation style" section of `CONTRIBUTING.md`.
- Write all of the text in English: the code, the comments, the commits and the pull requests.
- Do not name other component libraries in the code, the docs, the commits or the pull requests. Describe the behavior with its own words.

## Changesets and releases

- A change to `packages/ui/src/**` needs a changeset (`pnpm exec changeset`). CI checks it.
- The description of a prop comes from its JSDoc, so a JSDoc change also needs a changeset. The text of the parts and of the data attributes is only in `api.json`.
- A merge to `main` starts `.github/workflows/release.yml`. Do not publish to npm by hand.
- Give a branch a prefix and a slug, for example `fix/menu-focus` or `docs/dialog-forms`. Use `release/<version>` only for a version change.
