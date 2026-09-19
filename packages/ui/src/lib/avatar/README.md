# Avatar

## Description

`Avatar` is a picture of a person or a thing, with a fallback for when the picture is not there. The image loads off the screen first, and it shows once it is there: a broken image icon never shows. The fallback shows in its place, at once or after a delay.

## Anatomy

- `Avatar.Root`
- `Avatar.Image`
- `Avatar.Fallback`

```svelte
<Avatar.Root class="size-10 rounded-full">
	<Avatar.Image src="/ada.jpg" alt="Ada Lovelace" />
	<Avatar.Fallback delay={600}>AL</Avatar.Fallback>
</Avatar.Root>
```

## Usage guidelines

- Give `alt` the name of the person or the thing. Give an empty `alt` when the name is beside the avatar already. The fallback follows the `alt`: it takes the name, or it hides.
- Give `delay` to the fallback, such as 600, thus a fast image does not flash initials first.
- Style the root by `data-status`: `loading`, `loaded` or `error`.
- Read the status with `onStatusChange` on the root.

## API reference

- `Avatar.Root`
  - `onStatusChange?: (status: 'loading' | 'loaded' | 'error') => void`
  - `element?: HTMLSpanElement | null` (bindable)
- `Avatar.Image`
  - `src?: string | null`, `alt: string`
  - `element?: HTMLImageElement | null` (bindable)
- `Avatar.Fallback`
  - `delay?: number` (`0`)
  - `element?: HTMLSpanElement | null` (bindable)

## Accessibility

- The image is an `<img>` with your `alt`. The root has no role of its own.
- The fallback takes the name of the image: it is a `role="img"` named with the `alt`. A screen reader hears the name, and not the letters of the initials. An empty `alt` hides it. Without an image, it is plain content.
- Nothing in the avatar is focusable.
