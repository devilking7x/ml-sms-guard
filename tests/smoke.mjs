// Playwright smoke test: loads index.html from disk, checks for console
// errors, clicks a scam example, and saves a screenshot.
// Run: node tests/smoke.mjs
// Uses playwright-core from /tmp/pwtest (shared install) + system Chromium
// at ~/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome
// (task brief said chromium-1248; that build is not installed here).
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('/tmp/pwtest/node_modules/playwright-core');

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '..');

const browser = await chromium.launch({
  executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto('file://' + root + '/index.html', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(500);

// Stats panel must render with real numbers
const stats = await page.textContent('#modelStats');
if (!/120 messages/.test(stats)) throw new Error('stats panel missing dataset size: ' + stats);
if (!/accuracy/.test(stats)) throw new Error('stats panel missing accuracy');

// Click the scam example chip and check the verdict
await page.click('[data-example="scam"]');
await page.waitForTimeout(300);
const result = await page.textContent('#result');
if (!/SCAM/.test(result)) throw new Error('scam example not flagged: ' + result);
if (!/confidence/i.test(result)) throw new Error('no confidence shown');

// Click the ham example chip and check the verdict flips
await page.click('[data-example="ham"]');
await page.waitForTimeout(300);
const result2 = await page.textContent('#result');
if (!/NORMAL/.test(result2)) throw new Error('ham example not cleared: ' + result2);

await page.screenshot({ path: root + '/tests/smoke-screenshot.png', fullPage: true });
await browser.close();

if (errors.length) throw new Error('console/page errors: ' + errors.join(' | '));
console.log('SMOKE OK: page loaded, no console errors, scam->SCAM, ham->NORMAL, screenshot saved');
