#!/usr/bin/env node
/**
 * Generate PowerPoint presentation from JSON slide definitions
 * 
 * Usage:
 *   node scripts/generate_from_json.js <input_json_file>
 * 
 * Output:
 *   - <input_name>_output.pptx
 *   - <input_name>_html/ (directory with HTML files for each slide)
 *   - <input_name>_assets/ (directory with downloaded images and rendered diagrams)
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const pptxgen = require('pptxgenjs');
const html2pptx = require('./html2pptx.js');
const sharp = require('sharp');
const https = require('https');
const http = require('http');

// Configuration
const SLIDE_WIDTH = 720; // pt
const SLIDE_HEIGHT = 405; // pt (16:9)
const ACCENT_COLOR = '#00AEEF'; // viAct Blue
const TEXT_COLOR = '#FFFFFF'; // White
const BACKGROUND_IMAGE = path.join(__dirname, 'background.png');

// Helper: Extract file ID from Google Drive URL
function extractGoogleDriveId(url) {
  if (!url) return null;
  
  // Pattern 1: https://drive.google.com/file/d/ID/view
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return match[1];
  }
  
  // Pattern 2: https://drive.google.com/open?id=ID
  try {
    const urlObj = new URL(url);
    if (urlObj.pathname.includes('open')) {
      const id = urlObj.searchParams.get('id');
      if (id) return id;
    }
  } catch (e) {
    // Invalid URL
  }
  
  return null;
}

// Get Google Drive download URL from file ID
function getGoogleDriveDownloadUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

// Get Google Drive video streaming URL (alternative for videos)
function getGoogleDriveVideoUrl(fileId) {
  // Try different formats for video access
  return `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
}

// Validate file type by checking magic bytes
async function validateFileType(filePath, expectedType) {
  try {
    const stats = await fs.promises.stat(filePath);
    if (stats.size < 4) {
      return false; // File too small
    }
    
    // Read enough bytes to check magic numbers
    const buffer = await fs.promises.readFile(filePath, { start: 0, end: Math.min(100, stats.size - 1) });
    
    if (expectedType === 'video') {
      // Check for PNG first (89 50 4E 47) - common false positive
      if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        return false; // This is a PNG, not a video
      }
      
      // Check for HTML (<!DOCTYPE or <html) - common false positive
      const text = buffer.toString('utf-8', 0, Math.min(100, buffer.length)).toLowerCase();
      if (text.includes('<!doctype') || text.includes('<html')) {
        return false; // This is HTML, not a video
      }
      
      // Check for MP4 magic bytes
      // MP4 files start with: 00 00 00 XX 66 74 79 70 (ftyp box)
      // Bytes 4-7 should be "ftyp" (0x66 0x74 0x79 0x70)
      if (buffer.length >= 8 && buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
        return true; // Valid MP4/MOV file (ftyp box found)
      }
      
      return false; // Not a valid video format
    } else if (expectedType === 'image') {
      // Check for common image formats
      // PNG: 89 50 4E 47
      const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
      // JPEG: FF D8 FF
      const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
      // GIF: 47 49 46 38
      const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
      
      if (isPng || isJpeg || isGif) {
        return true;
      }
      
      return false;
    }
    
    return true; // Unknown type, assume valid
  } catch (error) {
    console.warn(`Failed to validate file type: ${error.message}`);
    return false;
  }
}

// Download file using HTTP/HTTPS directly (with redirects)
// Improved to properly handle redirects like Python's allow_redirects=True
function downloadFileDirect(url, outputPath, followRedirects = true, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) {
      reject(new Error('Too many redirects'));
      return;
    }
    
    const protocol = url.startsWith('https') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    const request = protocol.get(url, options, (response) => {
      // Handle redirects (301, 302, 303, 307, 308)
      if (followRedirects && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        request.destroy();
        const redirectUrl = response.headers.location.startsWith('http') 
          ? response.headers.location 
          : new URL(response.headers.location, url).href;
        // Recursively follow redirect
        return downloadFileDirect(redirectUrl, outputPath, true, maxRedirects - 1)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(outputPath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(outputPath);
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(outputPath, () => {});
        reject(err);
      });
    });
    
    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Fetch response as buffer (for checking content type and parsing HTML)
async function fetchResponse(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    const request = protocol.get(url, options, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        request.destroy();
        const redirectUrl = response.headers.location.startsWith('http') 
          ? response.headers.location 
          : new URL(response.headers.location, url).href;
        return fetchResponse(redirectUrl).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          body: Buffer.concat(chunks)
        });
      });
    });
    
    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Download Google Drive file with HTML token parsing (similar to Python approach)
async function downloadGoogleDriveFile(fileId, outputPath, isVideo = false) {
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  
  try {
    // Step 1: Try direct download with redirects (like Python's allow_redirects=True)
    try {
      await downloadFileDirect(downloadUrl, outputPath, true);
      const stats = await fs.promises.stat(outputPath);
      // Check if file is valid (at least 1KB for real files, HTML warnings are usually smaller)
      if (stats.size > 1000) {
        // Validate file type using magic bytes
        const isValid = await validateFileType(outputPath, isVideo ? 'video' : 'image');
        if (isValid) {
          return outputPath; // Valid file
        } else {
          console.warn(`Downloaded file is not a valid ${isVideo ? 'video' : 'image'} (wrong file type). Deleting...`);
          await fs.promises.unlink(outputPath).catch(() => {});
        }
      }
    } catch (e) {
      // Direct download failed, continue to token extraction
    }
    
    // Step 2: Fetch response to check if it's HTML (virus scan warning)
    try {
      const response = await fetchResponse(downloadUrl);
      const contentType = (response.headers['content-type'] || '').toLowerCase();
      
      if (contentType.includes('text/html') || response.body.toString('utf-8', 0, 100).toLowerCase().includes('<!doctype')) {
        // It's HTML, parse for confirmation token (like Python script)
        const htmlContent = response.body.toString('utf-8');
        
        // Extract confirmation token: confirm=([a-zA-Z0-9_-]+)
        const confirmMatch = htmlContent.match(/confirm=([a-zA-Z0-9_-]+)/);
        
        if (confirmMatch) {
          // Use extracted token
          const confirmToken = confirmMatch[1];
          const tokenUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirmToken}`;
          try {
            await downloadFileDirect(tokenUrl, outputPath, true);
            const stats = await fs.promises.stat(outputPath);
            if (stats.size > 1000) {
              const isValid = await validateFileType(outputPath, isVideo ? 'video' : 'image');
              if (isValid) {
                return outputPath;
              } else {
                console.warn(`Downloaded file is not a valid ${isVideo ? 'video' : 'image'} (wrong file type). Deleting...`);
                await fs.promises.unlink(outputPath).catch(() => {});
              }
            }
          } catch (e) {
            // Token URL failed, try confirm=t
          }
        }
        
        // Step 3: Try confirm=t as fallback (like Python script)
        const confirmTUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
        try {
          await downloadFileDirect(confirmTUrl, outputPath, true);
          const stats = await fs.promises.stat(outputPath);
          if (stats.size > 1000) {
            // Validate file type using magic bytes
            const isValid = await validateFileType(outputPath, isVideo ? 'video' : 'image');
            if (isValid) {
              return outputPath;
            } else {
              console.warn(`Downloaded file is not a valid ${isVideo ? 'video' : 'image'} (wrong file type). Deleting...`);
              await fs.promises.unlink(outputPath).catch(() => {});
            }
          }
        } catch (e) {
          // confirm=t also failed
        }
      } else {
        // Not HTML, might be a direct file - try to save it
        if (response.body.length > 1000) {
          await fs.promises.writeFile(outputPath, response.body);
          const isValid = await validateFileType(outputPath, isVideo ? 'video' : 'image');
          if (isValid) {
            return outputPath;
          } else {
            console.warn(`Downloaded file is not a valid ${isVideo ? 'video' : 'image'} (wrong file type). Deleting...`);
            await fs.promises.unlink(outputPath).catch(() => {});
          }
        }
      }
    } catch (e) {
      // Fetch failed
    }
  } catch (error) {
    // All methods failed
  }
  
  return null;
}

// Download file (image or video) from URL (handles Google Drive)
// Improved to use Python-style approach: direct download with token parsing first, Playwright as fallback
async function downloadFile(url, outputPath, browser, context, isVideo = false) {
  if (!url || url.trim() === '') {
    return null;
  }

  try {
    const fileId = extractGoogleDriveId(url);
    if (fileId) {
      // Step 1: Try Python-style Google Drive download (improved approach)
      // This handles redirects properly and parses HTML for confirmation tokens
      const result = await downloadGoogleDriveFile(fileId, outputPath, isVideo);
      if (result) {
        return result;
      }
      
      // Step 2: For images, try view URL as alternative
      if (!isVideo) {
        try {
          const viewUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
          await downloadFileDirect(viewUrl, outputPath, true);
          const stats = await fs.promises.stat(outputPath);
          if (stats.size > 1000) {
            return outputPath;
          }
          await fs.promises.unlink(outputPath).catch(() => {});
        } catch (e) {
          // View URL failed, continue to Playwright fallback
        }
      }
      
      // Fallback to Playwright if direct download fails
      const page = await context.newPage();
      try {
        const downloadUrl = getGoogleDriveDownloadUrl(fileId);
        
        // Set up download listener BEFORE navigation
        const downloadPromise = page.waitForEvent('download', { timeout: 60000 }).catch(() => null);
        
        // Navigate and wait for download or page load
        await Promise.race([
          page.goto(downloadUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }),
          downloadPromise.then(() => null) // If download starts immediately, don't wait for page
        ]);
        
        // Wait a bit for any redirects or download to start
        await page.waitForTimeout(3000);
        
        // Check if download already started
        let download = await downloadPromise;
        
        // For videos, wait longer and try alternative methods
        if (isVideo && !download) {
          // Wait a bit longer for video downloads
          await page.waitForTimeout(5000);
          download = await page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
        }
        
        // If no download yet, check if we got redirected to a confirmation page
        if (!download && (page.url().includes('confirm=') || page.url().includes('virusScanWarning') || page.url().includes('googleusercontent'))) {
          // Handle Google Drive virus scan warning or direct file access
          try {
            // For videos, try accessing the file directly if we got redirected to a googleusercontent URL
            if (isVideo && page.url().includes('googleusercontent')) {
              // We might already be at the video file URL
              try {
                const response = await page.goto(page.url(), { waitUntil: 'networkidle', timeout: 30000 });
                if (response && response.status() === 200) {
                  const buffer = await response.body();
                  if (buffer && buffer.length > 1000) {
                    await fs.promises.writeFile(outputPath, buffer);
                    const stats = await fs.promises.stat(outputPath);
                    if (stats.size > 1000) {
                      const isValid = await validateFileType(outputPath, isVideo ? 'video' : 'image');
                      if (isValid) {
                        return outputPath;
                      } else {
                        console.warn(`Downloaded file is not a valid ${isVideo ? 'video' : 'image'} (wrong file type). Deleting...`);
                        await fs.promises.unlink(outputPath).catch(() => {});
                      }
                    }
                  }
                }
              } catch (e) {
                // Continue to button clicking method
              }
            }
            
            // Try multiple selectors for the download button
            const selectors = [
              'button#uc-download-link',
              'a#uc-download-link',
              'button[aria-label*="Download"]',
              'a[aria-label*="Download"]',
              'form[action*="download"] button',
              'form[action*="download"] input[type="submit"]',
              'input[type="submit"][value*="Download"]'
            ];
            
            let clicked = false;
            for (const selector of selectors) {
              try {
                const button = await page.$(selector);
                if (button) {
                  // Set up download listener again before clicking
                  const newDownloadPromise = page.waitForEvent('download', { timeout: 60000 }).catch(() => null);
                  await button.click();
                  await page.waitForTimeout(2000);
                  download = await newDownloadPromise;
                  if (download) {
                    clicked = true;
                    break;
                  }
                }
              } catch (e) {
                // Try next selector
              }
            }
            
            if (!clicked && !download) {
              // Try clicking any button in the form
              const form = await page.$('form');
              if (form) {
                const submitButton = await form.$('button, input[type="submit"]');
                if (submitButton) {
                  const newDownloadPromise = page.waitForEvent('download', { timeout: 60000 }).catch(() => null);
                  await submitButton.click();
                  await page.waitForTimeout(2000);
                  download = await newDownloadPromise;
                }
              }
            }
          } catch (e) {
            console.warn(`Could not find download button: ${e.message}`);
          }
        }
        
        // If we got a download, save it
        if (download) {
          await download.saveAs(outputPath);
          // Verify file exists and is not empty
          const stats = await fs.promises.stat(outputPath).catch(() => null);
          if (stats && stats.size > 0) {
            const isValid = await validateFileType(outputPath, isVideo ? 'video' : 'image');
            if (isValid) {
              return outputPath;
            } else {
              console.warn(`Downloaded file is not a valid ${isVideo ? 'video' : 'image'} (wrong file type). Deleting...`);
              await fs.promises.unlink(outputPath).catch(() => {});
            }
          }
        }
      } finally {
        await page.close();
      }
    } else {
      // Regular URL - try direct download first
      try {
        await downloadFileDirect(url, outputPath, true);
        const stats = await fs.promises.stat(outputPath);
        if (stats.size > 0) {
          const isValid = await validateFileType(outputPath, isVideo ? 'video' : 'image');
          if (isValid) {
            return outputPath;
          }
        }
      } catch (e) {
        // Fallback to Playwright
        const page = await browser.newPage();
        try {
          const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
          if (response) {
            const buffer = await response.body();
            if (buffer && buffer.length > 0) {
              await fs.promises.writeFile(outputPath, buffer);
              const isValid = await validateFileType(outputPath, isVideo ? 'video' : 'image');
              if (isValid) {
                return outputPath;
              }
            }
          }
        } finally {
          await page.close();
        }
      }
    }
  } catch (error) {
    console.warn(`Failed to download ${isVideo ? 'video' : 'image'} from ${url}: ${error.message}`);
    return null;
  }
  
  return null;
}

// Download video from URL (handles Google Drive)
async function downloadVideo(url, outputPath, browser, context) {
  return downloadFile(url, outputPath, browser, context, true);
}

// Download image from URL (handles Google Drive)
// Keep this for backward compatibility, but now uses downloadFile internally
async function downloadImage(url, outputPath, browser, context) {
  if (!url || url.trim() === '') {
    return null;
  }

  try {
    const fileId = extractGoogleDriveId(url);
    if (fileId) {
      // Google Drive download logic (based on Python implementation)
      try {
        // Step 1: Try direct download URL
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        
        // First request without following redirects to check response
        try {
          await downloadFileDirect(downloadUrl, outputPath, false);
          const stats = await fs.promises.stat(outputPath);
          if (stats.size > 1000) { // Valid file (at least 1KB)
            return outputPath;
          }
        } catch (e) {
          // If we got a redirect (302/303), the file might be large
          // Try the view URL for images
        }
        
        // Step 2: Try view URL for images (alternative method)
        const viewUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        try {
          await downloadFileDirect(viewUrl, outputPath, true);
          const stats = await fs.promises.stat(outputPath);
          if (stats.size > 1000) { // Valid image (at least 1KB)
            return outputPath;
          }
        } catch (e) {
          // View URL also failed
        }
        
        // Step 3: Try download URL with redirects enabled
        try {
          await downloadFileDirect(downloadUrl, outputPath, true);
          const stats = await fs.promises.stat(outputPath);
          if (stats.size > 1000) {
            return outputPath;
          }
        } catch (e) {
          console.log(`Direct download failed, trying Playwright: ${e.message}`);
        }
      } catch (e) {
        console.log(`All direct download methods failed, trying Playwright: ${e.message}`);
      }
      
      // Fallback to Playwright if direct download fails
      const page = await context.newPage();
      try {
        const downloadUrl = getGoogleDriveDownloadUrl(fileId);
        
        // Set up download listener BEFORE navigation
        const downloadPromise = page.waitForEvent('download', { timeout: 60000 }).catch(() => null);
        
        // Navigate and wait for download or page load
        await Promise.race([
          page.goto(downloadUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }),
          downloadPromise.then(() => null) // If download starts immediately, don't wait for page
        ]);
        
        // Wait a bit for any redirects or download to start
        await page.waitForTimeout(3000);
        
        // Check if download already started
        let download = await downloadPromise;
        
        // If no download yet, check if we got redirected to a confirmation page
        if (!download && (page.url().includes('confirm=') || page.url().includes('virusScanWarning'))) {
          // Handle Google Drive virus scan warning
          try {
            // Try multiple selectors for the download button
            const selectors = [
              'button#uc-download-link',
              'a#uc-download-link',
              'button[aria-label*="Download"]',
              'a[aria-label*="Download"]',
              'form[action*="download"] button',
              'form[action*="download"] input[type="submit"]',
              'input[type="submit"][value*="Download"]'
            ];
            
            let clicked = false;
            for (const selector of selectors) {
              try {
                const button = await page.$(selector);
                if (button) {
                  // Set up download listener again before clicking
                  const newDownloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
                  await button.click();
                  await page.waitForTimeout(2000);
                  download = await newDownloadPromise;
                  if (download) {
                    clicked = true;
                    break;
                  }
                }
              } catch (e) {
                // Try next selector
              }
            }
            
            if (!clicked && !download) {
              // Try clicking any button in the form
              const form = await page.$('form');
              if (form) {
                const submitButton = await form.$('button, input[type="submit"]');
                if (submitButton) {
                  const newDownloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
                  await submitButton.click();
                  await page.waitForTimeout(2000);
                  download = await newDownloadPromise;
                }
              }
            }
          } catch (e) {
            console.warn(`Could not find download button: ${e.message}`);
          }
        }
        
        // If we got a download, save it
        if (download) {
          await download.saveAs(outputPath);
          // Verify file exists and is not empty
          const stats = await fs.promises.stat(outputPath).catch(() => null);
          if (stats && stats.size > 0) {
            return outputPath;
          }
        }
        
        // Fallback: try direct download with response (bypass download dialog)
        try {
          const response = await page.goto(downloadUrl, { waitUntil: 'networkidle', timeout: 30000 });
          if (response) {
            const contentType = response.headers()['content-type'] || '';
            const status = response.status();
            
            if (status === 200 && (contentType.startsWith('image/') || contentType === 'application/octet-stream' || !contentType)) {
              const buffer = await response.body();
              if (buffer && buffer.length > 0) {
                await fs.promises.writeFile(outputPath, buffer);
                const stats = await fs.promises.stat(outputPath);
                if (stats.size > 0) {
                  return outputPath;
                }
              }
            }
          }
        } catch (e) {
          // Fallback failed, continue
        }
      } finally {
        await page.close();
      }
    } else {
      // Regular URL - try direct download first
      try {
        await downloadFileDirect(url, outputPath);
        const stats = await fs.promises.stat(outputPath);
        if (stats.size > 0) {
          return outputPath;
        }
      } catch (e) {
        // Fallback to Playwright
        const page = await browser.newPage();
        try {
          const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
          if (response) {
            const buffer = await response.body();
            if (buffer && buffer.length > 0) {
              await fs.promises.writeFile(outputPath, buffer);
              return outputPath;
            }
          }
        } finally {
          await page.close();
        }
      }
    }
  } catch (error) {
    console.warn(`Failed to download image from ${url}: ${error.message}`);
    return null;
  }
  
  return null;
}

// Render Mermaid diagram to PNG
async function renderMermaidDiagram(mermaidCode, outputPath) {
  try {
    // Use mermaid-cli if available, otherwise create a simple placeholder
    const { execSync } = require('child_process');
    
    // Try to use mmdc (mermaid-cli)
    try {
      const tempMmdFile = outputPath.replace('.png', '.mmd');
      await fs.promises.writeFile(tempMmdFile, mermaidCode);
      
      // Render with dark theme
      execSync(`mmdc -i "${tempMmdFile}" -o "${outputPath}" -b transparent -t dark`, {
        stdio: 'inherit'
      });
      
      await fs.promises.unlink(tempMmdFile);
      return outputPath;
    } catch (error) {
      console.warn(`mermaid-cli not available, creating placeholder: ${error.message}`);
      // Create a placeholder image
      const svg = `
        <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
          <rect width="800" height="600" fill="#1a1a1a"/>
          <text x="400" y="300" font-family="Arial" font-size="24" fill="#00AEEF" text-anchor="middle">
            Mermaid Diagram
          </text>
          <text x="400" y="330" font-family="Arial" font-size="14" fill="#FFFFFF" text-anchor="middle">
            (Install mermaid-cli: npm install -g @mermaid-js/mermaid-cli)
          </text>
        </svg>
      `;
      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);
      return outputPath;
    }
  } catch (error) {
    console.error(`Failed to render Mermaid diagram: ${error.message}`);
    return null;
  }
}

// Create placeholder image
async function createPlaceholderImage(text, outputPath) {
  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill="#1a1a1a" stroke="#00AEEF" stroke-width="2"/>
      <text x="400" y="280" font-family="Arial" font-size="32" fill="#00AEEF" text-anchor="middle" font-weight="bold">
        ${text}
      </text>
      <text x="400" y="320" font-family="Arial" font-size="18" fill="#FFFFFF" text-anchor="middle">
        Image Placeholder
      </text>
    </svg>
  `;
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
  return outputPath;
}

// Smart content aggregation: Merge consecutive System Requirements slides, split if too long
function aggregateSlides(slides) {
  const aggregated = [];
  let i = 0;
  
  // Thresholds for content length
  const MAX_ITEMS_PER_SLIDE = 15;  // Maximum items per slide before splitting
  const MIN_ITEMS_TO_MERGE = 5;    // Minimum items to consider merging
  
  while (i < slides.length) {
    const slide = slides[i];
    
    // Check if this is a System Requirements slide
    if (slide.type === 'content_bullets' && slide.title && 
        (slide.title.startsWith('System Requirements:') || slide.title === 'System Requirements')) {
      const systemReqSlides = [slide];
      const baseTitle = 'System Requirements';
      
      // Collect consecutive System Requirements slides
      while (i + 1 < slides.length) {
        const nextSlide = slides[i + 1];
        if (nextSlide.type === 'content_bullets' && 
            nextSlide.title && 
            (nextSlide.title.startsWith('System Requirements:') || nextSlide.title === 'System Requirements')) {
          systemReqSlides.push(nextSlide);
          i++;
        } else {
          break;
        }
      }
      
      // Filter out trivial slides
      const nonTrivialSlides = systemReqSlides.filter(s => {
        const content = s.content || [];
        const text = content.map(c => c.text || '').join(' ').toLowerCase();
        // Filter out slides with trivial content
        return !text.includes('none required') && 
               !text.includes('standard source') &&
               !text.match(/^power\s*:\s*standard/i);
      });
      
      if (nonTrivialSlides.length === 0) {
        // All were trivial, skip them
        i++;
        continue;
      }
      
      // Merge all non-trivial slides into one content array
      const mergedContent = [];
      const sections = [];
      
      nonTrivialSlides.forEach(s => {
        const sectionTitle = s.title.replace('System Requirements:', '').trim() || 'General';
        sections.push(sectionTitle);
        (s.content || []).forEach(item => {
          mergedContent.push(item);
        });
      });
      
      // Check if content is too long (need to split)
      if (mergedContent.length > MAX_ITEMS_PER_SLIDE) {
        // Split into multiple slides
        const totalItems = mergedContent.length;
        const numSlides = Math.ceil(totalItems / MAX_ITEMS_PER_SLIDE);
        const itemsPerSlide = Math.ceil(totalItems / numSlides);
        
        for (let slideIdx = 0; slideIdx < numSlides; slideIdx++) {
          const startIdx = slideIdx * itemsPerSlide;
          const endIdx = Math.min(startIdx + itemsPerSlide, totalItems);
          const slideContent = mergedContent.slice(startIdx, endIdx);
          
          const slideTitle = numSlides > 1 
            ? `${baseTitle} (${slideIdx + 1}/${numSlides})`
            : baseTitle;
          
          aggregated.push({
            ...slide,
            title: slideTitle,
            content: slideContent,
            _splitSlide: true,
            _splitIndex: slideIdx,
            _splitTotal: numSlides
          });
        }
      } else if (nonTrivialSlides.length > 1 || 
                 (nonTrivialSlides.length === 1 && systemReqSlides.length > 1)) {
        // Merge multiple slides (content is not too long)
        aggregated.push({
          ...slide,
          title: baseTitle,
          content: mergedContent,
          _mergedSections: sections
        });
      } else {
        // Keep single slide but update title
        aggregated.push({
          ...nonTrivialSlides[0],
          title: baseTitle
        });
      }
      
      i++;
    } else {
      aggregated.push(slide);
      i++;
    }
  }
  
  return aggregated;
}

// Clean timeline event text (remove leading/trailing pipes)
function cleanTimelineEvent(event) {
  if (!event) return '';
  return event.replace(/^\s*\|+\s*/, '').replace(/\s*\|+\s*$/, '').trim();
}

// Generate HTML for title slide
function generateTitleSlideHTML(slide, htmlDir, assetsDir) {
  const bgPath = path.relative(htmlDir, path.join(assetsDir, 'background.png'));
  const date = slide.date || '';
  
  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: #000000; }
body {
  width: ${SLIDE_WIDTH}pt;
  height: ${SLIDE_HEIGHT}pt;
  margin: 0;
  padding: 0;
  background-image: url('${bgPath}');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: Arial, Helvetica, sans-serif;
}
.title-container {
  text-align: center;
}
h1 {
  color: ${ACCENT_COLOR};
  font-size: 28pt;
  font-weight: bold;
  text-transform: uppercase;
  margin: 0 40pt 20pt 40pt;
  padding: 0;
  line-height: 1.3;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: ${SLIDE_WIDTH - 80}pt;
  text-align: center;
}
.date {
  color: ${TEXT_COLOR};
  font-size: 18pt;
  margin: 0;
  padding: 0;
}
</style>
</head>
<body>
<div class="title-container">
  <h1>${escapeHtml(slide.title || '')}</h1>
  ${date ? `<p class="date">${escapeHtml(date)}</p>` : ''}
</div>
</body>
</html>`;
}

// Generate HTML for content_bullets slide
function generateContentBulletsHTML(slide, htmlDir, assetsDir) {
  const bgPath = path.relative(htmlDir, path.join(assetsDir, 'background.png'));
  const content = slide.content || [];
  
  // Check if this is System Requirements slide to add images
  const isSystemRequirements = slide.title && slide.title.toLowerCase().includes('system requirements');
  // ref folder is at ../../ref relative to scripts directory
  const refDir = path.join(path.dirname(path.dirname(path.dirname(__dirname))), 'ref');
  
  let listHTML = '<ul style="list-style-type: none; padding: 0; margin: 0;">';
  let previousWasNetwork = false;
  let previousWasCamera = false;
  
  content.forEach((item, index) => {
    const level = item.level || 0;
    const text = item.text || '';
    if (text === '---') return; // Skip separator lines
    
    // Check if this is a section title (Network, Camera, etc.) - level 0 without colon
    const colonIndex = text.indexOf(':');
    let formattedText = '';
    let isNetworkSection = false;
    let isCameraSection = false;
    
    if (colonIndex > 0) {
      // Key-value pair format
      const key = text.substring(0, colonIndex).trim();
      const value = text.substring(colonIndex + 1).trim();
      formattedText = `<span style="color: ${ACCENT_COLOR}; font-weight: bold;">${escapeHtml(key)}:</span> ${escapeHtml(value)}`;
    } else if (level === 0 && text && !text.includes(':')) {
      // Section title (Network, Camera, etc.) - format as section header
      isNetworkSection = text.trim() === 'Network';
      isCameraSection = text.trim() === 'Camera';
      formattedText = `<span style="color: ${ACCENT_COLOR}; font-weight: bold; font-size: 15pt;">${escapeHtml(text)}</span>`;
    } else {
      formattedText = escapeHtml(text);
    }
    
    const indent = level * 18;
    // Reduce font size for very long content lists
    const contentLength = content.length;
    const baseFontSize = contentLength > 15 ? 12 : (contentLength > 10 ? 13 : 14);
    
    // Check if this is a section title (level 0, no colon, just the section name)
    const isSectionTitle = level === 0 && text && !text.includes(':') && 
                           ['Network', 'Camera', 'AI Training', 'AI Inference', 'Dashboard'].includes(text.trim());
    
    const fontSize = isSectionTitle ? '15pt' : (level === 0 ? `${baseFontSize}pt` : `${Math.max(10, baseFontSize - 2)}pt`);
    const marginBottom = isSectionTitle ? '8pt' : '3pt';
    
    // Add image for Network or Camera section if System Requirements slide
    // Icon should be positioned to the left of section title, not below
    let imageHTML = '';
    let iconBeforeText = '';
    if (isSystemRequirements && isNetworkSection) {
      const networkImagePath = path.join(refDir, 'network.png');
      if (fs.existsSync(networkImagePath)) {
        const networkImageRel = path.relative(htmlDir, networkImagePath);
        iconBeforeText = `<img src="${networkImageRel}" alt="Network" style="width: 24pt; height: 24pt; object-fit: contain; vertical-align: middle; margin-right: 8pt; display: inline-block;" />`;
      }
    } else if (isSystemRequirements && isCameraSection) {
      const cameraImagePath = path.join(refDir, 'camera.png');
      if (fs.existsSync(cameraImagePath)) {
        const cameraImageRel = path.relative(htmlDir, cameraImagePath);
        iconBeforeText = `<img src="${cameraImageRel}" alt="Camera" style="width: 24pt; height: 24pt; object-fit: contain; vertical-align: middle; margin-right: 8pt; display: inline-block;" />`;
      }
    }
    
    listHTML += `<li style="margin-left: ${indent}pt; margin-bottom: ${marginBottom}; font-size: ${fontSize}; color: ${TEXT_COLOR}; line-height: 1.25; word-wrap: break-word; overflow-wrap: break-word;">
      ${iconBeforeText}${formattedText}
    </li>`;
    
    previousWasNetwork = isNetworkSection;
    previousWasCamera = isCameraSection;
  });
  listHTML += '</ul>';
  
  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: #000000; }
body {
  width: ${SLIDE_WIDTH}pt;
  height: ${SLIDE_HEIGHT}pt;
  margin: 0;
  padding: 0;
  background-image: url('${bgPath}');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  font-family: Arial, Helvetica, sans-serif;
  overflow: hidden;
  min-height: 0;
}
.title {
  color: ${ACCENT_COLOR};
  font-size: 28pt;
  font-weight: bold;
  text-transform: uppercase;
  margin: 30pt 120pt 20pt 40pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.content {
  flex: 1;
  margin: 0 120pt 72pt 40pt;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  padding-bottom: 0;
  max-height: 100%;
}
</style>
</head>
<body>
<h1 class="title">${escapeHtml(slide.title || '')}</h1>
<div class="content">
  ${listHTML}
</div>
</body>
</html>`;
}

// Generate HTML for two_column slide
function generateTwoColumnHTML(slide, htmlDir, assetsDir) {
  const bgPath = path.relative(htmlDir, path.join(assetsDir, 'background.png'));
  const leftContent = slide.left_column?.content || [];
  const rightContent = slide.right_column?.content || [];
  
  // Calculate total items to determine font size
  const totalItems = leftContent.length + rightContent.length;
  const fontSize = totalItems > 8 ? 10 : (totalItems > 6 ? 11 : 12);
  const marginBottom = totalItems > 8 ? 4 : (totalItems > 6 ? 6 : 8);
  
  const leftList = leftContent.map(item => 
    `<li style="margin-bottom: ${marginBottom}pt; font-size: ${fontSize}pt; color: ${TEXT_COLOR}; line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(item)}</li>`
  ).join('');
  
  const rightList = rightContent.map(item => 
    `<li style="margin-bottom: ${marginBottom}pt; font-size: ${fontSize}pt; color: ${TEXT_COLOR}; line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(item)}</li>`
  ).join('');
  
  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: #000000; }
body {
  width: ${SLIDE_WIDTH}pt;
  height: ${SLIDE_HEIGHT}pt;
  margin: 0;
  padding: 0;
  background-image: url('${bgPath}');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  font-family: Arial, Helvetica, sans-serif;
  overflow: hidden;
  min-height: 0;
}
.title {
  color: ${ACCENT_COLOR};
  font-size: 24pt;
  font-weight: bold;
  text-transform: uppercase;
  margin: 20pt 40pt 10pt 40pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex-shrink: 0;
}
.columns {
  flex: 1;
  display: flex;
  margin: 0 40pt 54pt 40pt;
  gap: 25pt;
  min-height: 0;
  overflow: hidden;
  padding-bottom: 0;
}
.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}
.column-title {
  color: ${ACCENT_COLOR};
  font-size: 16pt;
  font-weight: bold;
  margin-bottom: 10pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex-shrink: 0;
}
.column-content {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
</style>
</head>
<body>
<h1 class="title">${escapeHtml(slide.title || '')}</h1>
<div class="columns">
  <div class="column">
    <h2 class="column-title">${escapeHtml(slide.left_column?.title || '')}</h2>
    <div class="column-content">
      <ul>${leftList}</ul>
    </div>
  </div>
  <div class="column">
    <h2 class="column-title">${escapeHtml(slide.right_column?.title || '')}</h2>
    <div class="column-content">
      <ul>${rightList}</ul>
    </div>
  </div>
</div>
</body>
</html>`;
}

// Generate HTML for content_table slide
function generateContentTableHTML(slide, htmlDir, assetsDir) {
  const bgPath = path.relative(htmlDir, path.join(assetsDir, 'background.png'));
  const table = slide.table || {};
  const headers = table.headers || [];
  const rows = table.rows || [];
  
  let tableHTML = '<table style="width: 100%; border-collapse: collapse; margin: 0;">';
  
  // Headers
  if (headers.length > 0) {
    tableHTML += '<thead><tr>';
    headers.forEach(header => {
      tableHTML += `<th style="background: ${ACCENT_COLOR}; color: ${TEXT_COLOR}; padding: 8pt; text-align: left; font-weight: bold; border: 1px solid ${ACCENT_COLOR};">${escapeHtml(header)}</th>`;
    });
    tableHTML += '</tr></thead>';
  }
  
  // Rows
  tableHTML += '<tbody>';
  rows.forEach((row, index) => {
    const bgColor = index % 2 === 0 ? '#1a1a1a' : '#2a2a2a';
    tableHTML += '<tr>';
    row.forEach(cell => {
      tableHTML += `<td style="padding: 8pt; color: ${TEXT_COLOR}; border: 1px solid #444; background: ${bgColor}; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(String(cell))}</td>`;
    });
    tableHTML += '</tr>';
  });
  tableHTML += '</tbody></table>';
  
  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: #000000; }
body {
  width: ${SLIDE_WIDTH}pt;
  height: ${SLIDE_HEIGHT}pt;
  margin: 0;
  padding: 0;
  background-image: url('${bgPath}');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  font-family: Arial, Helvetica, sans-serif;
  overflow: hidden;
  min-height: 0;
}
.title {
  color: ${ACCENT_COLOR};
  font-size: 32pt;
  font-weight: bold;
  text-transform: uppercase;
  margin: 30pt 40pt 20pt 40pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.content {
  flex: 1;
  margin: 0 40pt 72pt 40pt;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  padding-bottom: 0;
  max-height: 100%;
}
</style>
</head>
<body>
<h1 class="title">${escapeHtml(slide.title || '')}</h1>
<div class="content">
  ${tableHTML}
</div>
</body>
</html>`;
}

// Generate HTML for module_description slide
function generateModuleDescriptionHTML(slide, mediaPath, mediaType, htmlDir, assetsDir, videoUrl = null) {
  const bgPath = path.relative(htmlDir, path.join(assetsDir, 'background.png'));
  const content = slide.content || {};
  
  const mediaRelPath = mediaPath ? path.relative(htmlDir, mediaPath) : null;
  const isVideo = mediaType === 'video' || mediaType === 'video_manual_insert';
  
  // PRIORITY RULE for videos:
  // 1. Try to insert video into slide using <video> tag (html2pptx may or may not support it)
  // 2. If video insertion fails (html2pptx doesn't support <video> tags), show video_url link for manual insertion
  // 3. If video download failed, show video_url link for manual insertion
  // 
  // showVideoLink = true if:
  // - Video download failed (no mediaRelPath but videoUrl exists), OR
  // - Video downloaded but html2pptx doesn't support <video> tags (we'll try <video> tag first, then fallback to link)
  // 
  // We'll try to insert video tag first. If html2pptx doesn't support it, the video won't appear in PowerPoint
  // and user will need to manually insert. We show the link as fallback.
  const showVideoLink = (!mediaRelPath && videoUrl && videoUrl.trim() !== '') || 
                        (isVideo && mediaRelPath && videoUrl && videoUrl.trim() !== ''); // Always show link for videos since html2pptx doesn't support them
  
  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: #000000; }
body {
  width: ${SLIDE_WIDTH}pt;
  height: ${SLIDE_HEIGHT}pt;
  margin: 0;
  padding: 0;
  background-image: url('${bgPath}');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  font-family: Arial, Helvetica, sans-serif;
  overflow: hidden;
  min-height: 0;
}
.title {
  color: ${ACCENT_COLOR};
  font-size: 26pt;
  font-weight: bold;
  text-transform: uppercase;
  margin: 20pt 40pt 12pt 40pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex-shrink: 0;
}
.content-wrapper {
  flex: 1;
  display: flex;
  margin: 0 40pt 72pt 40pt;
  gap: 25pt;
  min-height: 0;
  overflow: hidden;
  padding-bottom: 0;
}
.text-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
}
.media-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  overflow: hidden;
}
img, video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
video {
  background: #000000;
}
.video-link {
  color: ${ACCENT_COLOR};
  font-size: 10pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
  text-align: center;
  margin-top: 10pt;
  padding: 5pt;
  border: 1px dashed ${ACCENT_COLOR};
}
.section {
  margin-bottom: 8pt;
}
.section-label {
  color: ${ACCENT_COLOR};
  font-size: 13pt;
  font-weight: bold;
  margin-bottom: 2pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.section-text {
  color: ${TEXT_COLOR};
  font-size: 11pt;
  line-height: 1.25;
  word-wrap: break-word;
  overflow-wrap: break-word;
  margin: 0;
}
</style>
</head>
<body>
<h1 class="title">${escapeHtml(slide.title || '')}</h1>
<div class="content-wrapper">
  <div class="text-content">
    ${content.purpose ? `<div class="section">
      <p class="section-label">Purpose:</p>
      <p class="section-text">${escapeHtml(content.purpose)}</p>
    </div>` : ''}
    ${content.alert_logic ? `<div class="section">
      <p class="section-label">Alert Logic:</p>
      <p class="section-text">${escapeHtml(content.alert_logic)}</p>
    </div>` : ''}
    ${content.preconditions ? `<div class="section">
      <p class="section-label">Preconditions:</p>
      <p class="section-text">${escapeHtml(content.preconditions)}</p>
    </div>` : ''}
    ${content.data_requirements ? `<div class="section">
      <p class="section-label">Data Requirements:</p>
      <p class="section-text">${escapeHtml(content.data_requirements)}</p>
    </div>` : ''}
  </div>
  <div class="media-content">
    ${mediaRelPath && !isVideo ? (
      // Image: insert normally
      `<img src="${mediaRelPath}" alt="${escapeHtml(slide.title)}" data-media-path="${mediaRelPath}" data-media-type="image" />`
    ) : isVideo && mediaRelPath ? (
      // Video: Try to insert video tag first (html2pptx may or may not support it)
      // If html2pptx doesn't support <video> tags, it will be ignored and we show link as fallback
      `<video src="${mediaRelPath}" controls data-media-path="${mediaRelPath}" data-media-type="video">
        Your browser does not support the video tag.
      </video>
      ${showVideoLink ? `<div class="video-link"><p>✓ Video downloaded successfully. Video URL (manual insert - if video doesn't appear in PowerPoint):</p><p>${escapeHtml(videoUrl)}</p></div>` : ''}`
    ) : showVideoLink ? (
      // Video download failed or no video path - show link for manual insertion
      `<div class="video-link"><p>${isVideo && mediaRelPath ? '✓ Video downloaded successfully. ' : ''}Video URL (manual insert):</p><p>${escapeHtml(videoUrl)}</p></div>`
    ) : ''}
  </div>
</div>
</body>
</html>`;
}

// Generate HTML for diagram slide
function generateDiagramHTML(slide, diagramPath, htmlDir, assetsDir) {
  const bgPath = path.relative(htmlDir, path.join(assetsDir, 'background.png'));
  const diagramRelPath = diagramPath ? path.relative(htmlDir, diagramPath) : null;
  
  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: #000000; }
body {
  width: ${SLIDE_WIDTH}pt;
  height: ${SLIDE_HEIGHT}pt;
  margin: 0;
  padding: 0;
  background-image: url('${bgPath}');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  font-family: Arial, Helvetica, sans-serif;
  overflow: hidden;
  min-height: 0;
}
.title {
  color: ${ACCENT_COLOR};
  font-size: 28pt;
  font-weight: bold;
  text-transform: uppercase;
  margin: 25pt 40pt 15pt 40pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.diagram-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 40pt 72pt 40pt;
  overflow: hidden;
  min-height: 0;
  padding-bottom: 0;
}
img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
</head>
<body>
<h1 class="title">${escapeHtml(slide.title || '')}</h1>
<div class="diagram-container">
  ${diagramRelPath ? `<img src="${diagramRelPath}" alt="Diagram" />` : ''}
</div>
</body>
</html>`;
}

// Generate HTML for timeline slide
function generateTimelineHTML(slide, htmlDir, assetsDir) {
  const bgPath = path.relative(htmlDir, path.join(assetsDir, 'background.png'));
  const milestones = slide.timeline?.milestones || [];
  
  let timelineHTML = '';
  const timelineStartX = 80;
  const timelineEndX = SLIDE_WIDTH - 80;
  const timelineY = SLIDE_HEIGHT / 2 + 40; // Move timeline down a bit
  const spacing = milestones.length > 1 ? (timelineEndX - timelineStartX) / (milestones.length - 1) : 0;
  
  // All text on one line above the timeline
  const textY = timelineY - 80; // Position text above timeline line
  
  milestones.forEach((milestone, index) => {
    const x = timelineStartX + (index * spacing);
    const eventText = cleanTimelineEvent(milestone.event);
    const phase = milestone.phase || '';
    const date = milestone.date ? cleanTimelineEvent(milestone.date) : '';
    
    // Calculate width based on available space, ensuring no overlap
    const maxWidth = Math.min(160, spacing - 10); // Leave 10pt gap between items
    
    // Fix alignment: center text box on milestone point
    // Position milestone circle at x, then center text box relative to it
    timelineHTML += `
      <div style="position: absolute; left: ${x}pt; top: ${timelineY}pt;">
        <div style="width: 12pt; height: 12pt; background: ${ACCENT_COLOR}; border-radius: 50%; border: 2px solid ${TEXT_COLOR}; position: absolute; top: -6pt; left: -6pt;"></div>
        <div style="position: absolute; left: ${-maxWidth/2}pt; top: ${textY - timelineY}pt; width: ${maxWidth}pt; text-align: center;">
          <p style="color: ${TEXT_COLOR}; font-size: 11pt; line-height: 1.3; margin: 0 0 4pt 0; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(eventText)}</p>
          <p style="color: ${ACCENT_COLOR}; font-size: 12pt; font-weight: bold; margin: 0 0 2pt 0;">${escapeHtml(phase)}</p>
          ${date ? `<p style="color: ${TEXT_COLOR}; font-size: 10pt; margin: 0; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(date)}</p>` : ''}
        </div>
      </div>
    `;
  });
  
  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: #000000; }
body {
  width: ${SLIDE_WIDTH}pt;
  height: ${SLIDE_HEIGHT}pt;
  margin: 0;
  padding: 0;
  background-image: url('${bgPath}');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  font-family: Arial, Helvetica, sans-serif;
  overflow: hidden;
  min-height: 0;
  position: relative;
}
.title {
  color: ${ACCENT_COLOR};
  font-size: 28pt;
  font-weight: bold;
  text-transform: uppercase;
  margin: 25pt 40pt 15pt 40pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.timeline-container {
  flex: 1;
  position: relative;
  margin: 0 40pt 72pt 40pt;
  overflow: hidden;
  min-height: 0;
  padding-bottom: 0;
}
.timeline-line {
  position: absolute;
  left: ${timelineStartX}pt;
  width: ${timelineEndX - timelineStartX}pt;
  top: ${timelineY}pt;
  height: 2pt;
  background: ${ACCENT_COLOR};
}
</style>
</head>
<body>
<h1 class="title">${escapeHtml(slide.title || '')}</h1>
<div class="timeline-container">
  <div class="timeline-line"></div>
  ${timelineHTML}
</div>
</body>
</html>`;
}

// Escape HTML
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Main generation function
async function generatePresentation(inputJsonPath) {
  console.log(`Reading JSON from: ${inputJsonPath}`);
  const jsonData = JSON.parse(await fs.promises.readFile(inputJsonPath, 'utf8'));
  
  // Create output directories
  const inputName = path.basename(inputJsonPath, '.json');
  const baseDir = path.dirname(inputJsonPath);
  const outputDir = path.join(baseDir, `${inputName}_output`);
  const htmlDir = path.join(outputDir, 'html');
  const assetsDir = path.join(outputDir, 'assets');
  
  await fs.promises.mkdir(htmlDir, { recursive: true });
  await fs.promises.mkdir(assetsDir, { recursive: true });
  
  // Copy background image to assets
  const bgDest = path.join(assetsDir, 'background.png');
  await fs.promises.copyFile(BACKGROUND_IMAGE, bgDest);
  
  // Apply smart content aggregation
  console.log('Applying smart content aggregation...');
  const aggregatedSlides = aggregateSlides(jsonData.slides || []);
  console.log(`Reduced ${jsonData.slides.length} slides to ${aggregatedSlides.length} slides`);
  
  // Process assets
  console.log('Processing assets...');
  const browser = await chromium.launch();
  // Create a browser context with downloads enabled
  const context = await browser.newContext({
    acceptDownloads: true
  });
  const assetMap = new Map(); // Map slide index to asset paths
  
  try {
    for (let i = 0; i < aggregatedSlides.length; i++) {
      const slide = aggregatedSlides[i];
      
      // Download videos/images for module_description slides
      // PRIORITY RULE: video_url first - download video and try to insert into slide
      // Strategy:
      // 1. Download video from video_url
      // 2. Try to insert video into slide (attempt multiple methods)
      // 3. Only if all insertion methods fail, show video_url link for manual insertion
      // 4. Only use image_url if video_url is empty/null
      // 
      // Option to skip video download: set SKIP_VIDEO_DOWNLOAD=true environment variable
      const skipVideoDownload = process.env.SKIP_VIDEO_DOWNLOAD === 'true' || process.env.SKIP_VIDEO_DOWNLOAD === '1';
      
      if (slide.type === 'module_description') {
        const videoUrl = (slide._video_url || slide.content?.video_url || '').trim();
        const imageUrl = (slide._image_url || slide.content?.image_url || '').trim();
        let downloadedPath = null;
        let mediaType = null;
        let videoInsertionAttempted = false;
        let videoInsertionSucceeded = false;
        
        // Check video_url first (priority) - skip if SKIP_VIDEO_DOWNLOAD is set
        if (videoUrl !== '' && !skipVideoDownload) {
          console.log(`[Slide ${slide.slide_number || i + 1}] Attempting to download video from: ${videoUrl}`);
          
          // Try to get file extension from URL, default to .mp4
          let mediaPath;
          try {
            const urlPath = new URL(videoUrl).pathname;
            const ext = path.extname(urlPath) || '.mp4';
            mediaPath = path.join(assetsDir, `module_${i}${ext}`);
          } catch (e) {
            mediaPath = path.join(assetsDir, `module_${i}.mp4`);
          }
          
          // Step 1: Try downloading video with multiple attempts
          downloadedPath = await downloadVideo(videoUrl, mediaPath, browser, context);
          
          if (downloadedPath) {
            // Step 2: Validate file type using magic bytes
            const isValid = await validateFileType(downloadedPath, 'video');
            if (isValid) {
              const stats = await fs.promises.stat(downloadedPath);
              console.log(`[Slide ${slide.slide_number || i + 1}] ✓ Successfully downloaded video (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
              
              // Step 3: Try to insert video into slide
              // Method 1: Try inserting as <video> tag in HTML (html2pptx may convert it)
              // Note: html2pptx typically doesn't support <video> tags, but we try anyway
              videoInsertionAttempted = true;
              console.log(`[Slide ${slide.slide_number || i + 1}] Attempting to insert video into slide...`);
              
              // Store video as downloaded - we'll try to insert it in HTML generation
              // If html2pptx doesn't support it, it will be ignored and we'll show link
              assetMap.set(i, { 
                type: 'video', 
                path: downloadedPath, 
                video_url: videoUrl,
                insertion_attempted: true
              });
              mediaType = 'video';
              // Note: We'll check in HTML generation if video tag works, if not, fallback to link
              
            } else {
              console.warn(`[Slide ${slide.slide_number || i + 1}] Downloaded file is not a valid video (wrong file type).`);
              await fs.promises.unlink(downloadedPath).catch(() => {});
              downloadedPath = null;
              // Video file is invalid - show video_url link for manual insertion
              assetMap.set(i, { type: 'video_failed', path: null, video_url: videoUrl });
            }
          } else {
            // Video download failed - show video_url link for manual insertion
            console.warn(`[Slide ${slide.slide_number || i + 1}] ✗ Video download failed after trying all methods. Video URL will be shown for manual insertion.`);
            // Store video_url for display in slide when download fails
            assetMap.set(i, { type: 'video_failed', path: null, video_url: videoUrl });
          }
        } else if (videoUrl !== '' && skipVideoDownload) {
          // Skip video download - just show link for manual insertion
          console.log(`[Slide ${slide.slide_number || i + 1}] Skipping video download (SKIP_VIDEO_DOWNLOAD=true). Video URL will be shown for manual insertion.`);
          assetMap.set(i, { type: 'video_failed', path: null, video_url: videoUrl });
        } else if (imageUrl !== '') {
          // Only use image_url if video_url is empty/null
          console.log(`[Slide ${slide.slide_number || i + 1}] video_url is empty, using image_url: ${imageUrl}`);
          
          let mediaPath;
          try {
            const imageExt = path.extname(new URL(imageUrl).pathname) || '.png';
            mediaPath = path.join(assetsDir, `module_${i}${imageExt}`);
          } catch (e) {
            mediaPath = path.join(assetsDir, `module_${i}.png`);
          }
          
          downloadedPath = await downloadImage(imageUrl, mediaPath, browser, context);
          if (downloadedPath) {
            console.log(`[Slide ${slide.slide_number || i + 1}] ✓ Successfully downloaded image`);
            assetMap.set(i, { type: 'image', path: downloadedPath });
            mediaType = 'image';
          } else {
            console.warn(`[Slide ${slide.slide_number || i + 1}] Image download failed.`);
          }
        } else {
          // Both video_url and image_url are empty - leave blank for manual insertion
          console.log(`[Slide ${slide.slide_number || i + 1}] Both video_url and image_url are empty. Leaving blank for manual insertion.`);
          // Don't set anything in assetMap - will be null/undefined
        }
      }
      
      // Render Mermaid diagrams
      if (slide.type === 'diagram' && slide.diagram?.type === 'mermaid') {
        const diagramPath = path.join(assetsDir, `diagram_${i}.png`);
        await renderMermaidDiagram(slide.diagram.code, diagramPath);
        assetMap.set(i, { type: 'diagram', path: diagramPath });
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }
  
  // Generate HTML files
  console.log('Generating HTML files...');
  const htmlFiles = [];
  
  for (let i = 0; i < aggregatedSlides.length; i++) {
    const slide = aggregatedSlides[i];
    const htmlFile = path.join(htmlDir, `slide_${i + 1}.html`);
    let html = '';
    
    switch (slide.type) {
      case 'title':
        html = generateTitleSlideHTML(slide, htmlDir, assetsDir);
        break;
      case 'content_bullets':
        html = generateContentBulletsHTML(slide, htmlDir, assetsDir);
        break;
      case 'content_table':
        html = generateContentTableHTML(slide, htmlDir, assetsDir);
        break;
      case 'two_column':
        html = generateTwoColumnHTML(slide, htmlDir, assetsDir);
        break;
      case 'module_description': {
        const asset = assetMap.get(i);
        const videoUrl = slide._video_url || slide.content?.video_url || '';
        // For video: always pass videoUrl so it can be shown as fallback link if video insertion fails
        // Priority: try to insert video, if fails show link
        const videoUrlForLink = videoUrl || (asset?.video_url || '');
        html = generateModuleDescriptionHTML(slide, asset?.path, asset?.type || 'image', htmlDir, assetsDir, videoUrlForLink);
        break;
      }
      case 'diagram': {
        const asset = assetMap.get(i);
        html = generateDiagramHTML(slide, asset?.path, htmlDir, assetsDir);
        break;
      }
      case 'timeline':
        html = generateTimelineHTML(slide, htmlDir, assetsDir);
        break;
      default:
        console.warn(`Unknown slide type: ${slide.type}`);
        continue;
    }
    
    await fs.promises.writeFile(htmlFile, html);
    htmlFiles.push(htmlFile);
  }
  
  // Convert HTML to PPTX
  console.log('Converting HTML to PPTX...');
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = jsonData.client_name || 'viAct';
  pptx.title = jsonData.project_name || 'Presentation';
  
  for (const htmlFile of htmlFiles) {
    try {
      await html2pptx(htmlFile, pptx);
    } catch (error) {
      console.error(`Error processing ${htmlFile}: ${error.message}`);
      throw error;
    }
  }
  
  const outputPptx = path.join(outputDir, `${inputName}.pptx`);
  await pptx.writeFile({ fileName: outputPptx });
  console.log(`\nPresentation generated successfully!`);
  console.log(`Output: ${outputPptx}`);
  console.log(`HTML files: ${htmlDir}`);
  console.log(`Assets: ${assetsDir}`);
  
  // Step 4: Insert reference slides (System_architecture and Available slides)
  console.log(`\nStep 4: Inserting reference slides...`);
  try {
    const { execSync } = require('child_process');
    const scriptDir = path.dirname(__filename);
    const insertScript = path.join(scriptDir, 'insert_reference_slides.py');
    
    // Try to find project_info.json in the same directory as input JSON
    const baseDir = path.dirname(inputJsonPath);
    const inputNameWithoutExt = path.basename(inputJsonPath, '.json');
    
    // Look for project_info.json (created by generate_from_deal_transfer.py)
    // It should be named like: {project_name}_project_info.json
    // Or we can try to extract deployment_method from slide_structure.json
    let projectInfoPath = path.join(baseDir, `${inputNameWithoutExt.replace('_slide_structure', '')}_project_info.json`);
    
    // If not found, try to find any project_info.json in the directory
    if (!require('fs').existsSync(projectInfoPath)) {
      const files = require('fs').readdirSync(baseDir);
      const projectInfoFile = files.find(f => f.includes('project_info') && f.endsWith('.json'));
      if (projectInfoFile) {
        projectInfoPath = path.join(baseDir, projectInfoFile);
      } else {
        // Create a minimal project_info.json from slide_structure if available
        // Extract deployment_method from slide structure (if stored there)
        const deploymentMethod = jsonData.deployment_method || 'cloud'; // Default to cloud
        const minimalProjectInfo = {
          deployment_method: deploymentMethod,
          project_name: jsonData.project_name || inputNameWithoutExt
        };
        projectInfoPath = path.join(baseDir, `${inputNameWithoutExt}_project_info.json`);
        require('fs').writeFileSync(projectInfoPath, JSON.stringify(minimalProjectInfo, null, 2));
        console.log(`  Created minimal project_info.json with deployment_method: ${deploymentMethod}`);
      }
    }
    
    if (require('fs').existsSync(projectInfoPath)) {
      console.log(`  Using project_info: ${projectInfoPath}`);
      console.log(`  Running insert_reference_slides.py...`);
      
      // Run Python script to insert reference slides
      // Use absolute paths to avoid path issues
      const outputPptxAbs = path.resolve(outputPptx);
      const projectInfoPathAbs = path.resolve(projectInfoPath);
      const insertScriptAbs = path.resolve(insertScript);
      const command = `python3 "${insertScriptAbs}" "${outputPptxAbs}" "${projectInfoPathAbs}" "${outputPptxAbs}"`;
      execSync(command, { stdio: 'inherit', cwd: scriptDir });
      
      console.log(`  ✓ Reference slides inserted successfully`);
    } else {
      console.warn(`  ⚠ Project info not found. Skipping reference slides insertion.`);
      console.warn(`  Expected location: ${projectInfoPath}`);
    }
  } catch (error) {
    console.warn(`  ⚠ Failed to insert reference slides: ${error.message}`);
    console.warn(`  Presentation generated but reference slides were not inserted.`);
    console.warn(`  You can manually run: python3 scripts/insert_reference_slides.py "${outputPptx}" <project_info.json>`);
  }
}

// Main
if (require.main === module) {
  const inputJsonPath = process.argv[2];
  if (!inputJsonPath) {
    console.error('Usage: node generate_from_json.js <input_json_file>');
    process.exit(1);
  }
  
  generatePresentation(inputJsonPath).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = { generatePresentation };

