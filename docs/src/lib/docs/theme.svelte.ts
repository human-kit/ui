import { browser } from '$app/environment';

class Theme {
	dark = $state(browser ? document.documentElement.classList.contains('dark') : false);

	toggle() {
		this.dark = !this.dark;
		document.documentElement.classList.toggle('dark', this.dark);
		localStorage.setItem('theme', this.dark ? 'dark' : 'light');
	}
}

export const theme = new Theme();
