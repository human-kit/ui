import { describe, expect, it } from 'vitest';
import { cubicOut, linear } from 'svelte/easing';
import { collapseMotion } from './collapse-motion';

function createMeasuredNode() {
	const node = document.createElement('div');
	node.style.height = '40px';
	node.style.paddingTop = '8px';
	node.style.paddingBottom = '8px';
	node.textContent = 'row';
	document.body.appendChild(node);
	return node;
}

describe('collapseMotion', () => {
	it('defaults to a 200ms ease-out transition matching Accordion/Collapsible', () => {
		const node = createMeasuredNode();
		try {
			const config = collapseMotion(node);

			expect(config.duration).toBe(200);
			expect(config.easing).toBe(cubicOut);
		} finally {
			node.remove();
		}
	});

	it('honors custom duration, delay and easing', () => {
		const node = createMeasuredNode();
		try {
			const config = collapseMotion(node, { duration: 120, delay: 30, easing: linear });

			expect(config.duration).toBe(120);
			expect(config.delay).toBe(30);
			expect(config.easing).toBe(linear);
		} finally {
			node.remove();
		}
	});

	it('fades opacity in step with the collapse progress', () => {
		const node = createMeasuredNode();
		try {
			const config = collapseMotion(node);
			const css = config.css;
			if (!css) throw new Error('collapseMotion must produce a css function');

			expect(css(0, 1)).toContain('opacity:0');
			expect(css(1, 0)).toContain('opacity:1');
		} finally {
			node.remove();
		}
	});

	it('animates the geometry to nothing at the start of the enter transition', () => {
		const node = createMeasuredNode();
		try {
			const config = collapseMotion(node);
			const css = config.css;
			if (!css) throw new Error('collapseMotion must produce a css function');

			const collapsed = css(0, 1);
			expect(collapsed).toContain('overflow: hidden');
			expect(collapsed).toMatch(/height:\s*0px/);
		} finally {
			node.remove();
		}
	});
});
