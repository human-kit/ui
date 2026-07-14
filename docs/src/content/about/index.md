---
title: About
description: What @human-kit/ui is, the principles behind it, and how it's built.
---

# About

**`@human-kit/ui`** is an open-source library of accessible, typed UI primitives for Svelte 5. It gives you the hard parts — semantics, keyboard interaction, focus management, and state — as unstyled building blocks you can shape into your own design system.

## Principles

- **Headless.** Components own behavior and accessibility, never appearance. You style them however you like; nothing fights your design.
- **Accessible by default.** Each primitive implements a proven interaction pattern out of the box. See [Accessibility](/docs/accessibility).
- **Typed.** Full TypeScript types for every prop, part, and event, so the editor guides you and refactors stay safe.
- **Composable.** Primitives are exposed as small parts (`Root`, `Trigger`, `Content`, `Item`, …) that you assemble, rather than monolithic components with dozens of props.
- **Lean.** Published as native ESM with per-component subpath exports, so bundlers only pull in what you actually import.

## Built with

- **Svelte 5** and its runes reactivity model.
- **TypeScript** end to end.
- Floating UI for overlay positioning, with the library's own presence, focus, and layer-stack primitives on top.

The API and interaction contracts are aligned with the patterns established by React Aria Components, adapted to feel native in Svelte.

## Status

The library is in **public beta** (`1.0.0-beta`). The API is close to stable, but small changes may still land before `1.0.0` — the [Releases](/docs/releases) timeline tracks everything.

## License & source

`@human-kit/ui` is MIT licensed. The source, issues, and contribution guide live on [GitHub](https://github.com/human-kit/ui).
