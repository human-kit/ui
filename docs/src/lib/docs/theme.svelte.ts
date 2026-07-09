import { browser } from '$app/environment';

class Theme {
	dark = $state(browser ? document.documentElement.classList.contains('dark') : false);

	toggle() {
		this.dark = !this.dark;
		document.documentElement.classList.toggle('dark', this.dark);
		localStorage.setItem('theme', this.dark ? 'dark' : 'light');
	}
}

// Must stay in sync with the anti-FOUC script in app.html (same localStorage
// key and class).
export const theme = new Theme();
