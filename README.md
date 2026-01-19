# Svelte Components

A collection of accessible, customizable UI components for Svelte 5.

## Installation

```bash
npm install @agustin/svelte-components
```

## Components

- **Button** - Interactive button with press states
- **ComboBox** - Accessible autocomplete with keyboard navigation
- **Dialog** - Modal dialogs with focus trap
- **Input** - Text input field
- **Label** - Form labels
- **ListBox** - Selection list with keyboard navigation
- **Popover** - Floating content panels
- **Portal** - Render content outside the DOM hierarchy
- **Table** - Data table with sorting and selection

## Usage

```svelte
<script>
  import { Button, ComboBox, Dialog } from '@agustin/svelte-components';
</script>

<Button>Click me</Button>

<ComboBox trigger="focus">
  <ComboBox.Input placeholder="Search..." />
  <ComboBox.Button />
  <ComboBox.Popover>
    <ComboBox.ListBox>
      <ComboBox.ListBoxItem id="1" textValue="Option 1">
        Option 1
      </ComboBox.ListBoxItem>
    </ComboBox.ListBox>
  </ComboBox.Popover>
</ComboBox>
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build library
npm run package

# Run tests
npm run test
```

## Stack

- Svelte 5 with Runes
- TailwindCSS 4
- TypeScript
- Floating UI for positioning
- Class Variance Authority for variants
