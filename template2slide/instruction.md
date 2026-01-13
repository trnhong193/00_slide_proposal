# Slide Generation Instructions

Input assumptions: slide JSON comes from the placeholder-free template produced by `dealtransfer2template` + checklist update. If placeholders remain upstream, resolve them before generating PPTX.

This document outlines the standards and requirements for generating presentation slides from JSON data.

## 1. General Configuration
- **Input**: JSON file containing slide definitions.
- **Output**: Powerpoint (.pptx) file generated via intermediate HTML rendering.
- **Theme**: Minimalist Dark Theme.
  - Background: `background.png` (Dark/Black base).
  - Primary Text: White (`#FFFFFF`).
  - Accent Color: viAct Blue (`#00AEEF`) or similar bright cyan/blue.
  - Font: Sans-serif (Arial, Helvetica, or System UI).

## 2. Layout & Typography Rules
- **Spacing**: 
  - Ensure generous margins. Content must not touch the edges of the slide.
  - **Minimum bottom margin**: 0.5" (36pt) required for all slides to prevent content overflow.
  - Text line-height should be comfortable (e.g., 1.4 - 1.6).
  - Add spacing between distinct sections or list items.
- **Text Sizing**:
  - **Titles**: Large, Uppercase, Accent Color.
  - **Body Text**: Readable size relative to slide dimensions. Avoid tiny text. 
  - Dynamic sizing: If content is brief, increase font size/spacing to fill space naturally. If content is dense, use columns or moderate reduction, but never below readability thresholds (minimum 11pt).
- **Overflow Prevention (Critical)**:
  - All content containers must use `overflow: hidden` and `min-height: 0` for proper flex behavior.
  - Use `word-wrap: break-word` and `overflow-wrap: break-word` on all text elements.
  - For long content lists (>10 items), consider using columns or reducing font size.
  - Ensure all flex containers have proper `flex-shrink` values to prevent expansion beyond boundaries.

## 3. Specific Slide Type Requirements

### A. Title Slide (`type: "title"`)
- **Content**: Focus strictly on the **Title**.
- **Alignment**: **Absolute Center**. The title block must be perfectly centered both vertically and horizontally.
- **Constraint**: Limit text to a single visual unit/line if possible. Remove auxiliary details (Date, Subtitle) unless they are strictly required, to maintain a clean aesthetic.

### B. Smart Content Aggregation (`System Requirements`, `content_bullets`)
- **Merging Strategy**: 
  - Detect consecutive slides with related titles (e.g., "System Requirements: Camera" and "System Requirements: Network").
  - **Rule**: If individual slide content is short , **Merge them into a single slide**.
  - **Standard Combinations**:
    - **Infrastructure**: Network + Camera Specs (1 Slide).
    - **Software Stack**: Training + Inference + Dashboard (1 Slide).
  - **Filtering**: **Remove** slides with trivial content (e.g., "Additional Equipment: None required", "Power: Standard source") unless explicitly flagged as critical.
- **Visuals**:
  - Add appropriate **Icons** or illustrative images for each section (e.g., Camera icon for camera specs, WiFi icon for network).
- **Key-Value Highlighting**: 
  - The text *before* the colon (`:`) must be **Bold** and/or **Accent Colored**.

### C. Module Descriptions & Media (`type: "module_description"`, `diagram`)
- **Media Sizing**:
  - Images/videos must be **prominent**. Avoid small thumbnails.
  - Target at least 40-50% of the slide area for the visual component.
  - Layout: Split screen (50% Text | 50% Media) is preferred over small floating media.
- **Media Priority Logic (video_url vs image_url)**:
  1. **If `video_url` is provided and not empty**: Attempt to download and embed the video first.
  2. **If video download fails AND `image_url` is available**: Fall back to downloading the image.
  3. **If only `image_url` is provided (video_url is empty/null)**: Download and embed the image.
  4. **If both `video_url` and `image_url` are empty/null or all downloads fail**: Leave the media area blank for manual insertion by the user.
- **Source Handling**:
  - Google Drive URLs require special handling (use Playwright to handle download confirmation pages).
  - Verify downloaded files are not empty before embedding.
  - Validate file types using magic bytes (video: MP4/MOV ftyp header; image: PNG/JPEG/GIF headers).
  - **Video Download Notes**: 
    - Videos from Google Drive may require multiple download attempts with different methods.
    - If video download fails after all attempts, automatically fallback to image_url if available.
- **Diagrams**:
  - Convert Mermaid code to high-resolution PNG images with transparent background.
  - Use dark theme with viAct blue accent colors for consistency.
  - **No borders or frames** around diagram images - embed directly with transparent background.
  - Ensure diagrams are properly sized to fit within slide boundaries without overflow.

### D. Implementation Plan (`type: "timeline"`)
- **Visualization**: **Horizontal Time Axis** (Timeline).
- **Anti-Overlap Logic (Critical)**:
  - **Text Overlap is Forbidden**.
  - Use **Staggered Heights** for labels to prevent overlap:
    - Position 1 (far-top): Event text above line (-80pt), Phase/Date above line (-40pt)
    - Position 2 (near-top): Event text above line (-80pt), Phase/Date above line (-40pt)
    - Position 3 (near-bottom): Event text below line (+30pt), Phase/Date below line (+60pt)
    - Position 4 (far-bottom): Event text below line (+30pt), Phase/Date below line (+60pt)
  - If text is long: Wrap text to a narrow width (e.g., 140pt) to keep it compact horizontally.
  - Use `word-wrap: break-word` on all timeline text elements.
- **Style**:
  - Phases (T0, T1, etc.) should be clearly visible markers on the axis.
  - "phase" + "date" is positioned below the event text, always on the same side of the timeline.
  - Timeline line should span from first to last milestone with proper margins.
  - Do not use a vertical list format.

## 4. Execution Workflow (Scripts)
When generating from JSON input:
1.  **Parse JSON**: Load and validate JSON structure.
2.  **Smart Content Aggregation**: 
    - Merge consecutive "System Requirements" slides into single slides.
    - Filter out trivial content slides (e.g., "Power: Standard source").
    - Apply merging rules before generating HTML.
3.  **Process Assets**: 
    - Download images from URLs (handle Google Drive with Playwright for proper authentication).
    - Render Mermaid diagrams to PNG with transparent background and dark theme.
    - Verify all downloaded files are not empty before use.
4.  **Generate HTML**: Create individual HTML files for each slide applying the CSS rules above (save each slide HTML for debugging).
5.  **Validate Overflow**: Ensure all slides respect minimum margins (0.5" bottom margin required).
6.  **Convert**: Use `html2pptx` logic to capture the HTML layout into PPTX slides.

## 5. JSON Input File Requirements
- **Structure**: JSON must contain `slides` array with slide objects.
- **Slide Types**: `title`, `content_bullets`, `two_column`, `module_description`, `diagram`, `timeline`.
- **Media URLs (for `module_description` slides)**: 
  - `video_url`: URL to video file (Google Drive sharing links supported).
  - `image_url`: URL to image file (Google Drive sharing links supported).
  - **Priority**: `video_url` is prioritized over `image_url`. If video download fails, falls back to `image_url`.
  - **Empty media**: If both URLs are empty/missing, the media area is left blank for manual insertion.
- **Mermaid Diagrams**: 
  - `diagram.type` must be `"mermaid"`.
  - `diagram.code` contains the Mermaid syntax.
- **Timeline**: 
  - `timeline.milestones` array with `phase`, `event`, `date` fields.
  - Event text should not contain leading/trailing pipe characters.

## 6. Output
Output_dir, html_dir, assets_dir  have  name follow input file name 