# CView: Product Description

## Vision
A CV builder where users fill in structured forms and see a pixel-accurate PDF of their CV update
live, generated entirely in the browser. Users can keep multiple versions of their CV and choose
between templates.

## Users
| Type | How they start | Where data lives |
|---|---|---|
| Guest | "Continue as guest", no account | `sessionStorage` (lost when the tab closes; the UI warns about this) |
| Registered (phase 3) | Sign in | PostgreSQL via the API. Can import a guest session on sign-up |

## Screen layout
```
┌──────────────────────────────────────────────────────────────────────┐
│ [Logo]                                       [☀/☾] [☰ menu] [(avatar)] │  top bar (full width)
├───────────────────────────────────────┬──────────────────────────────┤
│ Main sections bar  ◂ scrolls ▸        │                              │
│ Sub-sections bar   ◂ scrolls ▸        │   PDF preview                │
├───────────────────────────────────────┤   (panel itself is fixed;    │
│                                       │    the PDF scrolls through   │
│ Content: forms for the active         │    its pages)                │
│ section / sub-section                 │                              │
│                                       │                  ‖ drag      │
└───────────────────────────────────────┴──────────────────────────────┘
```

### Top bar
> Contents are a working draft; the details are deferred (D-21).

- **Left:** the logo.
- **Right, always visible:** the light/dark toggle and the user avatar (a circle). Clicking the avatar opens the profile editor.
  Guests get a placeholder avatar.
- **Hamburger menu:**
  - **Login** when not logged in, **Settings** when logged in. Settings will hold the UI language later (i18n).
  - **CV versions**: switch, create, duplicate, rename, delete.
  - **About** (and GitHub; to be confirmed).
- In phase 1 there is no auth. Login is a placeholder (to be decided: disabled "coming soon", or a stub page).

### Editor (left panel)
- **Main sections bar** (top) selects the main section. **Sub-sections bar** (below it) selects a sub-section
  of the active main section. Both bars **scroll horizontally** when they overflow.
- Sections come from a **section registry**, so a section isn't hard-coded into the UI. Each main section
  declares its sub-bar kind:
  - `none`: no sub-bar (it animates away)
  - `entries`: one tab per list item plus a "＋ Add" tab (e.g. one tab per company)
  - `fixed`: a fixed list of sub-sections (e.g. Skills · Languages)
- Sections (confirmed, D-22):

  | Main | Sub-bar | Content |
  |---|---|---|
  | Profile | none | name, title, summary, contact, address, links |
  | Experience | entries (per company) | company details, then that company's projects (name, description, skills) |
  | Education | entries (per institution) | institution, degree, major, period, description |
  | Skills & Languages | fixed: Skills · Languages | named items with a level |
- **Content area** below the bars shows the forms for the current selection. All input is validated with
  Zod and shows inline errors.
- **All text inputs are debounced** before they update the store (default 300 ms), so typing stays smooth
  and the PDF doesn't re-render on every keystroke.
- **Later stage:** users can add **custom sections and sub-sections**. The registry is designed for this from day one.

### PDF preview (right panel)
- The PDF is regenerated in the browser from the current data with a short debounce, and the user sees it
  update in near real time. A download button exports the same PDF.
- The **panel does not scroll**. Only the PDF inside it scrolls through the pages.
- **Preview toolbar** (D-24; position and details TBD, Q-12): the user picks the PDF **colours**, **font**
  and **language** for the current CV version. Changes re-render the preview immediately.
- **PDF language ≠ UI language** (D-23). The PDF language controls the headings and labels inside the PDF
  ("Experience" / "Berufserfahrung") and the date formatting. It's saved per CV version.
- **Resizable and collapsible:**
  - A drag handle between the panels resizes the preview within a min/max width.
  - Dragging below the minimum (or clicking collapse) collapses the preview into a **thin vertical bar**
    with a pop-out **handle**.
  - The handle can be **clicked** to expand to the last width, or **dragged** to expand to a chosen width.
  - Panel width and collapsed state are remembered for the session.

## Animations
Rich, purposeful motion everywhere, using motion-v plus Vue `<Transition>`. It must respect `prefers-reduced-motion`.
- **Tab change (both bars):** the active background and underline **slide** from the old tab to the new one
  (shared-layout animation, motion-v `layoutId`).
- **Section change (content):** the old content fades out quickly (~120 ms), then the new content's elements
  **rise from below and fade in one after another** (staggered fade-up, ~40–60 ms apart). Fast clicking must
  never be blocked or produce a queue of animations.
- Also: the sub-bar appearing and disappearing, list add/remove/reorder, card expand/collapse and the preview collapse/expand.

## Templates
A template is a self-contained PDF layout plus a theme (colours and font, user-editable from the preview toolbar).
Fixed template text (headings) comes from per-language PDF label dictionaries, not from the UI i18n. Phase 1 ships one template.
The architecture supports many, and the user picks one per CV version.

## CV versions
A user can keep several named versions of their CV (for example "Frontend role" and "Team lead"), and create,
duplicate, rename, delete and switch between them. Guests get the same feature, stored in `sessionStorage`.

## CV data
The canonical shape is defined by the Zod schemas in `app/schemas/`. Sections: profile (personal info,
contact, address, links), experience (company → projects), education, skills and languages.

## Non-goals (for now)
- No backend, database or auth in phase 1.
- No server-side PDF rendering.
- No rich-text editor (plain text and bullet lists only) unless decided otherwise.
- No custom sections in phase 1 (planned for a later phase).

## Quality bar
- Type-safe end to end (Zod, then TS types, then the Eden-typed API later).
- Responsive. On small screens the layout must still work (exact behaviour to be decided, Q-5).
- Accessible: labels, keyboard navigation of the tab bars (arrow keys, `role="tablist"`), focus
  management on section change, colour contrast.
- Tested: unit, integration and E2E for every user-facing feature.
- Internationalised from day one (`@nuxtjs/i18n`). English ships first, and more UI languages come later (D-19, D-20).
