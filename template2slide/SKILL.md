---
name: template2slide
description: Convert verified proposal template (markdown) to final PowerPoint presentation. Automatically generates architecture diagrams, maps content to slide structure, and creates professional presentation. Use when you have a presale-verified template file and need to generate the complete proposal slides.
---

# Template to Slide Skill

## Overview

This skill converts a verified proposal template (markdown file) into a complete PowerPoint presentation. It orchestrates three main steps:

1. **Architecture Generation**: Creates system architecture Mermaid diagrams from template content
2. **Content Mapping**: Maps template sections to structured slide format (JSON)
3. **Slide Generation**: Creates final PowerPoint presentation from slide structure

**Input**: Verified proposal template markdown file (e.g., `AVA_Project_Nas_Ltd_template.md`)
**Output**: Complete PowerPoint presentation (`.pptx` file)

## When to Use This Skill

Use this skill when:
- You have a proposal template that has been verified by presales
- Template content is correct and ready for slide generation
- You need to generate the complete proposal presentation
- User mentions "generate slides from template", "create proposal presentation", or "convert template to PowerPoint"

## Quick Start

Run the complete pipeline:

```bash
python scripts/template2slide.py <template_file.md> [output_dir]
```

This automatically:
1. Generates architecture diagram
2. Maps content to slide structure
3. Prepares for PowerPoint generation

## Process Overview

The skill follows this workflow:

```
Template File (Markdown)
    ↓
[Step 1] Generate Architecture Diagram
    ↓
[Step 2] Map Content to Slide Structure
    ↓
[Step 3] Generate PowerPoint Presentation
    ↓
Final .pptx File
```

For detailed instructions on each step, see:
- **Architecture Generation**: See `deployment_method_selection_logic.md` and `ARCHITECTURE_TEMPLATES.md`
- **Content Mapping**: See `SLIDE_TEMPLATE.md` for slide structure definitions
- **PowerPoint Generation**: See `html2pptx.md` for conversion workflow

## Resources Available

This skill uses progressive disclosure - main instructions are here, detailed documentation is in supporting files:

### Architecture Generation
- **deployment_method_selection_logic.md**: Complete logic for determining deployment method
- **ARCHITECTURE_TEMPLATES.md**: Architecture patterns from KB examples
- **types_architecture.txt**: List of all supported deployment methods

### Content Mapping
- **SLIDE_TEMPLATE.md**: Slide structure template with mapping rules from template sections to slide types

### Slide Generation
- **html2pptx.md**: Complete guide for HTML to PowerPoint conversion
- **ooxml.md**: Guide for OOXML editing workflows (advanced)

### Scripts
- **scripts/template2slide.py**: Main orchestration script (runs full pipeline)
- **scripts/generate_from_deal_transfer.py**: Generate architecture diagrams
- **scripts/map_to_slides.py**: Map template content to slide structure
- **scripts/generate_from_json.js**: Generate PowerPoint from slide structure

## Step-by-Step Process

### Step 1: Generate Architecture Diagram

The skill automatically:
- Extracts deployment method from template (or determines it using logic)
- Generates Mermaid diagram following KB examples
- Creates `[Project_Name]_architecture_diagram.md`

**Key Principles** (see `ARCHITECTURE_TEMPLATES.md` for details):
- Simple Flow: Camera → (NVR optional) → RTSP Links → AI System → Dashboard & Alert
- No Internal Details: Don't show DB, API Gateway, Auth Service
- List AI Modules: Show all modules with full names
- Clean Layout: Minimal, beautiful, professional

### Step 2: Map Content to Slide Structure

The skill automatically:
- Parses all template sections
- Maps each section to appropriate slide(s) following `SLIDE_TEMPLATE.md`
- Creates structured JSON with slide-by-slide content
- Outputs `[Project_Name]_slide_structure.json`

**Mapping Rules** (see `SLIDE_TEMPLATE.md` for complete mapping):
- Cover Page → Slide 1 (title)
- Project Requirement → Slide 2 (content_bullets)
- Scope of Work → Slide 3 (two_column)
- System Architecture → Slide 4 (diagram)
- System Requirements → Slide 5+ (content_bullets)
- Implementation Plan → Timeline slide
- Proposed Modules → Module description slides

**Important**: All module information must be extracted correctly:
- Module Type (Standard/Custom)
- Purpose Description
- Alert Trigger Logic
- Preconditions
- Detection Criteria (if applicable)
- Image URL (optional, can be empty) - **Note**: Images are downloaded and inserted into slides automatically
- Video URL (optional, can be empty) - **Note**: **Priority rule for video_url**: 
  1. Download video from `video_url` first
  2. Try to insert video into slide using `<video>` tag (html2pptx may or may not support it)
  3. If video insertion fails (after trying all methods), show `video_url` link for manual insertion
  4. Only use `image_url` if `video_url` is empty/null

### Step 3: Generate PowerPoint Presentation

The skill uses html2pptx workflow (see `html2pptx.md` for details):
- Creates HTML slides for each slide type
- **Downloads images from Google Drive URLs**: Module image URLs are automatically downloaded from Google Drive to assets folder
- Converts HTML to PowerPoint using html2pptx library
- Adds architecture diagram (converts Mermaid to image)
- Inserts downloaded images into module description slides
- Applies consistent styling and formatting
- Outputs `[Project_Name]_proposal.pptx`

**Media Download Process** (for Proposed Modules slides):
1. **Priority: Video URL** (if provided)
   - Download video from `video_url` using multiple methods (direct download, view URL, Playwright fallback)
   - Validate video file type using magic bytes
   - If video download succeeds:
     - **Try to insert video into slide**: Insert `<video>` tag in HTML (html2pptx may or may not support it)
     - **Fallback to link**: If video cannot be inserted (html2pptx doesn't support `<video>` tags), show `video_url` link for manual insertion
   - If video download fails after trying all methods, show `video_url` link for manual insertion

2. **Fallback: Image URL** (only if `video_url` is empty or null)
   - If `video_url` is empty and `image_url` is provided, download image
   - Download images using multiple methods (direct download, view URL, Playwright fallback)
   - Save images to `assets/` folder with proper naming
   - Reference downloaded images in HTML slides
   - Images are automatically inserted into PowerPoint during conversion

3. **Manual Insertion**
   - If both `video_url` and `image_url` are empty, leave blank for manual insertion
   - If video cannot be inserted into slide, video URL link is displayed for manual insertion

### Step 4: Insert Reference Slides

After generating the PowerPoint, the skill automatically inserts reference slides:

1. **Architecture Template Slide**: After the architecture diagram slide (generated from Mermaid), inserts a template slide from `ref/System_architecture.pptx` based on deployment method:
   - **Cloud**: Slide 2 from System_architecture.pptx
   - **On-Premise**: Slide 3 from System_architecture.pptx
   - **Hybrid (AI Interference at site, Dashboard + Training Cloud)**: Slide 4 from System_architecture.pptx
   - **Hybrid (AI Interference + Training at site, Dashboard Cloud)**: Slide 5 from System_architecture.pptx

2. **Available Slides**: Inserts standard slides from `ref/AvailableSlide11.pptx`:
   - **Slides 2-10**: Inserted after slide 1 (title slide) of generated presentation
   - **Slides 11-25**: Inserted after the last slide of generated presentation
   - Background from generated slides is automatically applied to inserted slides (11-25)

**Note**: The script `insert_reference_slides.py` handles this automatically. It requires:
- `project_info.json` file (created during architecture generation)
- Reference files in `ref/` directory:
  - `System_architecture.pptx`
  - `AvailableSlide11.pptx`

## Output Files

The skill generates:

1. **`[Project_Name]_architecture_diagram.md`**: Mermaid architecture diagram code
2. **`[Project_Name]_project_info.json`**: Extracted project information and deployment method (used for inserting reference slides)
3. **`[Project_Name]_slide_structure.json`**: Complete slide structure in JSON format
4. **`[Project_Name]_slide_content.md`**: Human-readable slide content summary (optional)
5. **`[Project_Name]_proposal.pptx`**: Final PowerPoint presentation (includes reference slides)

## Important Rules

### 1. Template Validation
- Ensure template has been verified by presales before processing
- All required sections must be present
- Content should be complete and accurate

### 2. Information Extraction
- **Never use default/placeholder values** - all values must be extracted from template
- **Required fields** (must be found, raise error if missing):
  - Client Name (Project Owner)
  - Deployment Method
  - Camera Number
  - AI Modules list
  - Module Name (for each module)
  - Module Purpose Description
  - Module Alert Trigger Logic
  - Module Preconditions
- **Optional fields** (can be empty if not provided):
  - Image URL
  - Video URL
  - Data Requirements
- If any required field is missing, the script will raise an error with clear message indicating what needs to be fixed

### 3. Architecture Generation
- Always use logic from `deployment_method_selection_logic.md` when deployment method is not explicit
- Match KB architecture examples structure (minimal, beautiful style)
- Show essential flow only: Camera → Processing → Dashboard & Alert
- List all AI modules with full names

### 4. Content Mapping
- Map ALL sections from template to slides
- Don't skip any dynamic content
- Use appropriate slide type for each content type
- Group related modules when possible


### 5. PowerPoint Generation
- Maintain consistent formatting across all slides
- Ensure proper text sizing and readability
- Apply professional design principles
- Convert Mermaid diagrams to images for PowerPoint

### 6. Video Handling for Proposed Modules
- **Priority rule**: Always prioritize `video_url` over `image_url`
- **Process**:
  1. Download video from `video_url` (if provided)
  2. Try to insert video into slide using `<video>` tag
  3. If video insertion fails (html2pptx doesn't support videos), show `video_url` link for manual insertion
  4. Only use `image_url` if `video_url` is empty or null
- **Note**: PowerPoint/html2pptx typically doesn't support embedded videos, so video URL link will usually be shown for manual insertion even if video is downloaded successfully

## Quality Checks

Before finalizing, verify:
- ✅ Architecture diagram matches deployment method
- ✅ All template sections are mapped to slides
- ✅ All module information is extracted (no empty fields except image_url/video_url)
- ✅ Slide numbering is continuous
- ✅ Content is properly formatted
- ✅ PowerPoint file opens correctly
- ✅ All images and diagrams are visible

## Troubleshooting

### Module Information Missing
- Check if template uses correct format: `### Module X: Name`
- Verify field format: `• **Field:** Value` or `**Field:** Value`
- Check `scripts/map_to_slides.py` extraction logic

### Architecture Not Generated
- Check if deployment method can be determined from template
- Verify template has System Architecture section
- Review `deployment_method_selection_logic.md` for determination rules

### Slides Missing Content
- Verify all template sections are properly formatted
- Check section headers match expected format (## Section Name)
- Review `SLIDE_TEMPLATE.md` for mapping rules

## Dependencies

Required dependencies:
- **Python 3.8+**: For all Python scripts
- **Node.js**: For html2pptx conversion
- **pptxgenjs**: `npm install -g pptxgenjs`
- **playwright**: `npm install -g playwright`
- **sharp**: `npm install -g sharp`
- **mermaid-cli**: For diagram rendering (optional, can use online service)

## Testing

Test with provided template:
```bash
python scripts/template2slide.py AVA_Project_Nas_Ltd_template.md output/
```

Verify outputs:
- Architecture diagram is generated correctly
- Slide structure includes all sections with complete information
- PowerPoint opens and displays properly
- All content is formatted correctly

## Next Steps

After generating the presentation:
1. Review the PowerPoint for accuracy
2. Check all images and diagrams are visible
3. Verify content matches template
4. Make any necessary adjustments
5. Share with presales for final review
