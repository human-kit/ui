<script lang="ts">
	import { Drawer, createDrawerHandle } from '../index';

	type User = { name: string };

	const users: User[] = [{ name: 'Ada' }, { name: 'Grace' }];
	const profile = createDrawerHandle<User>();
</script>

<!-- Triggers deliberately live OUTSIDE the root, which is the point of a handle. -->
{#each users as user (user.name)}
	<Drawer.Trigger handle={profile} payload={user}>Open {user.name}</Drawer.Trigger>
{/each}

<Drawer.Root handle={profile} side="right">
	{#snippet children({ payload })}
		<Drawer.Portal>
			<Drawer.Overlay />
			<Drawer.Content
				data-testid="handle-content"
				style="height: 200px; width: 200px; background: white;"
			>
				<Drawer.Title>{payload ? (payload as User).name : 'Nobody'}</Drawer.Title>
				<Drawer.Close>Close</Drawer.Close>
			</Drawer.Content>
		</Drawer.Portal>
	{/snippet}
</Drawer.Root>
