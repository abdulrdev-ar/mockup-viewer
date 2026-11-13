***

version: alpha
name: Aren
description: A calm, clinical, editorial system for a healthcare AI brand with strong blue accents and spacious composition.
colors:
primary: "#0F60FF"
secondary: "#112A33"
tertiary: "#B2CCFF"
neutral: "#E9E5E2"
surface: "#FFFFFF"
on-surface: "#112A33"
error: "#D64545"
border: "#E5E7EB"
muted-accent: "#D6E4FF"
sky: "#AFC6FF"
typography:
headline-display:
fontFamily: "fontSprigSans"
fontSize: "50px"
fontWeight: 400
lineHeight: 1.2
letterSpacing: "-1px"
headline-lg:
fontFamily: "fontSprigSans"
fontSize: "37px"
fontWeight: 400
lineHeight: 1.62
letterSpacing: "-1px"
headline-md:
fontFamily: "fontSprigSans"
fontSize: "27px"
fontWeight: 400
lineHeight: 1.155
letterSpacing: "-0.26px"
headline-sm:
fontFamily: "fontSprigSans"
fontSize: "20px"
fontWeight: 400
lineHeight: 1.2
letterSpacing: "0px"
body-lg:
fontFamily: "fontSprigSans"
fontSize: "16px"
fontWeight: 400
lineHeight: 1.5
letterSpacing: "0px"
body-md:
fontFamily: "fontSprigSans"
fontSize: "15px"
fontWeight: 400
lineHeight: 1.53
letterSpacing: "0px"
body-sm:
fontFamily: "fontSprigSans"
fontSize: "13px"
fontWeight: 400
lineHeight: 1.46
letterSpacing: "0px"
label-lg:
fontFamily: "fontRedwardMono"
fontSize: "13px"
fontWeight: 400
lineHeight: 1.2
letterSpacing: "0.04em"
label-md:
fontFamily: "fontRedwardMono"
fontSize: "12px"
fontWeight: 400
lineHeight: 1.2
letterSpacing: "0.04em"
label-sm:
fontFamily: "fontRedwardMono"
fontSize: "10px"
fontWeight: 400
lineHeight: 1.2
letterSpacing: "0.04em"
caption:
fontFamily: "fontSprigSans"
fontSize: "11px"
fontWeight: 400
lineHeight: 1.4
letterSpacing: "0px"
rounded:
none: "0px"
sm: "4px"
md: "8px"
lg: "16px"
xl: "24px"
full: "9999px"
spacing:
xs: "2px"
sm: "12px"
md: "20px"
lg: "40px"
xl: "120px"
components:
button-primary:
backgroundColor: "{colors.primary}"
textColor: "{colors.tertiary}"
typography: "{typography.body-sm}"
rounded: "{rounded.full}"
padding: "4px"
height: "40px"
button-primary-hover:
backgroundColor: "{colors.sky}"
textColor: "{colors.secondary}"
typography: "{typography.body-sm}"
rounded: "{rounded.full}"
padding: "4px"
height: "40px"
button-secondary:
backgroundColor: "transparent"
textColor: "{colors.secondary}"
typography: "{typography.body-sm}"
rounded: "{rounded.full}"
padding: "4px"
height: "40px"
button-link:
backgroundColor: "transparent"
textColor: "{colors.secondary}"
typography: "{typography.body-sm}"
rounded: "{rounded.none}"
padding: "0px"
card:
backgroundColor: "{colors.neutral}"
textColor: "{colors.secondary}"
rounded: "{rounded.md}"
padding: "16px"
card-hero:
backgroundColor: "{colors.surface}"
textColor: "{colors.secondary}"
rounded: "{rounded.lg}"
padding: "20px"
input:
backgroundColor: "{colors.surface}"
textColor: "{colors.secondary}"
typography: "{typography.body-sm}"
rounded: "{rounded.md}"
padding: "12px"
chip:
backgroundColor: "{colors.muted-accent}"
textColor: "{colors.secondary}"
typography: "{typography.label-md}"
rounded: "{rounded.full}"
padding: "4px"
nav-link:
backgroundColor: "transparent"
textColor: "{colors.secondary}"
typography: "{typography.label-lg}"
rounded: "{rounded.none}"
padding: "0px"

# Aren

## Overview

Aren feels calm, trustworthy, and quietly premium, with a healthcare-forward editorial tone rather than a purely techy one. The layout is generous and airy, giving the interface room to breathe while still feeling purposeful and information-rich. The emotional balance is strong: clinical credibility on one side, human care and optimism on the other.

## Colors

- **Primary (#0F60FF):** A vivid electric blue used for key actions, brand accents, and interactive emphasis. It provides the strongest contrast in the system and carries the most recognizable brand energy.
- **Secondary (#112A33):** A deep blue-green ink used for headlines, navigation, body copy, and most high-importance text. It reads as professional, grounded, and medically credible.
- **Tertiary (#B2CCFF):** A soft pale blue used for lighter button text and subtle supporting emphasis. It helps the primary blue feel less harsh.
- **Neutral (#E9E5E2):** A warm off-white background tone that keeps the page from feeling sterile. It supports the editorial, human-centered feel.
- **Surface (#FFFFFF):** Pure white for cards and image frames when separation from the neutral canvas is needed.
- **On-surface (#112A33):** Default readable text on light surfaces, matching the brand’s primary ink color.
- **Border (#E5E7EB):** A faint neutral border for cards and low-emphasis containers when needed.
- **Muted-accent (#D6E4FF):** A soft blue tint for supporting highlights, subtle badges, and light UI ornaments.
- **Sky (#AFC6FF):** A lighter blue used for hover states or secondary accent backgrounds when the interface needs a gentler response.
- **Error (#D64545):** A restrained red reserved for validation and failure states; it should remain rare.

## Typography

The system uses a custom serif-like display voice through `fontSprigSans` for most content, paired with `fontRedwardMono` for compact labels and technical annotations. Headlines are light in weight and rely on negative letter spacing to feel elegant, editorial, and slightly literary rather than corporate. Body text remains regular weight and highly readable, with comfortable line heights that suit long-form marketing copy.

- `headline-display`, `headline-lg`, and `headline-md` are for hero statements, section titles, and prominent messaging.
- `headline-sm` supports smaller prominent labels or subsection titles.
- `body-lg` and `body-md` are the default reading styles for paragraphs and descriptive content.
- `body-sm` is used for buttons, compact utility text, and small interface affordances.
- `label-lg`, `label-md`, and `label-sm` are monospaced, uppercase-friendly utility styles for navigation, chips, and data-style labels.
- The visible system favors restrained capitalization and small, spaced labels in navigation and metadata, rather than heavy all-caps styling.

## Layout

The page is built on a very spacious, asymmetrical composition rather than a strict centered grid. Large zones of empty background create a premium, presentation-like feel, while images and data fragments are layered to the right for depth and movement. Spacing follows a simple rhythm from `xs` through `xl`, with substantial breathing room between hero copy, supporting text, and visual elements.

Containers should feel fluid and edge-aware, not boxed into a rigid max-width aesthetic. Use generous outer padding, especially on large screens, and let content blocks float with intentional overlap. Cards and supporting panels should use moderate internal padding, with the largest spacing reserved for hero sections and major separations.

## Elevation & Depth

Depth is created primarily through overlap, tonal contrast, and image layering rather than through heavy UI shadows. Most interface panels are flat or nearly flat, with subtle borders and soft edges doing the work of separation. The main visual hierarchy comes from scale, placement, and the contrast between the dark copy and the pale canvas, plus the strong blue imagery.

Shadows are minimal in the UI system; when used, they should stay soft and atmospheric rather than crisp or material. Prefer layered surfaces, transparent overlays, and controlled cropping over glossy elevation effects.

## Shapes

The shape language is rounded but not playful. Interactive controls use a full pill radius, while cards and framed content use small to medium radii for a soft, refined feel. Overall, the system balances clinical precision with humane softness.

- Buttons are fully rounded with `rounded.full`.
- Standard cards use `rounded.md`.
- Larger feature cards and content frames can use `rounded.lg`.
- Avoid sharp corners unless the component is explicitly typographic or link-like.

## Components

### Buttons

Primary buttons should use `button-primary`: bright blue background, pale blue text, pill shape, and compact vertical padding. They are understated in size but visually prominent because of the color contrast. Hover states should shift toward the softer `button-primary-hover` treatment, reducing intensity while staying clearly interactive.

Secondary buttons should use `button-secondary`: transparent background, ink text, blue outline or perceived boundary if needed, and the same pill geometry. Link buttons should use `button-link` with no border, no fill, and underline treatment for low-emphasis actions like “Learn more.”

Buttons should remain compact, with a consistent 40px height and minimal padding so they feel clean and editorial rather than chunky.

### Cards

Cards should favor neutral or white surfaces with minimal border treatment and very restrained elevation. Use `card` for muted supporting panels and `card-hero` for larger featured blocks that need a brighter, more spacious container. Rounded corners should be soft but not exaggerated.

### Inputs

Inputs should feel calm and unobtrusive: white background, ink text, subtle radii, and comfortable internal padding. Avoid heavy borders or strong fills; the field should recede so form content remains the focus.

### Chips and Labels

Use `chip` for compact metadata pills, status tags, and lightweight callouts. Chips should use the pale blue support tone rather than the primary blue. Use `label-md` and `label-lg` for technical annotations, navigation items, and small informational text; their mono style reinforces the system’s data-informed healthcare character.

### Navigation

Nav links should use `nav-link` with minimal decoration and plenty of spacing between items. They should feel like editorial section anchors rather than app navigation tabs.

### Media and Feature Panels

Image blocks and feature panels should overlap intentionally and can sit partially outside the main text column. Keep corner radii moderate and let the photography provide most of the energy. Frames should feel curated, not app-like.

## Do's and Don'ts

- Do keep the canvas spacious and let whitespace carry the composition.
- Do use the deep ink color for body copy and navigation to preserve clarity.
- Do reserve bright blue for primary actions and brand emphasis.
- Do keep typography light, editorial, and highly readable.
- Do prefer subtle borders and layered images over heavy shadows.
- Don't crowd the layout with dense UI chrome or many competing controls.
- Don't introduce saturated secondary colors that fight the brand blue.
- Don't use sharp rectangles or aggressive material-style elevation.
