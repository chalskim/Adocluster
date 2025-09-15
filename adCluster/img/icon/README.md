# Material Symbols Icons

This directory contains locally downloaded Material Symbols SVG icons for use in the application.

## Directory Structure

```
img/icon/
├── material-symbols/     # Local SVG icons
│   ├── folder.svg
│   ├── folder_open.svg
│   ├── expand_more.svg
│   └── ... (other icons)
└── README.md            # This file
```

## Usage

To use these icons in React components, import and use the `Icon` component:

```jsx
import Icon from '../../components/editeComponents/Icon';

// Usage in JSX
<Icon name="folder" className="my-icon" />
<Icon name="description" style={{ width: '24px', height: '24px' }} />
```

## Available Icons

The following icons are available locally:

- folder
- folder_open
- expand_more
- chevron_right
- draft
- description
- image
- table_chart
- link
- calculate
- videocam
- mic
- code
- format_quote

## Adding New Icons

To add new icons:

1. Download SVG files from [Google Fonts Material Icons](https://fonts.google.com/icons)
2. Place them in the `material-symbols` directory
3. Update the `LOCAL_ICONS` map in `Icon.tsx` to include the new icon

## Fallback

If an icon is not available locally, the component will fall back to using Material Symbols via the CDN.