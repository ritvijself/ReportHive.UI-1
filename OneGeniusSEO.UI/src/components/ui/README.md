# Button Component

A production-grade, reusable Button component with multiple variants and features.

## Features

- **4 Variants**: Primary, Subtle, Warning, and Danger
- **3 Sizes**: Small (sm), Medium (md), and Large (lg)
- **Loading State**: Built-in spinner animation
- **Icon Support**: Icons on left or right side
- **Full Width Option**: Expandable to full container width
- **Accessibility**: Proper focus states and disabled handling
- **Tailwind CSS**: Styled with Tailwind utility classes

## Usage

```jsx
import { Button } from '../components/ui';

// Basic usage
<Button>Click me</Button>

// Different variants
<Button variant="primary">Primary</Button>
<Button variant="subtle">Subtle</Button>
<Button variant="warning">Warning</Button>
<Button variant="danger">Danger</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Loading state
<Button loading>Loading...</Button>

// With icons
<Button icon={<YourIcon />} iconPosition="left">
  With Icon
</Button>

// Full width
<Button fullWidth>Full Width Button</Button>

// Disabled
<Button disabled>Disabled</Button>

// Custom className
<Button className="my-custom-class">Custom Button</Button>
```

## Props

| Prop           | Type                                             | Default     | Description                               |
| -------------- | ------------------------------------------------ | ----------- | ----------------------------------------- |
| `variant`      | `'primary' \| 'subtle' \| 'warning' \| 'danger'` | `'primary'` | Button style variant                      |
| `size`         | `'sm' \| 'md' \| 'lg'`                           | `'md'`      | Button size                               |
| `loading`      | `boolean`                                        | `false`     | Shows loading spinner and disables button |
| `icon`         | `React.ReactNode`                                | `undefined` | Icon to display                           |
| `iconPosition` | `'left' \| 'right'`                              | `'left'`    | Position of the icon                      |
| `fullWidth`    | `boolean`                                        | `false`     | Makes button full width                   |
| `disabled`     | `boolean`                                        | `false`     | Disables the button                       |
| `className`    | `string`                                         | `''`        | Additional CSS classes                    |

All standard HTML button attributes are also supported through the spread operator.

## Styling

The component uses Tailwind CSS classes and follows a consistent design system:

- **Primary**: Blue background with white text
- **Subtle**: Light gray background with dark text
- **Warning**: Yellow background with white text
- **Danger**: Red background with white text

Each variant includes hover, focus, and active states for better user experience.
