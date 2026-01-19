// Components with namespace exports
export { ComboBox } from './combobox/index.ts';
export { Dialog } from './dialog/index.ts';
export { ListBox } from './listbox/index.ts';
export { Popover } from './popover/index.ts';

// Default exports (legacy patterns for restructured components)
export { default as ComboBoxDefault } from './combobox/index.ts';
export { default as DialogDefault } from './dialog/index.ts';
export { default as ListBoxDefault } from './listbox/index.ts';
export { default as PopoverDefault } from './popover/index.ts';

// Simple components (not restructured yet)
export { default as Input } from './input/index.ts';
export { default as Label } from './label/index.ts';
export { Portal } from './portal/index.ts';

// Re-export all named exports from restructured components
export * from './combobox/index.ts';
export * from './dialog/index.ts';
export * from './listbox/index.ts';
export * from './popover/index.ts';
