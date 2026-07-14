---
name: NexusAI Design System
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#353944'
  surface-container-lowest: '#0a0e18'
  surface-container-low: '#171b26'
  surface-container: '#1c1f2a'
  surface-container-high: '#262a35'
  surface-container-highest: '#313540'
  on-surface: '#dfe2f1'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dfe2f1'
  inverse-on-surface: '#2c303b'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#c0c6db'
  on-tertiary: '#293040'
  tertiary-container: '#8a90a4'
  on-tertiary-container: '#232a39'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#dce2f7'
  tertiary-fixed-dim: '#c0c6db'
  on-tertiary-fixed: '#141b2b'
  on-tertiary-fixed-variant: '#404758'
  background: '#0f131d'
  on-background: '#dfe2f1'
  surface-variant: '#313540'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-base:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-code:
    fontFamily: Geist Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style
The design system is engineered for a premium, enterprise-grade AI experience. It targets technical founders, engineers, and data scientists who require a focused, low-friction environment for building Agentic RAG workflows. 

The aesthetic is **Precision-Focused Minimalism**, blending the systematic rigor of developer tools with the sophisticated depth of modern glassmorphism. It evokes an emotional response of absolute reliability and advanced technological capability. The UI stays out of the way, using ample whitespace and a strict adherence to a dark-mode-first architecture to reduce cognitive load during complex data orchestration.

## Colors
The palette is rooted in deep obsidian tones to provide maximum contrast for generative AI outputs and code snippets. 

- **Backgrounds**: The core canvas uses a near-black gray to provide depth.
- **Surface & Elevation**: Tonal stepping is achieved through a hierarchy of dark grays, moving from the base background to a slightly lighter surface for navigation and cards.
- **Accents**: Electric Blue is the primary action color, used for high-intent tasks. Purple is used sparingly to denote AI-driven features or "magic" states, creating a visual distinction between manual and agentic processes.
- **States**: Semantic colors use a slightly desaturated palette to remain cohesive within the dark environment while ensuring high accessibility scores.

## Typography
This design system utilizes **Geist** for its technical precision and optimal legibility in monospaced and sans-serif contexts. 

The type scale is modular, favoring tight line heights for headings and generous spacing for body text to aid in reading long-form AI responses. For technical documentation or RAG source citations, the system defaults to a 14px size to maximize information density without sacrificing clarity.

## Layout & Spacing
The layout relies on an **8px linear scale**, ensuring mathematical harmony across all components.

- **Grid**: A 12-column fluid grid is used for dashboard layouts, while a centered 800px column is used for focused AI chat interfaces.
- **Breakpoints**: 
    - Mobile: < 640px (single column, reduced margins)
    - Tablet: 640px - 1024px (hidden sidebars, collapsed navigation)
    - Desktop: > 1024px (standard 12-column)
- **Rhythm**: Vertical rhythm is maintained by using the `lg` (24px) unit for spacing between logical sections and `md` (16px) for internal component spacing.

## Elevation & Depth
Depth is conveyed through transparency and subtle luminosity rather than traditional heavy shadows.

- **Glassmorphism**: Primary overlays and modals use a background blur (`backdrop-blur: 12px`) combined with a semi-transparent surface fill (`rgba(17, 24, 39, 0.7)`).
- **Luminous Borders**: Elements are separated from the background by a `1px` solid border using `white/5` or `white/10`. This creates a "glow" effect that defines the edges in a dark environment.
- **Shadows**: Only three levels of shadows are used, all utilizing a deep black color with a very wide spread and low opacity (50-70%) to create a soft, non-muddy lift.

## Shapes
The design system employs a **Rounded** aesthetic with high-radius corners to soften the technical nature of the platform.

- **Standard Elements**: Buttons and inputs use a 0.5rem (8px) radius.
- **Containers**: Cards, modals, and major sections use a 1rem (16px) or 1.25rem (20px) radius to create a distinct, modern container feel.
- **Interactive States**: Hovering over elements should never change the corner radius, but may increase the border luminosity.

## Components
Consistent component styling ensures the platform feels like a single, cohesive tool.

### Buttons
- **Primary**: Solid Electric Blue (#3B82F6) with white text. Subtle inner glow on hover.
- **Secondary (Ghost)**: Transparent background with a `white/10` border. High-contrast white text.
- **Danger**: Solid Red (#EF4444) used strictly for destructive actions (e.g., deleting a RAG index).

### Inputs & Search
- Inputs are minimal with a background color matching the Surface tier (#111827).
- Left-aligned Lucide icons are used for context (search, filter).
- Active state: Border transitions to Electric Blue with a subtle outer glow.

### Cards & Modules
- Use the `#1F2937` background.
- Include a 1px `white/5` border.
- Headers within cards should use the `label-caps` typography style for categorization.

### Lists & Tables
- Border-bottom only (`white/5`).
- Hover state: Background changes to `white/3` with a 0ms transition on entry and 200px on exit.

### Feedback & Loading
- **Skeleton Screens**: Use a pulsing animation between `#111827` and `#1F2937`.
- **Transitions**: All interactive state changes should use a `cubic-bezier(0.4, 0, 0.2, 1)` timing function for a "snappy" but smooth feel.