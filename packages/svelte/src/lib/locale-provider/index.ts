import LocaleProvider from './locale-provider.svelte';

export { LocaleProvider };
export default LocaleProvider;

export {
	getLocaleContext,
	setLocaleContext,
	useLocaleContext,
	useLocaleContextOptional,
	type LocaleContext
} from './context';
