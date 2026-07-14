export interface NavItem {
	slug: string;
	title: string;
}

export interface NavGroup {
	label: string;
	items: NavItem[];
}

export const nav: NavGroup[] = [
	{
		label: 'Form',
		items: [
			{ slug: 'button', title: 'Button' },
			{ slug: 'checkbox', title: 'Checkbox' },
			{ slug: 'input', title: 'Input' },
			{ slug: 'numberfield', title: 'NumberField' },
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
			{ slug: 'combobox', title: 'ComboBox' },
			{ slug: 'listbox', title: 'ListBox' },
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
			{ slug: 'menu', title: 'Menu' },
			{ slug: 'popover', title: 'Popover' }
		]
	},
	{
		label: 'Structure',
		items: [
			{ slug: 'accordion', title: 'Accordion' },
			{ slug: 'collapsible', title: 'Collapsible' },
			{ slug: 'table', title: 'Table' },
			{ slug: 'tabs', title: 'Tabs' },
			{ slug: 'tree', title: 'Tree' }
		]
	}
];
