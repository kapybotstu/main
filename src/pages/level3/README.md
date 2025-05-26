# Level 3 - Employee Benefits Module

## Structure

```
level3/
├── components/          # Reusable components
│   ├── BenefitCard.js   # Card component for benefits display
│   ├── RequestCard.js   # Card component for requests table
│   └── TokenBalance.js  # Token balance display widget
│
├── styles/              # Modular CSS architecture
│   ├── shared/          # Shared styles and utilities
│   │   ├── variables.css    # CSS variables (colors, spacing, etc.)
│   │   ├── base.css         # Base styles and common classes
│   │   └── animations.css   # Reusable animations
│   │
│   ├── components/      # Component-specific styles
│   │   ├── card.css         # Card component styles
│   │   └── modal.css        # Modal component styles
│   │
│   ├── pages/           # Page-specific styles
│   │   ├── Dashboard.css         # Dashboard page styles
│   │   ├── AvailableBenefits.css # Benefits carousel styles
│   │   ├── MyRequests.css        # Requests management styles
│   │   └── MyTokens.css          # Tokens page styles
│   │
│   └── index.css        # Main style imports
│
├── Level3Dashboard.js   # Main dashboard page
├── AvailableBenefits.js # Benefits browsing page
├── MyRequests.js        # User requests management
└── MyTokens.js          # Token balance and history

## CSS Architecture

### Variables
All design tokens are centralized in `styles/shared/variables.css`:
- Colors and gradients
- Spacing scales
- Typography scales
- Shadows
- Border radius
- Z-index layers
- Transitions

### Base Styles
Common utilities in `styles/shared/base.css`:
- Glassmorphism effects
- Button styles
- Container layouts
- Responsive utilities

### Animations
Reusable animations in `styles/shared/animations.css`:
- Fade in/out
- Slide animations
- Loading states
- Hover effects

## Usage

### Adding New Components
1. Create component in `components/`
2. Add component styles in `styles/components/`
3. Import base styles as needed

### Modifying Styles
1. Update CSS variables for global changes
2. Component styles are isolated in their respective files
3. Page-specific styles only contain page layout logic

### Maintaining Routes
All routes remain unchanged. The reorganization only affects internal structure while maintaining the same public API.

## Benefits of This Structure
- **Modular**: Each concern is separated
- **Maintainable**: Easy to find and update styles
- **Scalable**: Simple to add new components
- **Performant**: Only load necessary styles
- **Consistent**: Shared variables ensure consistency