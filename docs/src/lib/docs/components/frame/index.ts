import Root from './root.svelte';
import Header from './header.svelte';
import Body from './body.svelte';
import Content from './content.svelte';
import Sidebar from './sidebar.svelte';

/**
 * Frame — the docs layout shell. Composes a padded root, a sticky header rail,
 * a body row, a center reading pane, and side rails. Coloring is delegated to
 * `<Surface>` levels (see ./recipe.ts).
 */
export const Frame = { Root, Header, Body, Content, Sidebar };
