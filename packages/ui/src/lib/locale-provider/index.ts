import type { ComponentProps } from 'svelte';
import type LocaleProviderComponent from './locale-provider.svelte';
import LocaleProvider from './locale-provider.svelte';

export type LocaleProviderProps = ComponentProps<typeof LocaleProviderComponent>;
export { LocaleProvider };
export default LocaleProvider;

export {
	getLocaleContext,
	setLocaleContext,
	useLocaleContext,
	useLocaleContextOptional,
	type LocaleContext
} from './context';
