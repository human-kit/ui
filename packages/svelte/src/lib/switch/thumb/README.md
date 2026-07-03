# Switch Thumb

## API reference

### Switch.Thumb

Name: `Switch.Thumb`  
Description: Headless visual thumb for the switch. It mirrors root state through data attributes.

| Prop           | Type                              | Default     | Description                                        |
| -------------- | --------------------------------- | ----------- | -------------------------------------------------- |
| `children`     | `Snippet`                         | `undefined` | Optional rendered thumb content.                   |
| `class`        | `string`                          | `''`        | CSS class names for the thumb element.             |
| `...restProps` | `HTMLAttributes<HTMLSpanElement>` | `-`         | Additional attributes forwarded to the thumb span. |

```svelte
<Switch.Root aria-label="Dark mode">
	<Switch.Thumb />
</Switch.Root>
```
