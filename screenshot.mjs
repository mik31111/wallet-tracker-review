import puppeteer from 'puppeteer';
import { mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const screenshotsDir = join(__dirname, 'temporary screenshots');

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

await mkdir(screenshotsDir, { recursive: true });

// Find next available screenshot number
const existing = await readdir(screenshotsDir).catch(() => []);
const nums = existing
  .map(f => parseInt(f.match(/^screenshot-(\d+)/)?.[1] ?? '0'))
  .filter(n => !isNaN(n));
const nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 1;

const filename = label
  ? `screenshot-${nextNum}-${label}.png`
  : `screenshot-${nextNum}.png`;
const outputPath = join(screenshotsDir, filename);

const browser = await puppeteer.launch({
  headless: true,
  executablePath: '/Users/ms/.cache/puppeteer/chrome/mac_arm-145.0.7632.77/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

await page.screenshot({ path: outputPath, fullPage: true });
await browser.close();

console.log(`Screenshot saved: ${outputPath}`);
