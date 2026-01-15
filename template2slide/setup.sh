#!/bin/bash
# Setup script for template2slide first-time installation

set -e  # Exit on error

echo "=========================================="
echo "Template2Slide Setup Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Project root: $PROJECT_ROOT"
echo "Scripts directory: $SCRIPT_DIR/scripts"
echo ""

# Step 1: Check prerequisites
echo "Step 1: Checking prerequisites..."
echo "-----------------------------------"

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓${NC} Python found: $PYTHON_VERSION"
else
    echo -e "${RED}✗${NC} Python 3 not found. Please install Python 3.8+"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js found: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 14+"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm found: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found. Please install npm"
    exit 1
fi

echo ""

# Step 2: Install Python dependencies
echo "Step 2: Installing Python dependencies..."
echo "-----------------------------------"
cd "$PROJECT_ROOT"

if [ -f "requirements.txt" ]; then
    echo "Installing from requirements.txt..."
    pip3 install -r requirements.txt
    echo -e "${GREEN}✓${NC} Python dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} requirements.txt not found. Skipping Python dependencies."
fi

echo ""

# Step 3: Install Node.js dependencies
echo "Step 3: Installing Node.js dependencies..."
echo "-----------------------------------"
cd "$SCRIPT_DIR/scripts"

if [ -f "package.json" ]; then
    echo "Cleaning existing node_modules (if any)..."
    if [ -d "node_modules" ]; then
        echo "Removing old node_modules..."
        rm -rf node_modules
    fi
    
    if [ -f "package-lock.json" ]; then
        echo "Removing old package-lock.json..."
        rm -f package-lock.json
    fi
    
    echo "Installing npm packages..."
    npm install
    
    echo -e "${GREEN}✓${NC} Node.js dependencies installed"
else
    echo -e "${RED}✗${NC} package.json not found in scripts directory"
    exit 1
fi

echo ""

# Step 4: Install Playwright browsers
echo "Step 4: Installing Playwright browsers..."
echo "-----------------------------------"
echo "This may take a few minutes..."
npx playwright install chromium

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Playwright Chromium installed"
else
    echo -e "${YELLOW}⚠${NC} Playwright installation had issues. You may need to run manually:"
    echo "  cd $SCRIPT_DIR/scripts && npx playwright install chromium"
fi

echo ""

# Step 5: Verify installation
echo "Step 5: Verifying installation..."
echo "-----------------------------------"

# Test Python
echo -n "Testing Python dependencies... "
if python3 -c "import pptx; import PIL; print('OK')" 2>/dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC} Some Python packages may be missing"
fi

# Test Node.js
echo -n "Testing Node.js dependencies... "
cd "$SCRIPT_DIR/scripts"
if node -e "require('playwright'); require('pptxgenjs'); require('sharp'); console.log('OK')" 2>/dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC} Node.js dependencies test failed"
    exit 1
fi

# Test Playwright
echo -n "Testing Playwright... "
if npx playwright --version &>/dev/null; then
    PLAYWRIGHT_VERSION=$(npx playwright --version)
    echo -e "${GREEN}✓${NC} $PLAYWRIGHT_VERSION"
else
    echo -e "${YELLOW}⚠${NC} Playwright version check failed"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "You can now run the template2slide pipeline:"
echo ""
echo "  python $SCRIPT_DIR/scripts/template2slide.py <template_file.md> [output_dir]"
echo ""
echo "For more information, see SETUP.md"


