---
title: About
description: What @human-kit/ui is, the principles behind it, and how it's built.
---

# About

`@human-kit/ui` is an open-source library of typed, accessible UI components for Svelte 5. It gives you the difficult parts — the semantics, the keyboard operation, the focus control, and the state — as parts that have no styles. You assemble these parts into your own design system.

## Principles

- **Headless.** Each component controls its behavior and its accessibility, but never its appearance. You write the styles that you want, and no component changes them.
- **Accessible from the start.** Each component obeys a known interaction pattern. Read [Accessibility](/docs/accessibility).
- **Typed.** Each prop, part, and event has full TypeScript types. Thus your editor helps you, and a refactor stays safe.
- **Composable.** Each component gives you small parts (`Root`, `Trigger`, `Content`, `Item`) that you assemble. No component is one large element with many props.
- **Small.** The package is native ESM, and each component has a subpath export. Thus your bundler includes only the components that you import.

## The tools in this library

- **Svelte 5** and its runes.
- **TypeScript**, in the full library.
- Floating UI, for the position of the overlays. The library adds its own presence, focus, and layer-stack code above it.

The API and the interaction contracts come from [Base UI](https://base-ui.com) and [React Aria](https://react-spectrum.adobe.com/react-aria/). These two projects set the standard for accessible, composable, headless components. `@human-kit/ui` adapts their patterns to Svelte, and this library is possible because of their work.

## Status

The library is in **public beta** (`1.0.0-beta`). The API is almost stable, but small changes can occur before version `1.0.0`. The [Releases](/docs/releases) page shows each change.

## License and source

The license of `@human-kit/ui` is MIT. The source, the issues, and the contribution guide are on [GitHub](https://github.com/human-kit/ui).
