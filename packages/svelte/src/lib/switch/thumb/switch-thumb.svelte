<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../../utils/cn';
	import { useSwitchContext } from '../root/context';

	type SwitchThumbProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'class'> & {
		children?: Snippet;
		class?: string;
	};

	let { children, class: className = '', ...restProps }: SwitchThumbProps = $props();

	const switchRoot = useSwitchContext();
</script>

<span
	{...restProps}
	data-switch-thumb="true"
	data-checked={switchRoot.isChecked || undefined}
	data-unchecked={!switchRoot.isChecked || undefined}
	data-pressed={switchRoot.pressed || undefined}
	data-disabled={switchRoot.isDisabled || undefined}
	data-readonly={switchRoot.isReadOnly || undefined}
	data-required={switchRoot.required || undefined}
	data-focused={switchRoot.focused || undefined}
	data-focus-visible={switchRoot.focusVisible || undefined}
	aria-hidden="true"
	class={cn('block', className)}
>
	{@render children?.()}
</span>
