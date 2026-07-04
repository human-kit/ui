import { createHighlighter } from 'shiki';

/** @type {Promise<import('shiki').Highlighter> | undefined} */
let highlighterPromise;

export function getHighlighter() {
	highlighterPromise ??= createHighlighter({
		themes: ['github-light', 'github-dark'],
		langs: ['svelte', 'typescript', 'javascript', 'html', 'css', 'bash', 'json']
	});
	return highlighterPromise;
}

/**
 * mdsvex inlines highlighted HTML into Svelte component source, so `{`, `}`
 * and backticks must be escaped or Svelte parses them as expressions.
 * @param {string} html
 */
export function escapeSvelte(html) {
	return html.replace(
		/[{}`]/g,
		(c) => ({ '{': '&#123;', '}': '&#125;', '`': '&#96;' })[/** @type {'{' | '}' | '`'} */ (c)]
	);
}

/**
 * Highlight a code block with dual light/dark themes (CSS variables).
 * @param {string} code
 * @param {string} [lang]
 */
export async function highlight(code, lang = 'text') {
	const highlighter = await getHighlighter();
	const loadedLang = lang && highlighter.getLoadedLanguages().includes(lang) ? lang : 'text';
	return escapeSvelte(
		highlighter.codeToHtml(code, {
			lang: loadedLang,
			themes: { light: 'github-light', dark: 'github-dark' },
			defaultColor: false
		})
	);
}
