import { describe, expect, it } from 'vitest';
import { visuallyHiddenStyle } from './visually-hidden';

function styleOf(css: string): CSSStyleDeclaration {
	const element = document.createElement('span');
	element.setAttribute('style', css);
	return element.style;
}

describe('visuallyHiddenStyle', () => {
	it('lays the element out against the viewport, so it never escapes a scroll container', () => {
		const style = styleOf(visuallyHiddenStyle);

		expect(style.position).toBe('fixed');
		expect(style.top).toBe('0px');
		expect(style.left).toBe('0px');
	});

	it('hides the element visually and keeps it in the accessibility tree', () => {
		const style = styleOf(visuallyHiddenStyle);

		expect(style.width).toBe('1px');
		expect(style.height).toBe('1px');
		expect(style.overflow).toBe('hidden');
		expect(style.clip).toBe('rect(0px, 0px, 0px, 0px)');
		expect(style.display).toBe('');
		expect(style.visibility).toBe('');
	});
});
