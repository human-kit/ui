# Button Root

## API reference

### Button.Root

Name: `Button.Root`  
Description: Native button root with pressed, hovered, focused, focus-visible, disabled, and pending render state.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `id` | `string` | `$props.id()` | Stable id for the native button and pending announcement labelling. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Native button type. While pending, `submit` is rendered as `button`. |
| `isPending` | `boolean` | `false` | Keeps the button focusable while disabling press and hover behavior. |
| `isDisabled` | `boolean` | `false` | Disables the native button. |
| `children` | `Snippet<[ButtonRenderState]> \| Snippet` | `undefined` | Optional renderer receiving the current interaction state. |
| `class` | `string` | `''` | CSS class names applied to the button element. |
| `...restProps` | `HTMLButtonAttributes` | `-` | Additional native button attributes forwarded to the element, excluding reserved disabled semantics. |

### Types

Name: `ButtonRenderState`  
Description: Render-state payload available to the `children` snippet.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `isHovered` | `boolean` | `false` | Whether the button is currently hovered by a mouse. |
| `isPressed` | `boolean` | `false` | Whether the button is currently being pressed. Cleared while pending. |
| `isFocused` | `boolean` | `false` | Whether the button currently holds DOM focus. |
| `isFocusVisible` | `boolean` | `false` | Whether focus is visibly keyboard or virtual driven. |
| `isDisabled` | `boolean` | `false` | Whether the button is disabled. |
| `isPending` | `boolean` | `false` | Whether the button is pending. |

```svelte
<Button.Root type="submit" isPending={saving} aria-label="Save changes">
  {#snippet children({ isPending, isPressed })}
    <span class:opacity-0={isPending}>Save</span>
    {#if isPending}
      <ProgressCircle aria-label="Saving" isIndeterminate />
    {/if}
  {/snippet}
</Button.Root>
```
