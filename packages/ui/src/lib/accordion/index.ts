import type { ComponentProps } from 'svelte';
import type AccordionHeaderComponent from './header/accordion-header.svelte';
import type AccordionItemComponent from './item/accordion-item.svelte';
import type AccordionPanelComponent from './panel/accordion-panel.svelte';
import type AccordionRootComponent from './root/accordion-root.svelte';
import type AccordionTriggerComponent from './trigger/accordion-trigger.svelte';

export * as Accordion from './index.parts.js';

export { default as AccordionRoot } from './root/accordion-root.svelte';
export { default as AccordionItem } from './item/accordion-item.svelte';
export { default as AccordionHeader } from './header/accordion-header.svelte';
export { default as AccordionTrigger } from './trigger/accordion-trigger.svelte';
export { default as AccordionPanel } from './panel/accordion-panel.svelte';

export type AccordionRootProps = ComponentProps<typeof AccordionRootComponent>;
export type AccordionItemProps = ComponentProps<typeof AccordionItemComponent>;
export type AccordionHeaderProps = ComponentProps<typeof AccordionHeaderComponent>;
export type AccordionTriggerProps = ComponentProps<typeof AccordionTriggerComponent>;
export type AccordionPanelProps = ComponentProps<typeof AccordionPanelComponent>;

export {
	createAccordionContext,
	getAccordionContext,
	setAccordionContext,
	useAccordionContext,
	type AccordionContext,
	type AccordionOrientation,
	type AccordionSelectionMode,
	type AccordionValue,
	type CreateAccordionContextOptions
} from './root/context.svelte';

export {
	getAccordionItemContext,
	setAccordionItemContext,
	useAccordionItemContext,
	type AccordionItemContext
} from './item/context.js';

import * as AccordionParts from './index.parts.js';
export default AccordionParts;
