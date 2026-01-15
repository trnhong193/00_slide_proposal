# Quick Start Guide

## Environment Setup ✅

Your environment has been set up successfully! All dependencies are installed.

## Running the Script

### Full Pipeline (Recommended)

Run the complete pipeline from template to PowerPoint:

```bash
cd /home/tth193/Documents/00_slide_proposal
python template2slide/scripts/template2slide.py <template_file.md> [output_dir]
```

**Example:**
```bash
python template2slide/scripts/template2slide.py Leda_Inio_template.md output/
```

### Step-by-Step (Manual)

If you need to run steps individually:

#### Step 1: Generate Architecture Diagram
```bash
python template2slide/scripts/generate_from_deal_transfer.py <template.md> <output_dir>/
```

#### Step 2: Map Template to Slide Structure
```bash
python template2slide/scripts/map_to_slides.py <template.md> <output_dir>/<Project_Name>_architecture_diagram.md <output_dir>/
```

#### Step 3: Generate PowerPoint from JSON
```bash
node template2slide/scripts/generate_from_json.js <output_dir>/<Project_Name>_slide_structure.json
```

**Note:** The script automatically detects the output directory from the JSON file path.

## Input Requirements

- **Template file must be placeholder-free** (no `[NETWORK_001]`, `[TIMELINE_001]`, etc.)
- Template should contain all required sections:
  - Cover Page
  - Project Requirement Statement
  - Scope of Work
  - System Architecture
  - System Requirements
  - Implementation Plan
  - Proposed Modules

## Output Files

After running the pipeline, you'll find in the output directory:

1. `[Project_Name]_architecture_diagram.md` - Mermaid diagram
2. `[Project_Name]_project_info.json` - Project metadata
3. `[Project_Name]_slide_structure.json` - Slide definitions
4. `[Project_Name]_proposal.pptx` - Final PowerPoint presentation
5. `[Project_Name]_output/` - Directory containing:
   - `html/` - HTML files for each slide (for debugging)
   - `assets/` - Downloaded images, videos, and rendered diagrams

## Troubleshooting

### If `generate_from_json.js` fails:

1. **Check Playwright installation:**
   ```bash
   cd template2slide/scripts
   npx playwright install chromium
   ```

2. **Verify Node.js dependencies:**
   ```bash
   cd template2slide/scripts
   npm list playwright pptxgenjs sharp
   ```

3. **Reinstall if needed:**
   ```bash
   cd template2slide/scripts
   rm -rf node_modules package-lock.json
   npm install
   npx playwright install chromium
   ```

### Common Issues

- **"Cannot find module './lib/inprocess'"**: Reinstall Playwright (see above)
- **"Browser has not been found"**: Run `npx playwright install chromium`
- **Python import errors**: Run `pip install -r requirements.txt`

## Next Steps

1. Ensure your template is placeholder-free
2. Run the pipeline with your template file
3. Check the generated `.pptx` file in the output directory

For detailed documentation, see:
- `SETUP.md` - Complete setup instructions
- `README.md` - Overview and features
- `SKILL.md` - Detailed skill documentation


