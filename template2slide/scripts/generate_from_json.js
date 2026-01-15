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

// Rendering constants passed into slide HTML renderers
const RENDER_CONSTANTS = { SLIDE_WIDTH, SLIDE_HEIGHT, ACCENT_COLOR, TEXT_COLOR };

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

// Smart content aggregation: Split System Requirements slides if too long, keep reasonable ones as-is
function aggregateSlides(slides) {
  const aggregated = [];
  let i = 0;
  
  // Thresholds for content length
  const MAX_ITEMS_PER_SLIDE = 10;  // Maximum items per slide before splitting
  
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
      
      // Filter out trivial slides (like Power Requirements with just standard source)
      const nonTrivialSlides = systemReqSlides.filter(s => {
        const content = s.content || [];
        const text = content.map(c => c.text || '').join(' ').toLowerCase();
        // Filter out slides with trivial content
        return !text.includes('none required') && 
               !text.includes('standard source') &&
               !text.match(/^power\s*:\s*standard/i) &&
               content.length > 2; // Also filter out very short slides
      });
      
      if (nonTrivialSlides.length === 0) {
        // All were trivial, skip them
        i++;
        continue;
      }
      
      // Process each slide individually - split if too long
      nonTrivialSlides.forEach((s, slideIdx) => {
        const content = s.content || [];
        
        // Find section boundaries in this slide
        const sectionBoundaries = [];
        content.forEach((item, idx) => {
          const text = (item.text || '').trim();
          // Section headers are items without colons that match known section names
          if (item.level === 0 && !text.includes(':') && 
              ['Network', 'Camera', 'AI Training', 'AI Inference', 'Dashboard'].includes(text)) {
            sectionBoundaries.push({ idx, name: text });
          }
        });
        
        // If slide has multiple sections and is too long, split by sections
        if (sectionBoundaries.length > 1 && content.length > MAX_ITEMS_PER_SLIDE) {
          // Split into separate slides for each section
          for (let secIdx = 0; secIdx < sectionBoundaries.length; secIdx++) {
            const startIdx = sectionBoundaries[secIdx].idx;
            const endIdx = secIdx < sectionBoundaries.length - 1 
              ? sectionBoundaries[secIdx + 1].idx 
              : content.length;
            const sectionContent = content.slice(startIdx, endIdx);
            const sectionName = sectionBoundaries[secIdx].name;
            
            aggregated.push({
              ...s,
              title: `${baseTitle}: ${sectionName}`,
              content: sectionContent,
              _group: sectionName.toLowerCase().replace(/\s+/g, '_')
            });
          }
        } else if (content.length > MAX_ITEMS_PER_SLIDE && sectionBoundaries.length === 1) {
          // Single section but too long - split in half
          const sectionName = sectionBoundaries[0]?.name || '';
          const midPoint = Math.ceil(content.length / 2);
          
          aggregated.push({
            ...s,
            title: sectionName ? `${baseTitle}: ${sectionName} (1/2)` : `${baseTitle} (1/2)`,
            content: content.slice(0, midPoint),
            _group: 'split_1'
          });
          aggregated.push({
            ...s,
            title: sectionName ? `${baseTitle}: ${sectionName} (2/2)` : `${baseTitle} (2/2)`,
            content: content.slice(midPoint),
            _group: 'split_2'
          });
        } else {
          // Slide is fine as-is, just update title if it has a single section
          const sectionName = sectionBoundaries.length === 1 ? sectionBoundaries[0].name : '';
          aggregated.push({
            ...s,
            title: sectionName ? `${baseTitle}: ${sectionName}` : baseTitle,
            _group: sectionName ? sectionName.toLowerCase().replace(/\s+/g, '_') : 'general'
          });
        }
      });
      
      i++;
      continue;
    }
    
    // Old logic for non-grouped System Requirements (keep for backward compatibility)
    if (false && slide.type === 'content_bullets' && slide.title && 
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

// HTML renderers are extracted to ./renderers so layouts can evolve independently per template/theme.
const {
  generateTitleSlideHTML,
  generateContentBulletsHTML,
  generateContentTableHTML,
  generateTwoColumnHTML,
  generateModuleDescriptionHTML,
  generateDiagramHTML,
  generateTimelineHTML,
} = require('./renderers');

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
    // Prepare download tasks for parallel processing
    const downloadTasks = [];
    
    for (let i = 0; i < aggregatedSlides.length; i++) {
      const slide = aggregatedSlides[i];
      
      // Prepare video/image download tasks
      if (slide.type === 'module_description') {
        const videoUrl = (slide._video_url || slide.content?.video_url || '').trim();
        const imageUrl = (slide._image_url || slide.content?.image_url || '').trim();
        
        if (videoUrl !== '') {
          let mediaPath;
          try {
            const urlPath = new URL(videoUrl).pathname;
            const ext = path.extname(urlPath) || '.mp4';
            mediaPath = path.join(assetsDir, `module_${i}${ext}`);
          } catch (e) {
            mediaPath = path.join(assetsDir, `module_${i}.mp4`);
          }
          
          downloadTasks.push({
            index: i,
            slideNumber: slide.slide_number || i + 1,
            type: 'video',
            url: videoUrl,
            path: mediaPath,
            slide: slide
          });
        } else if (imageUrl !== '') {
          let mediaPath;
          try {
            const imageExt = path.extname(new URL(imageUrl).pathname) || '.png';
            mediaPath = path.join(assetsDir, `module_${i}${imageExt}`);
          } catch (e) {
            mediaPath = path.join(assetsDir, `module_${i}.png`);
          }
          
          downloadTasks.push({
            index: i,
            slideNumber: slide.slide_number || i + 1,
            type: 'image',
            url: imageUrl,
            path: mediaPath,
            slide: slide
          });
        }
      }
    }
    
    // Download all videos/images in parallel
    console.log(`Downloading ${downloadTasks.length} media files in parallel...`);
    const downloadResults = await Promise.allSettled(
      downloadTasks.map(async (task) => {
        try {
          if (task.type === 'video') {
            console.log(`[Slide ${task.slideNumber}] Attempting to download video from: ${task.url}`);
            const downloadedPath = await downloadVideo(task.url, task.path, browser, context);
            
            if (downloadedPath) {
              const isValid = await validateFileType(downloadedPath, 'video');
              if (isValid) {
                const stats = await fs.promises.stat(downloadedPath);
                console.log(`[Slide ${task.slideNumber}] ✓ Successfully downloaded video (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
                return { 
                  index: task.index, 
                  type: 'video', 
                  path: downloadedPath, 
                  video_url: task.url,
                  insertion_attempted: true
                };
              } else {
                console.warn(`[Slide ${task.slideNumber}] Downloaded file is not a valid video (wrong file type).`);
                await fs.promises.unlink(downloadedPath).catch(() => {});
                return { index: task.index, type: 'video_failed', path: null, video_url: task.url };
              }
            } else {
              console.warn(`[Slide ${task.slideNumber}] ✗ Video download failed. Video URL will be shown for manual insertion.`);
              return { index: task.index, type: 'video_failed', path: null, video_url: task.url };
            }
          } else {
            // Image download
            console.log(`[Slide ${task.slideNumber}] Attempting to download image from: ${task.url}`);
            const downloadedPath = await downloadImage(task.url, task.path, browser, context);
            if (downloadedPath) {
              console.log(`[Slide ${task.slideNumber}] ✓ Successfully downloaded image`);
              return { index: task.index, type: 'image', path: downloadedPath };
            } else {
              console.warn(`[Slide ${task.slideNumber}] Image download failed.`);
              return { index: task.index, type: 'image_failed', path: null };
            }
          }
        } catch (error) {
          console.warn(`[Slide ${task.slideNumber}] Error downloading ${task.type}: ${error.message}`);
          return task.type === 'video' 
            ? { index: task.index, type: 'video_failed', path: null, video_url: task.url }
            : { index: task.index, type: 'image_failed', path: null };
        }
      })
    );
    
    // Process download results
    for (const result of downloadResults) {
      if (result.status === 'fulfilled' && result.value) {
        assetMap.set(result.value.index, result.value);
      }
    }
    
    // Process other assets (Mermaid diagrams) sequentially
    for (let i = 0; i < aggregatedSlides.length; i++) {
      const slide = aggregatedSlides[i];
      
      // Render Mermaid diagrams
      if (slide.type === 'diagram' && slide.diagram?.type === 'mermaid') {
        const diagramCode = slide.diagram.code || '';
        // Render diagram if code exists
        if (diagramCode.trim()) {
          const diagramPath = path.join(assetsDir, `diagram_${i}.png`);
          await renderMermaidDiagram(diagramCode, diagramPath);
          assetMap.set(i, { type: 'diagram', path: diagramPath });
        } else {
          console.warn(`[Slide ${i + 1}] Warning: Empty Mermaid diagram code - diagram will not be rendered`);
        }
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
        html = generateTitleSlideHTML(slide, htmlDir, assetsDir, RENDER_CONSTANTS);
        break;
      case 'content_bullets':
        html = generateContentBulletsHTML(slide, htmlDir, assetsDir, RENDER_CONSTANTS);
        break;
      case 'content_table':
        html = generateContentTableHTML(slide, htmlDir, assetsDir, RENDER_CONSTANTS);
        break;
      case 'two_column':
        html = generateTwoColumnHTML(slide, htmlDir, assetsDir, RENDER_CONSTANTS);
        break;
      case 'module_description': {
        const asset = assetMap.get(i);
        const videoUrl = slide._video_url || slide.content?.video_url || '';
        // For video: always pass videoUrl so it can be shown as fallback link if video insertion fails
        // Priority: try to insert video, if fails show link
        const videoUrlForLink = videoUrl || (asset?.video_url || '');
        html = generateModuleDescriptionHTML(slide, asset?.path, asset?.type || 'image', htmlDir, assetsDir, RENDER_CONSTANTS, videoUrlForLink);
        break;
      }
      case 'diagram': {
        const asset = assetMap.get(i);
        html = generateDiagramHTML(slide, asset?.path, htmlDir, assetsDir, RENDER_CONSTANTS);
        break;
      }
      case 'timeline':
        html = generateTimelineHTML(slide, htmlDir, assetsDir, RENDER_CONSTANTS);
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

