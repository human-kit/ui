export interface NavItem {
	slug: string;
	title: string;
	/** A page that is a guide in a group of components. */
	guide?: boolean;
}

export interface NavGroup {
	label: string;
	items: NavItem[];
}

export const nav: NavGroup[] = [
	{
		label: 'Overview',
		items: [
			{ slug: 'quick-start', title: 'Quick Start' },
			{ slug: 'accessibility', title: 'Accessibility' },
			{ slug: 'releases', title: 'Releases' },
			{ slug: 'about', title: 'About' }
		]
	},
	{
		label: 'Form',
		items: [
			{ slug: 'button', title: 'Button' },
			{ slug: 'checkbox', title: 'Checkbox' },
			{ slug: 'checkbox-group', title: 'CheckboxGroup' },
			{ slug: 'input', title: 'Input' },
			{ slug: 'numberfield', title: 'NumberField' },
			{ slug: 'pin-input', title: 'PinInput' },
			{ slug: 'radio-group', title: 'RadioGroup' },
			{ slug: 'rating', title: 'Rating' },
			{ slug: 'search-field', title: 'SearchField' },
			{ slug: 'slider', title: 'Slider' },
			{ slug: 'switch', title: 'Switch' },
			{ slug: 'textarea', title: 'TextArea' },
			{ slug: 'toggle', title: 'Toggle' },
			{ slug: 'toggle-group', title: 'ToggleGroup' }
		]
	},
	{
		label: 'Pickers',
		items: [
			{ slug: 'autocomplete', title: 'Autocomplete' },
			{ slug: 'color-picker', title: 'ColorPicker' },
			{ slug: 'combobox', title: 'ComboBox' },
			{ slug: 'listbox', title: 'ListBox' },
			{ slug: 'select', title: 'Select' },
			{ slug: 'transfer-list', title: 'TransferList' },
			{ slug: 'calendar', title: 'Calendar' },
			{ slug: 'clock', title: 'Clock' },
			{ slug: 'datepicker', title: 'DatePicker' },
			{ slug: 'daterangepicker', title: 'DateRangePicker' },
			{ slug: 'timepicker', title: 'TimePicker' }
		]
	},
	{
		label: 'Overlays',
		items: [
			{ slug: 'dialog', title: 'Dialog' },
			{ slug: 'drawer', title: 'Drawer' },
			{ slug: 'menu', title: 'Menu' },
			{ slug: 'popover', title: 'Popover' },
			{ slug: 'toast', title: 'Toast' },
			{ slug: 'tooltip', title: 'Tooltip' }
		]
	},
	{
		label: 'Structure',
		items: [
			{ slug: 'accordion', title: 'Accordion' },
			{ slug: 'avatar', title: 'Avatar' },
			{ slug: 'breadcrumbs', title: 'Breadcrumbs' },
			{ slug: 'collapsible', title: 'Collapsible' },
			{ slug: 'progress', title: 'Progress' },
			{ slug: 'separator', title: 'Separator' },
			{ slug: 'table', title: 'Table' },
			{ slug: 'tabs', title: 'Tabs' },
			{ slug: 'tree', title: 'Tree' }
		]
	},
	{
		label: 'Charts',
		items: [
			{ slug: 'charts', title: 'Introduction', guide: true },
			{ slug: 'chart-accessibility', title: 'Accessibility', guide: true },
			{ slug: 'chart', title: 'Chart' },
			{ slug: 'chart-scales', title: 'Scales' },
			{ slug: 'chart-line', title: 'Line' },
			{ slug: 'chart-area', title: 'Area' },
			{ slug: 'chart-bar', title: 'Bar' },
			{ slug: 'chart-dot', title: 'Dot' },
			{ slug: 'chart-arc', title: 'Arc' },
			{ slug: 'chart-rule', title: 'Rule' },
			{ slug: 'chart-axis-and-grid', title: 'Axis and Grid' },
			{ slug: 'chart-legend', title: 'Legend' },
			{ slug: 'chart-tooltip', title: 'Tooltip' },
			{ slug: 'chart-data-table', title: 'DataTable' }
		]
	}
];
