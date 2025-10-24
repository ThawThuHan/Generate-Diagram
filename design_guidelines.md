# Design Guidelines: Diagram Generation Web Application

## Design Approach

**Selected Approach:** Design System + Reference-Based Hybrid

**Primary References:** Linear (clean, developer-focused UI), Excalidraw (diagram tool aesthetics), Mermaid Live Editor (technical tool patterns)

**Rationale:** This is a utility-focused developer tool requiring clarity, efficiency, and minimal cognitive load. The interface must facilitate rapid iteration between editing and viewing diagrams.

## Core Design Principles

1. **Split-View Efficiency:** Clear visual separation between input and output
2. **Minimal Distraction:** Clean, focused interface with no unnecessary ornamentation
3. **Instant Feedback:** Clear loading states and error handling
4. **Professional Polish:** Modern, crisp aesthetic that inspires confidence

## Typography

**Font Stack:**
- Primary: Inter (Google Fonts) - for UI elements, labels, buttons
- Monospace: JetBrains Mono (Google Fonts) - for code input textarea

**Type Scale:**
- Headings: font-semibold text-2xl (page title)
- Labels: font-medium text-sm (input labels, selectors)
- Body: font-normal text-base (helper text, descriptions)
- Code: font-mono text-sm (textarea content)

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20

**Container Structure:**
- Full viewport height layout (h-screen)
- Two-column split: 45% input area, 55% output area (lg:grid-cols-[45%_55%])
- Single column stack on mobile (grid-cols-1)
- Gap between columns: gap-0 (use border separator instead)

**Padding Standards:**
- Section padding: p-8
- Card padding: p-6
- Input groups: space-y-4
- Button padding: px-6 py-2.5

## Component Library

### Input Area (Left Panel)
**Structure:**
- Fixed-width sidebar on desktop, full-width on mobile
- Sticky header containing: diagram type selector, format selector
- Full-height scrollable textarea
- Fixed footer with submit button

**Diagram Type Selector:**
- Segmented control/pill buttons (inline-flex rounded-lg p-1 gap-1)
- Four options: Mermaid (default), Graphviz, BPMN, Excalidraw
- Icons from Heroicons or Font Awesome
- Active state: filled background, subtle shadow
- Inactive state: transparent background

**Format Selector:**
- Small toggle/radio group (SVG/PNG)
- Positioned top-right of input header
- SVG selected by default
- Clean toggle switch or radio buttons

**Code Input Textarea:**
- Full-height flexible textarea (flex-1)
- Monospace font
- Line numbers NOT included (keep simple)
- Resize: none (fixed to container)
- Rounded corners: rounded-lg
- Border: 1px solid with subtle shadow

**Submit Button:**
- Full-width at bottom of input panel
- Size: py-3 px-6
- Rounded: rounded-lg
- Font: font-semibold text-base
- Icon: Arrow right or play icon from Heroicons
- Loading state: spinner icon replacement

### Output Area (Right Panel)

**Structure:**
- Full-height container
- Centered image display with padding
- Fixed header showing current diagram type and format
- Fixed footer with download button

**Image Display:**
- Centered container (flex items-center justify-center)
- Max dimensions to prevent overflow
- Border: rounded-xl with subtle shadow
- Empty state: Large centered icon with helper text "Generate your first diagram"

**Download Button:**
- Positioned bottom-right or centered bottom
- Icon: Download icon from Heroicons
- Size: px-5 py-2.5
- Rounded: rounded-lg
- Disabled state when no image

### Loading States

**During API Call:**
- Dimmed/disabled submit button
- Spinner icon in button
- Skeleton loader or spinner in output area
- Prevent additional submissions

### Error Handling

**Error Display:**
- Toast notification top-right (position-fixed top-4 right-4)
- Or inline error message in output area
- Clear error icon and message
- Dismissible (X button)

## Navigation & Header

**Top Bar (Optional but Recommended):**
- App name/logo: font-bold text-xl
- Height: h-16
- Padding: px-8
- Border-bottom separator
- Positioned: sticky top-0

## Icons

**Icon Library:** Heroicons (CDN)

**Icon Usage:**
- Diagram type buttons: small icons (w-4 h-4)
- Submit button: arrow-right (w-5 h-5)
- Download button: arrow-down-tray (w-5 h-5)
- Loading spinner: animate-spin (w-5 h-5)
- Error state: exclamation-circle (w-6 h-6)

## Responsive Behavior

**Desktop (lg and above):**
- Side-by-side split view
- Fixed diagram selector and format toggle

**Tablet (md):**
- Maintain split but with adjusted ratios (50/50)
- Reduce padding to p-6

**Mobile (base):**
- Stack vertically
- Input area first, output below
- Sticky header with selectors
- Full-width buttons
- Reduce padding to p-4

## Interactions

**Minimal Animation:**
- Button hover: subtle scale (scale-105) and shadow increase
- Tab selection: smooth transition (transition-all duration-200)
- Loading states: spinner rotation only
- No page transitions, no complex animations

## Accessibility

**Form Elements:**
- All inputs have associated labels
- Proper ARIA labels for icon-only buttons
- Keyboard navigation support (tab order)
- Focus states: ring-2 ring-offset-2

**Contrast:**
- Text meets WCAG AA standards
- Interactive elements clearly distinguishable
- Focus indicators highly visible

## Visual Hierarchy

1. **Primary:** Submit button, generated diagram
2. **Secondary:** Diagram type selector, code textarea
3. **Tertiary:** Format toggle, download button, app header

## Technical Specifications

**Borders:** Use consistent 1px borders throughout
**Shadows:** Use Tailwind shadow utilities (shadow-sm, shadow-md, shadow-lg)
**Rounded Corners:** Consistent rounding (rounded-lg for containers, rounded-md for inputs)
**Transitions:** Only on interactive elements (transition-colors duration-200)

This design creates a clean, professional tool that developers will find intuitive and efficient while maintaining visual polish.