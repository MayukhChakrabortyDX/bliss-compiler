# Bliss Project UI & Architectural Directives

This document outlines authoritative engineering rules, design system guidelines, and styling constraints for the Bliss project codebase.

---

## 🚫 1. Strict Prohibitions

1. **No Embedded `<style>` or `<style scoped>` Tags**:
   - Do **NOT** write `<style>` or `<style scoped>` blocks inside `.vue` single-file components.
   - All component and page styles MUST be placed in dedicated CSS files inside `docs/.vitepress/theme/styles/derived/` using `derived-*` naming conventions.

2. **No Hardcoded Inline `style="..."` Attributes**:
   - Do **NOT** use inline `style="..."` or `:style="..."` in Vue templates for static or layout styling.
   - Inline `:style="..."` is allowed **only** for dynamic runtime measurements calculated by JavaScript (e.g. scroll progress percentages, element position bounding boxes).

3. **No Redundant DOM Event Delegation for Router Transitions**:
   - Do **NOT** attach raw `pointerdown` or `click` event listeners to `document` for router progress bars.
   - Always use VitePress's native `useRouter()` lifecycle hooks (`onBeforeRouteChange` and `onAfterRouteChange`).

---

## 🎨 2. Design System & Aesthetics

1. **White-Toned Palette with Intentional Color Accents**:
   - The interface MUST maintain a clean, white-toned aesthetic (`--bliss-bg: #fafafa`, `--bliss-bg-elevated: #ffffff`) so it never feels dark or busy.
   - Use subtle, curated accent colors (`--bliss-violet`, `--bliss-blue`, `--bliss-amber`, `--bliss-emerald`) for badges, eyebrows, active navigation states, and micro-interactions to prevent pages from looking flat or bland.

2. **Top Navigation & Mobile Floating Button Rules**:
   - Marketing homepage top navbar MUST be transparent at rest (`background: transparent`, `border-bottom: 1px solid transparent`, `backdrop-filter: none`).
   - All segment top navbars MUST feature frosted glass styling when scrolled (`backdrop-filter: blur(16px) saturate(180%)`, subtle border, `box-shadow: none`).
   - Drop shadows (`box-shadow`) under top navbars are strictly prohibited across all segments.
   - Mobile floating navigation menu buttons MUST be visible across all site segments (`BlissNav`, `DocsNav`, `BlogNav`, `CoursesNav`, `PapersNav`) at `@media (max-width: 768px)`.
   - Mobile floating navigation buttons MUST feature white-toned frosted glass styling (`rgba(255, 255, 255, 0.92)`, subtle border, backdrop blur) and smooth Vue `<Transition name="mobile-menu">` enter/leave scale animations (`.mobile-menu-enter-active`, `.mobile-menu-leave-active`).

3. **Segment Background Personalities**:
   - Each site segment MUST feature a subtle, soft top radial background gradient that gives the segment a distinct visual personality while maintaining a clean white background (`#fafafa`):
     - **Docs Segment**: Subtle Violet technical ambient glow (`rgba(139, 92, 246, 0.065)`).
     - **Blog Segment**: Subtle Sapphire Blue editorial ambient glow (`rgba(59, 130, 246, 0.065)`).
     - **Courses Segment**: Subtle Emerald learning ambient glow (`rgba(16, 185, 129, 0.07)`).
     - **Papers Segment**: Subtle Amber research ambient glow (`rgba(245, 158, 11, 0.07)`).

4. **Micro-Interactions**:
   - All interactive elements (cards, links, buttons, sidebar items, tags) MUST feature smooth transitions (`160ms–180ms ease`).
   - Cards MUST feature subtle hover elevation (`transform: translateY(-2px)` or `-4px`) with soft ambient colored shadow glows.

---

## 📁 3. Modular CSS File Architecture

```
docs/.vitepress/theme/styles/
├── tokens.css       # Design tokens (:root custom properties for colors, typography, spacing, radii, z-index, transitions)
├── reset.css        # Base reset, typography defaults, selection, scrollbar & accessibility settings
├── typography.css   # Text utility classes (.bliss-display, .bliss-heading, .bliss-body, .bliss-label)
├── layout.css       # Layout primitives (.bliss-container, container widths, site shell layout grid)
├── components.css   # UI Language primitive components (.bliss-button, .bliss-card, .bliss-pill, .bliss-surface)
├── code.css         # Code blocks, inline code, syntax highlighting & markdown content formatting
├── ambient.css      # Ambient background blur blobs & glowing visual effects
├── sections.css     # Domain-specific page section layouts (Docs shell, Blog, Courses, Papers)
├── derived/
│   ├── derived-home.css        # Marketing homepage styles (.home-*, .derived-home-*)
│   ├── derived-navbars.css     # Navigation headers for all segments (.derived-nav-*)
│   ├── derived-docs.css        # Documentation shell & outline drawer (.derived-docs-*)
│   ├── derived-blog.css        # Blog index & article reader (.derived-blog-*)
│   ├── derived-courses.css     # Courses grid & video player (.derived-courses-*)
│   ├── derived-papers.css      # Papers list & PDF preview modal (.derived-papers-*, .derived-paper-modal-*)
│   ├── derived-notfound.css    # 404 page layout (.derived-notfound-*)
│   └── derived-footer.css      # Global footer (.derived-footer-*)
└── theme.css                   # Main stylesheet importing all modular CSS files via @import
```

---

## 🧱 4. Primitive Component Architecture

All recurring UI elements MUST be extracted as composable primitives in `docs/.vitepress/theme/components/primitives/`:

1. **`BlissEyebrow.vue`**: Monospace category tag component with color variant props (`violet`, `blue`, `emerald`, `amber`) and status dot support.
2. **`BlissPageHeader.vue`**: Standardized hero and section header with slots for eyebrow, title, description, and metadata.
3. **`BlissCard.vue`**: Surface card primitive supporting ambient hover glows, card artwork, titles, descriptions, and action link slots.
4. **`BlissButton.vue`**: Universal button / link primitive with hover micro-animations (`arrow-right`, `external`, `play`).
5. **`BlissModal.vue`**: Glassmorphic modal overlay primitive with keydown ESC listener, backdrop blur, and body/footer slots.

Domain layouts (`DocsIndexLayout.vue`, `BlogLayout.vue`, `PapersLayout.vue`, `CoursesLayout.vue`) MUST compose these primitive components instead of duplicating markup or raw HTML elements.
