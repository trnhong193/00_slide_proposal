---
name: template2slide
description: Convert presales-approved proposal template (markdown) to final PowerPoint. Input should be the confirmed template produced by dealtransfer2template (after checklist update). Automatically generates architecture diagram, slide JSON, and PPTX.
---

# Template to Slide Skill

## Overview

This skill converts a **presales-approved** proposal template (markdown file) into a complete PowerPoint presentation. Input should be the confirmed template produced by `dealtransfer2template` after checklist resolution. It orchestrates three main steps:

1. **Architecture Generation**: Creates system architecture Mermaid diagrams from template content
2. **Content Mapping**: Maps template sections to structured slide format (JSON)
3. **Slide Generation**: Creates final PowerPoint presentation from slide structure

**Input**: Presales-approved proposal template markdown file (e.g., `AVA_Project_Nas_Ltd_template.md`) with **no placeholders** remaining (e.g., `[NETWORK_001]`).
**Output**: Complete PowerPoint presentation (`.pptx` file)

## When to Use This Skill

Use this skill when:
- You have a proposal template that has been **verified by presales** and has **no unresolved placeholders**
- The template originates from `dealtransfer2template` + checklist update (or equivalent) and is ready for slide generation
- Template content is correct and ready for slide generation
- You need to generate the complete proposal presentation
- User mentions "generate slides from template", "create proposal presentation", or "convert template to PowerPoint"

## Quick Start

Pre-flight: Ensure the template has no placeholder IDs (e.g., `[NETWORK_001]`, `[TIMELINE_002]`). If placeholders exist, send back to checklist update before continuing.

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
- **instruction.md**: Slide rendering standards (layout, overflow, media priority)
- **html2pptx.md**: Complete guide for HTML to PowerPoint conversion
- **ooxml.md**: Guide for OOXML editing workflows (advanced)

### Scripts
- **scripts/template2slide.py**: Main orchestration script (runs full pipeline)
- **scripts/generate_from_deal_transfer.py**: Generate architecture diagrams
- **scripts/map_to_slides.py**: Map template content to slide structure
- **scripts/generate_from_json.js**: Generate PowerPoint from slide structure
- **scripts/renderers/**: HTML layout renderers per slide type (edit here when a new template requires layout tweaks)

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
- Image URL (optional, can be empty)
- Video URL (optional, can be empty)

### Step 3: Generate PowerPoint Presentation

The skill uses html2pptx workflow (see `html2pptx.md` for details):
- Creates HTML slides for each slide type
- Converts HTML to PowerPoint using html2pptx library
- Adds architecture diagram (converts Mermaid to image)
- Applies consistent styling and formatting
- Outputs `[Project_Name]_proposal.pptx`

## Output Files

The skill generates:

1. **`[Project_Name]_architecture_diagram.md`**: Mermaid architecture diagram code
2. **`[Project_Name]_project_info.json`**: Extracted project information and deployment method
3. **`[Project_Name]_slide_structure.json`**: Complete slide structure in JSON format
4. **`[Project_Name]_slide_content.md`**: Human-readable slide content summary (optional)
5. **`[Project_Name]_proposal.pptx`**: Final PowerPoint presentation

## Important Rules

### 1. Template Validation
- Ensure template has been verified by presales before processing
- Reject/stop if any placeholder tokens remain (e.g., `[NETWORK_001]`, `[TIMELINE_001]`, `[MODULE_COUNT_001]`) — route back to checklist update
- All required sections must be present
- Content should be complete and accurate

### 2. Information Extraction
- **Never use default/placeholder values** for module information
- All fields (purpose, alert_logic, preconditions) must be extracted from template
- Only image_url and video_url can be empty (if not provided in template)
- Module type must be extracted correctly (Standard/Custom)

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
