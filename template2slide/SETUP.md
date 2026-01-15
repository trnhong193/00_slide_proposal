# First-Time Setup Guide

This guide will help you set up the environment to run `template2slide` for the first time.

## Prerequisites

- **Python 3.8+** (check with `python3 --version`)
- **Node.js 14+** (check with `node --version`)
- **npm** (comes with Node.js, check with `npm --version`)

## Quick Setup

Run the setup script:

```bash
cd /home/tth193/Documents/00_slide_proposal/template2slide
bash setup.sh
```

Or follow the manual steps below.

## Manual Setup Steps

### Step 1: Install Python Dependencies

From the project root (`/home/tth193/Documents/00_slide_proposal`):

```bash
pip install -r requirements.txt
```

Or if you prefer using a virtual environment (recommended):

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Install Node.js Dependencies

Navigate to the scripts directory and install npm packages:

```bash
cd template2slide/scripts
npm install
```

This will install:
- `playwright` (^1.57.0) - For HTML rendering and Google Drive downloads
- `pptxgenjs` (^4.0.1) - For PowerPoint generation
- `sharp` (^0.34.5) - For image processing

### Step 3: Install Playwright Browsers

After installing npm packages, install the Chromium browser for Playwright:

```bash
npx playwright install chromium
```

**Note**: If you encounter issues with Playwright installation, you can try:
```bash
# Remove existing node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npx playwright install chromium
```

### Step 4: Verify Installation

Test that everything is working:

```bash
# Test Python dependencies
python3 -c "import pptx; print('Python dependencies OK')"

# Test Node.js dependencies
node -e "console.log(require('playwright'))"
node -e "console.log(require('pptxgenjs'))"
node -e "console.log(require('sharp'))"

# Test Playwright browser
npx playwright --version
```

## Troubleshooting

### Playwright Installation Issues

If you see errors like:
- `Cannot find module './lib/inprocess'`
- `Error: Browser has not been found`

Try these solutions:

1. **Clean reinstall**:
   ```bash
   cd template2slide/scripts
   rm -rf node_modules package-lock.json
   npm install
   npx playwright install chromium
   ```

2. **Install specific Playwright version**:
   ```bash
   npm install playwright@1.57.0
   npx playwright install chromium
   ```

3. **Check Node.js version**:
   ```bash
   node --version  # Should be 14+
   ```

### Python Import Errors

If you see `ModuleNotFoundError`:

1. **Check if virtual environment is activated**:
   ```bash
   which python3  # Should point to venv/bin/python3 if using venv
   ```

2. **Reinstall requirements**:
   ```bash
   pip install --upgrade -r requirements.txt
   ```

### Permission Issues

If you encounter permission errors:

```bash
# For npm (if needed)
sudo npm install -g npm  # Update npm globally

# For pip (if needed)
pip install --user -r requirements.txt
```

## Running the Script

Once setup is complete, you can run the full pipeline:

```bash
# From project root
cd /home/tth193/Documents/00_slide_proposal

# Run the complete pipeline
python template2slide/scripts/template2slide.py <template_file.md> [output_dir]

# Or run step-by-step:
# Step 1: Generate architecture
python template2slide/scripts/generate_from_deal_transfer.py template.md output/

# Step 2: Map to slides
python template2slide/scripts/map_to_slides.py template.md output/[Project_Name]_architecture_diagram.md output/

# Step 3: Generate PowerPoint (requires Node.js)
node template2slide/scripts/generate_from_json.js output/[Project_Name]_slide_structure.json
```

## Next Steps

After successful setup:
1. Ensure your template file is **placeholder-free** (no `[NETWORK_001]`, etc.)
2. Run the pipeline with your template file
3. Check the output directory for generated `.pptx` file

For more details, see:
- `README.md` - Overview and usage
- `SKILL.md` - Detailed skill documentation
- `instruction.md` - Slide rendering standards


