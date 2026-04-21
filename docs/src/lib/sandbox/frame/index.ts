import Content from './content.svelte';
import Footer from './footer.svelte';
import Header from './header.svelte';
import Root from './root.svelte';

export const Frame = Object.assign(Root, {
	Root,
	Content,
	Header,
	Footer
});

export default Frame;
