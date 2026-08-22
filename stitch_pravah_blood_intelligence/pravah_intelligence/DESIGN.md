---
name: PRAVAH Intelligence
colors:
  surface: '#fff8f6'
  surface-dim: '#e2d8d5'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fcf1ee'
  surface-container: '#f6ece8'
  surface-container-high: '#f0e6e3'
  surface-container-highest: '#ebe0dd'
  on-surface: '#1f1b19'
  on-surface-variant: '#594141'
  inverse-surface: '#352f2d'
  inverse-on-surface: '#f9efeb'
  outline: '#8c7070'
  outline-variant: '#e0bfbf'
  surface-tint: '#b1293c'
  primary: '#80001f'
  on-primary: '#ffffff'
  primary-container: '#a31e33'
  on-primary-container: '#ffb7b8'
  inverse-primary: '#ffb3b4'
  secondary: '#44664b'
  on-secondary: '#ffffff'
  secondary-container: '#c5ecc9'
  on-secondary-container: '#4a6c50'
  tertiary: '#583600'
  on-tertiary: '#ffffff'
  tertiary-container: '#774b00'
  on-tertiary-container: '#ffbd65'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb3b4'
  on-primary-fixed: '#40000b'
  on-primary-fixed-variant: '#8f0b27'
  secondary-fixed: '#c5ecc9'
  secondary-fixed-dim: '#aad0ae'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#2c4e34'
  tertiary-fixed: '#ffddb6'
  tertiary-fixed-dim: '#ffb95a'
  on-tertiary-fixed: '#2a1800'
  on-tertiary-fixed-variant: '#643f00'
  background: '#fff8f6'
  on-background: '#1f1b19'
  surface-variant: '#ebe0dd'
typography:
  display-lg:
    fontFamily: Noto Serif
    fontSize: 64px
    fontWeight: '600'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-md:
    fontFamily: Noto Serif
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Noto Serif
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
  kpi-value:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Manrope
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 48px
  panel-gap: 24px
  section-margin: 80px
---

## Brand & Style
The design system embodies a "Quietly Confident" aesthetic, blending the precision of high-end SaaS with the warmth of a mission-critical healthcare platform. It moves away from cold, clinical aesthetics toward a sophisticated, editorial-inspired interface that feels both authoritative and humane.

The design style is a hybrid of **Minimalism** and **Tonal Layering**. It relies on expansive whitespace, refined typography, and subtle shifts in surface temperature rather than aggressive shadows or borders. The visual language conveys reliability and intelligence, ensuring that life-saving data is presented with absolute clarity and premium finish.

## Colors
The palette is grounded in a warm, organic base to reduce visual fatigue and differentiate the platform from standard "blue-scale" medical software.

- **Primary (Crimson):** Used for critical actions, branding accents, and urgent status indicators. It is the "pulse" of the application.
- **Secondary (Sage):** Represents stability and "ready" states. Use this for successful inventory levels and positive trends.
- **Tertiary (Amber):** Reserved for cautionary data points and low-stock warnings.
- **Surface Strategy:** The UI uses `#FBF7F4` as the global canvas. Functional zones and navigation panels use `#F5F1EE` to create depth without relying on shadows.
- **Text:** Warm charcoal `#2B2624` provides high legibility while maintaining the organic feel of the brand.

## Typography
The typography strategy creates a high-contrast editorial hierarchy. 

**Noto Serif** is utilized for primary headlines and storytelling elements to inject a sense of tradition and medical authority. It should be used for page titles and section headers.

**Manrope** serves as the functional workhorse. Its modern, geometric construction ensures that complex data tables and KPI readouts remain legible at all sizes. For oversized metrics (KPIs), use tight letter spacing and heavy weights to emphasize the "intelligence" aspect of the platform.

## Layout & Spacing
This design system rejects the standard "dashboard grid" in favor of an **Asymmetric Layered Composition**. 

- **Composition:** Use varying widths for adjacent panels (e.g., a 65% width data visualization paired with a 35% width insights panel). This creates a rhythmic, bespoke feel.
- **Margins:** Generous outer margins (48px+) are required to maintain a "premium" sense of space.
- **Responsive Behavior:** 
    - **Desktop:** Asymmetric panels with fluid widths.
    - **Tablet:** Panels stack into a single column but maintain asymmetrical internal padding.
    - **Mobile:** Full-width panels with 24px horizontal safe areas; serif headlines scale down to 28px for readability.

## Elevation & Depth
Depth is achieved through **Tonal Separation** rather than physical elevation.

- **The Stack:** The base layer is `#FBF7F4`. Raised functional areas use the `#F5F1EE` panel color.
- **Hairlines:** For internal separation within panels, use 1px hairlines with a very low opacity (10% black or 15% of the primary color). 
- **Interaction:** Shadows are avoided except for "floating" elements like dropdown menus or modals, where a very soft, diffused shadow (Blur: 32px, Opacity: 4%, Color: Warm Charcoal) may be used to indicate focus.
- **Focus States:** Instead of a glow, use a 1px solid primary color border or a subtle background shift.

## Shapes
The shape language is **Soft (0.25rem)**. This provides enough curvature to feel modern and accessible without becoming overly "bubbly" or consumer-grade.

- **Primary UI Elements:** Buttons, inputs, and small chips use a 4px (0.25rem) radius.
- **Panels/Cards:** Large structural containers use an 8px (0.5rem) radius to define clear boundaries.
- **Interactive Elements:** Active states should maintain these sharp, precise corners to reflect the technical accuracy of the intelligence engine.

## Components
- **Buttons:** Primary buttons use a solid `#A31E33` with white text. Secondary buttons are transparent with a 1px hairline border in the primary color. Use generous horizontal padding (24px).
- **KPI Cards:** Large-format numbers in `kpi-value` style. No background card; use a simple label-sm above the number and a 1px vertical hairline on the left to denote the start of the data point.
- **Status Chips:** Use secondary (`#6B8F71`) for "Stable" and primary (`#A31E33`) for "Critical". Backgrounds should be at 10% opacity of the color with 100% opacity text.
- **Input Fields:** Minimalist design with a 1px bottom border only in default state; transitions to a full 1px outline on focus. Background is slightly darker than the panel background.
- **Intelligence Feed:** A list component with asymmetric layout—alternating left/right alignment of timestamps and data points to create a "thread" feel.
- **Data Tables:** Remove all vertical lines. Use only subtle horizontal hairlines and generous row height (64px) to emphasize the whitespace-first philosophy.