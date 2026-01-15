# Troubleshooting: Lỗi khi chạy trên Code Server

## Tổng quan

Khi chạy các script Node.js (đặc biệt là `generate_from_json.js`) trên code-server, thường gặp các lỗi liên quan đến:
1. **Playwright** - Browser automation cần system dependencies
2. **Sharp** - Image processing cần native libraries
3. **Permissions** - File system và execution permissions

---

## 1. Lỗi Playwright (Browser Dependencies)

### Lỗi thường gặp:
```
Error: Executable doesn't exist at /path/to/playwright/.local-browsers
Error: browserType.launch: Executable doesn't exist
Error: Failed to launch browser
```

### Nguyên nhân:
Playwright cần download browsers và system dependencies để chạy Chromium/Chrome.

### Cách fix:

#### Option 1: Install Playwright browsers (Recommended)
```bash
cd /home/tth193/Documents/00_slide_proposal/template2slide/scripts
npx playwright install chromium
npx playwright install-deps chromium
```

#### Option 2: Install system dependencies manually (Ubuntu/Debian)
```bash
# Install system dependencies cho Playwright
sudo apt-get update
sudo apt-get install -y \
  libnss3 \
  libnspr4 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libdbus-1-3 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  libpango-1.0-0 \
  libatk-1.0-0 \
  libcairo-gobject2 \
  libgtk-3-0 \
  libgdk-pixbuf2.0-0
```

#### Option 3: Use system Chrome/Chromium (if available)
```bash
# Check if Chrome is available
which google-chrome || which chromium-browser

# Playwright sẽ tự động detect nếu được cấu hình đúng
```

---

## 2. Lỗi Sharp (Native Library)

### Lỗi thường gặp:
```
Error: Something went wrong installing the "sharp" module
Error: libvips.so.XX: cannot open shared object file
Error: ELF class: ELFCLASS64
```

### Nguyên nhân:
Sharp cần native binary phù hợp với platform và architecture.

### Cách fix:

#### Option 1: Rebuild Sharp (Recommended)
```bash
cd /home/tth193/Documents/00_slide_proposal/template2slide/scripts
npm rebuild sharp
```

#### Option 2: Reinstall Sharp
```bash
cd /home/tth193/Documents/00_slide_proposal/template2slide/scripts
npm uninstall sharp
npm install sharp
```

#### Option 3: Install system dependencies cho Sharp
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
  libvips-dev \
  libvips-tools \
  libvips42

# Hoặc chỉ cần libvips runtime
sudo apt-get install -y libvips42
```

---

## 3. Lỗi Permission (File System)

### Lỗi thường gặp:
```
Error: EACCES: permission denied
Error: ENOENT: no such file or directory
```

### Nguyên nhân:
Code-server chạy với user khác hoặc không có quyền write vào thư mục.

### Cách fix:

#### Option 1: Check và fix permissions
```bash
# Check ownership
ls -la /home/tth193/Documents/00_slide_proposal/template2slide/scripts

# Fix ownership (nếu cần)
sudo chown -R $USER:$USER /home/tth193/Documents/00_slide_proposal

# Fix permissions
chmod -R u+w /home/tth193/Documents/00_slide_proposal
```

#### Option 2: Check write permissions cho output directory
```bash
# Tạo output directory với permissions đúng
mkdir -p /home/tth193/Documents/00_slide_proposal/output
chmod 755 /home/tth193/Documents/00_slide_proposal/output
```

---

## 4. Lỗi Node.js Module Not Found

### Lỗi thường gặp:
```
Error: Cannot find module 'playwright'
Error: Cannot find module 'pptxgenjs'
Error: Cannot find module 'sharp'
```

### Nguyên nhân:
Node modules chưa được cài đặt hoặc cài đặt sai thư mục.

### Cách fix:

#### Reinstall dependencies
```bash
cd /home/tth193/Documents/00_slide_proposal/template2slide/scripts

# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 5. Lỗi Display/Headless Mode

### Lỗi thường gặp:
```
Error: No display specified
Error: Unable to open X display
```

### Nguyên nhân:
Playwright cần chạy ở headless mode khi không có display (như code-server).

### Cách fix:
Script `generate_from_json.js` và `html2pptx.js` đã được cấu hình để chạy headless. Nếu vẫn lỗi, thêm environment variable:

```bash
export DISPLAY=:99  # Hoặc không set nếu đã headless
# Hoặc
export HEADLESS=true
```

Playwright mặc định chạy headless mode nên không cần config thêm.

---

## 6. Lỗi Memory/Resource Limits

### Lỗi thường gặp:
```
Error: JavaScript heap out of memory
Error: spawn ENOMEM
```

### Nguyên nhân:
Code-server có thể có memory limits hoặc process bị kill bởi OOM killer.

### Cách fix:

#### Increase Node.js memory limit
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
node generate_from_json.js <input_file>
```

Hoặc khi chạy:
```bash
node --max-old-space-size=4096 generate_from_json.js <input_file>
```

---

## Quick Fix Checklist

Khi gặp lỗi, chạy các lệnh sau theo thứ tự:

```bash
# 1. Navigate to scripts directory
cd /home/tth193/Documents/00_slide_proposal/template2slide/scripts

# 2. Reinstall Node.js dependencies
npm install

# 3. Install Playwright browsers
npx playwright install chromium

# 4. Install Playwright system dependencies
npx playwright install-deps chromium

# 5. Rebuild Sharp
npm rebuild sharp

# 6. Test với một file JSON nhỏ
node generate_from_json.js <test_file.json>
```

---

## Common Error Messages và Solutions

### "Executable doesn't exist at /path/to/playwright"
```bash
npx playwright install chromium
```

### "libvips.so.XX: cannot open shared object file"
```bash
npm rebuild sharp
# Hoặc
sudo apt-get install libvips42
```

### "EACCES: permission denied"
```bash
sudo chown -R $USER:$USER /home/tth193/Documents/00_slide_proposal
chmod -R u+w /home/tth193/Documents/00_slide_proposal
```

### "Cannot find module 'xxx'"
```bash
cd /home/tth193/Documents/00_slide_proposal/template2slide/scripts
npm install
```

### "JavaScript heap out of memory"
```bash
node --max-old-space-size=4096 generate_from_json.js <input_file>
```

---

## Test Installation

Sau khi fix, test với:

```bash
cd /home/tth193/Documents/00_slide_proposal/template2slide/scripts

# Test Playwright
node -e "const { chromium } = require('playwright'); (async () => { const browser = await chromium.launch(); await browser.close(); console.log('Playwright OK'); })();"

# Test Sharp
node -e "const sharp = require('sharp'); console.log('Sharp OK');"

# Test pptxgenjs
node -e "const pptxgen = require('pptxgenjs'); console.log('pptxgenjs OK');"
```

---

## Liên hệ / Báo lỗi

Nếu vẫn gặp lỗi sau khi thử các cách trên, cung cấp:
1. **Error message đầy đủ** (copy từ terminal)
2. **Node.js version**: `node --version`
3. **npm version**: `npm --version`
4. **OS version**: `uname -a` hoặc `cat /etc/os-release`
5. **Command đã chạy**: Copy exact command
6. **Output của test commands** ở trên








