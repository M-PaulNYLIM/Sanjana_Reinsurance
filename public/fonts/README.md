# Custom Fonts Setup

Place your custom font files in this directory with the following naming convention:

## Primary Font (Main UI font)

- `primary-font.woff2` - Primary font in WOFF2 format (recommended)
- `primary-font.woff` - Primary font in WOFF format (fallback)
- `primary-font.ttf` - Primary font in TTF format (fallback)
- `primary-font-bold.woff2` - Bold variant in WOFF2 format
- `primary-font-bold.woff` - Bold variant in WOFF format
- `primary-font-bold.ttf` - Bold variant in TTF format

## Secondary Font (Accent/Heading font)

- `secondary-font.woff2` - Secondary font in WOFF2 format (recommended)
- `secondary-font.woff` - Secondary font in WOFF format (fallback)
- `secondary-font.ttf` - Secondary font in TTF format (fallback)
- `secondary-font-bold.woff2` - Bold variant in WOFF2 format
- `secondary-font-bold.woff` - Bold variant in WOFF format
- `secondary-font-bold.ttf` - Bold variant in TTF format

## Usage

Once your fonts are placed here, they will be automatically available throughout the application:

- **Primary Font**: Used for body text, UI elements, and general content
- **Secondary Font**: Used for headings and accent text (can be customized with `font-secondary` class)

## Font Classes Available

- `font-primary` - Apply primary font
- `font-secondary` - Apply secondary font
- `text-heading` - Primary font with bold weight
- `text-body` - Primary font with normal weight
- `text-accent` - Secondary font for accent text

The fonts are optimized for performance with `font-display: swap` for better loading experience.
