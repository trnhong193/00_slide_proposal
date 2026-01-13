# Template to Slide Skill

Unified skill that converts verified proposal templates to complete PowerPoint presentations.

## Overview

This skill combines three workflows into one seamless pipeline:
1. **Architecture Generation**: Creates system architecture Mermaid diagrams
2. **Content Mapping**: Maps template sections to structured slide format
3. **Slide Generation**: Creates final PowerPoint presentation

## Quick Start

```bash
# Run complete pipeline
python scripts/template2slide.py <template_file.md> [output_dir]

# Example
python scripts/template2slide.py AVA_Project_Nas_Ltd_template.md output/
```

## Input

- **Template File**: Verified proposal template markdown (e.g., `AVA_Project_Nas_Ltd_template.md`)
- Must contain all required sections:
  - Cover Page
  - Project Requirement Statement
  - Scope of Work
  - System Architecture
  - System Requirements
  - Implementation Plan
  - Proposed Modules

## Output

1. **`[Project_Name]_architecture_diagram.md`**: Mermaid architecture diagram
2. **`[Project_Name]_project_info.json`**: Extracted project information and deployment method
3. **`[Project_Name]_slide_structure.json`**: Complete slide structure
4. **`[Project_Name]_proposal.pptx`**: Final PowerPoint presentation (includes reference slides automatically inserted)

## Workflow

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

## Structure

```
template2slide/
├── SKILL.md                    # Main skill instructions
├── README.md                   # This file
├── SLIDE_TEMPLATE.md          # Slide structure mapping rules
├── deployment_method_selection_logic.md  # Deployment method logic
├── ARCHITECTURE_TEMPLATES.md   # Architecture patterns
├── html2pptx.md               # PowerPoint generation guide
├── ooxml.md                   # OOXML editing guide
├── scripts/
│   ├── template2slide.py      # Main orchestration script
│   ├── generate_architecture.py
│   ├── map_to_slides.py
│   ├── generate_pptx.py
│   └── ... (other supporting scripts)
└── ooxml/                     # OOXML utilities
```

## Features

✅ **Automatic Architecture Generation**: Determines deployment method and generates diagrams
✅ **Intelligent Content Mapping**: Maps all template sections to appropriate slide types
✅ **Reference Slides Integration**: Automatically inserts architecture template slides and standard available slides
✅ **Professional Output**: Creates clean, well-formatted presentations
✅ **Reusable**: Works with any proposal template following the standard format

## Usage Examples

### Basic Usage
```bash
python scripts/template2slide.py template.md
```

### With Custom Output Directory
```bash
python scripts/template2slide.py template.md ./output
```

### Step-by-Step (Manual)
```bash
# Step 1: Generate architecture
python scripts/generate_architecture.py template.md output/

# Step 2: Map to slides
python scripts/map_to_slides.py template.md output/architecture_diagram.md output/

# Step 3: Generate PowerPoint
python scripts/generate_pptx.py output/slide_structure.json output/
```

## Dependencies

- Python 3.8+
- Node.js (for html2pptx)
- Required packages: See SKILL.md for full list

## Testing

Test with provided template:
```bash
python scripts/template2slide.py ../AVA_Project_Nas_Ltd_template.md test_output/
```

## Documentation

- **SKILL.md**: Complete skill documentation with detailed instructions
- **SLIDE_TEMPLATE.md**: Slide structure and mapping rules
- **deployment_method_selection_logic.md**: Architecture deployment logic

## Support

For issues or questions, refer to:
- SKILL.md troubleshooting section
- Individual script documentation
- KB "DOCUMENT" dataset for examples
