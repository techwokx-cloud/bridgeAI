const { chromium } = require('playwright');
const path = require('path');

const BASE = process.env.DEMO_BASE_URL || 'http://127.0.0.1:3399';
const VIDEO_DIR = path.join(__dirname, '..', 'demo-recording');

async function pause(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: VIDEO_DIR, size: { width: 1440, height: 900 } },
    permissions: ['microphone'],
  });
  const page = await context.newPage();

  // ---- 1. Landing hero ----
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await pause(3000);

  // ---- 2. Scroll to autonomy proof section ----
  await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 1.05, behavior: 'smooth' }));
  await pause(2500);
  await page.mouse.wheel(0, 300);
  await pause(3500);

  // ---- 3. Scroll to "how it works" journey ----
  await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 2.3, behavior: 'smooth' }));
  await pause(3000);

  // ---- 4. Dashboard ----
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' });
  await pause(3500); // let the wake pulse animate

  // ---- 5. Scroll to domains + Add a topic ----
  await page.evaluate(() => window.scrollTo({ top: 850, behavior: 'smooth' }));
  await pause(1500);
  const addTopicBtn = page.locator('text=Add a topic').first();
  if (await addTopicBtn.count()) {
    await addTopicBtn.click();
    await pause(1500);
    const topicInput = page.locator('input[placeholder*="Deciding"]');
    if (await topicInput.count()) {
      await topicInput.type('Whether to accept the new job offer', { delay: 40 });
      await pause(1800);
    }
  }

  // ---- 6. Conversation page ----
  await page.goto(`${BASE}/app/conversation?domain=work`, { waitUntil: 'networkidle' });
  await pause(2000);

  // Show inline topic editing
  const changeTopic = page.locator('text=Change topic ✎').first();
  if (await changeTopic.count()) {
    await changeTopic.click();
    await pause(1200);
    await page.keyboard.press('Escape');
    await pause(600);
  }

  // Type a message (don't send — avoids a live network error appearing on camera)
  const textInput = page.locator('input[placeholder="Type here..."]');
  if (await textInput.count()) {
    await textInput.click();
    await textInput.type("I need to tell my boss I want to travel abroad", { delay: 35 });
    await pause(2200);
  }

  // Show quick actions
  const sitWithIt = page.locator('text=Sit with it').first();
  if (await sitWithIt.count()) {
    await sitWithIt.click();
    await pause(2000);
  }

  // ---- 7. Practice mode ----
  await page.goto(`${BASE}/app/practice`, { waitUntil: 'networkidle' });
  await pause(2000);
  const startPractice = page.locator('text=Start practicing →').first();
  if (await startPractice.count()) {
    await startPractice.click();
    await pause(2500);
  }

  // ---- 8. Resources page ----
  await page.goto(`${BASE}/app/resources`, { waitUntil: 'networkidle' });
  await pause(2000);
  await page.mouse.wheel(0, 400);
  await pause(2500);
  const reachOut = page.locator('text=Help me reach out').first();
  if (await reachOut.count()) {
    await reachOut.hover();
    await pause(1500);
  }

  // ---- 9. Back to dashboard for a closing frame ----
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' });
  await pause(3000);

  await context.close();
  await browser.close();
  console.log('Recording complete.');
})();
