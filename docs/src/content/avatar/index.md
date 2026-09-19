---
title: Avatar
description: A picture of a person or a thing, with a fallback for when the picture is not there, which never shows a broken image and holds the fallback back while a fast image loads.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Status from './demos/status.svelte';
	import statusSource from './demos/status.svelte?highlight';
	import api from './api.json';
</script>

# Avatar

`Avatar` is a picture of a person or a thing, with a fallback for when the picture is not there. The image loads off the screen first, and it shows once it is there: a broken image icon never shows. The fallback shows in its place, at once or after a delay.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Avatar.Root` holds the status of the image. `Avatar.Image` is the picture, and `Avatar.Fallback` is what shows in its place: initials, an icon, a color.

```svelte
<script>
	import { Avatar } from '@human-kit/ui';
</script>

<Avatar.Root class="size-10 overflow-hidden rounded-full">
	<Avatar.Image src="/ada.jpg" alt="Ada Lovelace" />
	<Avatar.Fallback delay={600}>AL</Avatar.Fallback>
</Avatar.Root>
```

## The image

`Avatar.Image` loads the image off the screen, and it renders the `<img>` once the image is there. Without a `src`, or when the image fails, the `<img>` never renders and the fallback shows. A new `src` starts a new load.

## The fallback

`Avatar.Fallback` shows while the image is not on the screen. Give `delay` in milliseconds to hold it back while the image loads. A fallback that flashes before a fast image is noise, and 600 hides it on a good connection. It shows at once when the image fails, or when there is no image.

## Status

The root has `data-status` for your styles: `loading`, `loaded` or `error`. `onStatusChange` gives the same to your code.

<Demo source={statusSource}><Status /></Demo>

## Usage guidelines

- Give `alt` the name of the person or the thing. Give an empty `alt` when the name is beside the avatar already, thus a screen reader does not read it twice. Hide a fallback of initials with `aria-hidden="true"` in that case.
- Give the root a size and `overflow: hidden`, and the image `object-fit: cover`.
- Give `delay` to the fallback on a list of avatars: a list that flashes initials is noise.

## Accessibility

- The image is an `<img>` with your `alt`. The root has no role of its own.
- The fallback is plain content. A screen reader reads it as text, and initials read as letters. A name in `alt` on the image reads better. So does `aria-hidden` on initials beside a visible name.
- Nothing in the avatar is focusable.

## API reference

<ApiReference api={api} />
