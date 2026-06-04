import { getContext, setContext } from 'svelte';
import type { AccordionValue } from '../root/context.js';

export type AccordionItemContext = {
	readonly value: AccordionValue;
	readonly isDisabled: boolean;
	readonly triggerId: string;
	readonly panelId: string;
};

const ACCORDION_ITEM_CONTEXT_KEY = Symbol('accordion-item');

export function setAccordionItemContext(context: AccordionItemContext) {
	setContext(ACCORDION_ITEM_CONTEXT_KEY, context);
	return context;
}

export function getAccordionItemContext() {
	return getContext<AccordionItemContext | undefined>(ACCORDION_ITEM_CONTEXT_KEY);
}

export function useAccordionItemContext() {
	const context = getAccordionItemContext();
	if (!context) {
		throw new Error('Accordion.Header, Accordion.Trigger and Accordion.Panel must be used inside `Accordion.Item`.');
	}
	return context;
}
