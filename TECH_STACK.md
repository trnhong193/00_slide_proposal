# Technology Stack: Deal Transfer to Slides Flow

## Overview

The pipeline uses a **hybrid Python + Node.js** stack with specialized libraries for Excel processing, diagram generation, and PowerPoint creation.

---

## Core Technologies

### Programming Languages
- **Python 3.8+** - Primary language for data extraction, template generation, and orchestration
- **Node.js** - For PowerPoint generation and HTML rendering
- **JavaScript** - Slide rendering and HTML-to-PPTX conversion

---

## Stage 1: dealtransfer2template

### Python Libraries

#### Excel Processing
- **pandas** (≥2.0.0) - Excel file reading and data manipulation
  - Used for: Reading S1 (Commercial) and S2 (Technical) sheets
  - Function: `pd.read_excel()`, `pd.ExcelFile()`
- **openpyxl** (≥3.1.0) - Excel file format support (required by pandas)
  - Used for: `.xlsx` file format parsing

#### Data Processing
- **Standard Library**:
  - `json` - JSON serialization/deserialization
  - `pathlib` - File path handling
  - `re` - Regular expressions for text parsing

### Scripts
- `extract_deal_transfer.py` - Extracts data from Deal Transfer Excel files
- `validate_output.py` - Validates generated proposal format

---

## Stage 2: template2slide

### Python Libraries

#### PowerPoint Manipulation
- **python-pptx** (≥0.6.21) - PowerPoint file creation and editing
  - Used for: Direct PPTX manipulation (if needed)
  - Note: Primary conversion uses Node.js html2pptx workflow

#### Image Processing
- **Pillow** (≥10.0.0) - Image manipulation and processing
  - Used for: Image resizing, format conversion, validation

#### XML Processing
- **lxml** (≥4.9.0) - XML/HTML parsing and processing
  - Used for: OOXML structure manipulation
- **defusedxml** (≥0.7.1) - Secure XML parsing
  - Used for: Safe XML parsing to prevent XML attacks

#### Utilities
- **six** (≥1.16.0) - Python 2/3 compatibility (required by python-pptx)

### Node.js Libraries

#### PowerPoint Generation
- **pptxgenjs** (^4.0.1) - PowerPoint presentation generation from JavaScript
  - Used for: Creating PPTX files from structured data
  - Features: Slide creation, text formatting, image insertion, shapes

#### Browser Automation & Media Download
- **playwright** (^1.57.0) - Headless browser automation
  - Used for: Downloading images/videos from Google Drive URLs
  - Handles: Google Drive download confirmation pages, authentication
  - Features: Page navigation, file downloads, screenshot capture

#### Image Processing
- **sharp** (^0.34.5) - High-performance image processing
  - Used for: Image resizing, format conversion, optimization
  - Features: PNG/JPEG processing, thumbnail generation, format validation

### Diagram Generation

#### Mermaid
- **Mermaid** - Text-based diagram generation
  - Used for: System architecture diagrams
  - Format: Mermaid syntax (text-based)
  - Conversion: Mermaid → PNG (via mermaid-cli or online service)
- **mermaid-cli** (optional) - Command-line Mermaid renderer
  - Used for: Converting Mermaid code to PNG images
  - Alternative: Online service (mermaid.live) if CLI not available

### HTML/CSS Rendering

#### HTML Generation
- **Custom JavaScript renderers** - Per-slide-type HTML generation
  - Located in: `template2slide/scripts/renderers/`
  - Types: `title.js`, `content_bullets.js`, `two_column.js`, `module_description.js`, `timeline.js`, `diagram.js`
  - Features: Dark theme, viAct blue accent colors, responsive layouts

#### CSS Features Used
- **Flexbox** - Layout and positioning
- **CSS Colors** - Hex color codes (`#00AEEF` for viAct blue)
- **Web-safe fonts** - Arial, Helvetica, Times New Roman
- **Text styling** - Bold, italic, underline via inline tags
- **Shape styling** - Backgrounds, borders, shadows on `<div>` elements

### File Formats

#### Input Formats
- **Markdown (.md)** - Proposal template format
- **JSON** - Slide structure, project info
- **Excel (.xlsx)** - Deal Transfer files

#### Output Formats
- **PowerPoint (.pptx)** - Final presentation (Office Open XML format)
- **PNG** - Diagram images, module images
- **MP4/MOV** - Module demonstration videos (optional)

#### Intermediate Formats
- **HTML** - Slide rendering (temporary, for layout calculation)
- **Mermaid** - Architecture diagrams (text-based)
- **JSON** - Data structures (project info, slide structure)

---

## Architecture & Workflow

### Data Flow Technologies

```
Excel (.xlsx)
    ↓ [pandas + openpyxl]
Python Dict/JSON
    ↓ [Python string processing]
Markdown Template
    ↓ [Python parsing]
JSON Slide Structure
    ↓ [JavaScript renderers]
HTML Slides
    ↓ [playwright + sharp]
Downloaded Assets (images/videos)
    ↓ [pptxgenjs]
PowerPoint (.pptx)
```

### Key Processing Steps

1. **Excel Extraction** (Python)
   - pandas reads Excel sheets
   - Data converted to Python dictionaries
   - Field mapping using `FIELD_NAMES_REFERENCE.md`

2. **Template Generation** (Python)
   - String formatting and template filling
   - Markdown generation
   - Placeholder ID creation

3. **Architecture Diagram** (Python)
   - Mermaid code generation
   - Deployment method logic
   - Diagram structure matching KB examples

4. **Slide Mapping** (Python)
   - Template parsing
   - Content extraction
   - JSON structure creation

5. **Media Download** (Node.js)
   - Playwright handles Google Drive URLs
   - Sharp validates and processes images
   - File type validation (magic bytes)

6. **HTML Rendering** (Node.js)
   - Per-slide-type renderers
   - CSS styling (dark theme)
   - Layout calculation

7. **PowerPoint Generation** (Node.js)
   - pptxgenjs creates PPTX
   - Image insertion
   - Text formatting
   - Shape creation

---

## Development Tools

### Code Organization
- **Modular scripts** - Separate Python modules per function
- **Renderers** - JavaScript modules per slide type
- **Configuration files** - Markdown documentation for rules/logic

### Validation & Testing
- **Python scripts** - Output validation
- **JSON schema** - Structure validation
- **File format checks** - Magic byte validation for images/videos

---

## Dependencies Summary

### Python (requirements.txt)
```python
pandas>=2.0.0
openpyxl>=3.1.0
python-pptx>=0.6.21
Pillow>=10.0.0
lxml>=4.9.0
defusedxml>=0.7.1
six>=1.16.0
```

### Node.js (package.json)
```json
{
  "playwright": "^1.57.0",
  "pptxgenjs": "^4.0.1",
  "sharp": "^0.34.5"
}
```

### Optional
- **mermaid-cli** - For local Mermaid diagram rendering
  - Install: `npm install -g @mermaid-js/mermaid-cli`
  - Alternative: Use online service (mermaid.live)

---

## Platform Requirements

### Operating System
- **Linux** (tested on Ubuntu/Debian)
- **macOS** (should work)
- **Windows** (should work with WSL or native)

### Runtime Requirements
- **Python 3.8+** with pip
- **Node.js** (v14+) with npm
- **System libraries** for image processing (libvips for Sharp)

### Installation

```bash
# Python dependencies
pip install -r requirements.txt

# Node.js dependencies
cd template2slide/scripts
npm install

# Optional: Mermaid CLI
npm install -g @mermaid-js/mermaid-cli
```

---

## Technology Choices Rationale

### Why Python for Stage 1?
- **Excel processing**: pandas is the industry standard
- **Text processing**: Excellent string manipulation and regex
- **Template generation**: Easy markdown/string formatting

### Why Node.js for Stage 2?
- **PowerPoint generation**: pptxgenjs is mature and feature-rich
- **Browser automation**: Playwright handles Google Drive downloads better than Python alternatives
- **Image processing**: Sharp is faster than Python PIL for bulk operations
- **HTML rendering**: JavaScript is natural for DOM manipulation

### Why Mermaid for Diagrams?
- **Text-based**: Version control friendly, easy to edit
- **Client-friendly**: Clean, professional output
- **Flexible**: Supports various diagram types (flowcharts, architecture)

### Why HTML as Intermediate Format?
- **Layout calculation**: Browser rendering provides accurate positioning
- **CSS flexibility**: Easy styling and responsive layouts
- **Debugging**: Can view HTML files directly in browser

---

## Performance Considerations

- **Parallel processing**: Media downloads can be parallelized
- **Image optimization**: Sharp handles large images efficiently
- **Caching**: Downloaded assets cached in `assets/` folder
- **Memory management**: Large presentations handled incrementally

---

## Security Considerations

- **XML parsing**: defusedxml prevents XML attacks
- **File validation**: Magic byte checking prevents malicious files
- **URL validation**: Google Drive URLs validated before download
- **Path sanitization**: File paths sanitized to prevent directory traversal


