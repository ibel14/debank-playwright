const { test: base, chromium, webkit } = require('@playwright/test');
const path = require('path');
const addresses = require('../page-objects/addresses.js');

const test = base.extend({
  context: async ({ browserName }, use) => {
    const browserTypes = { chromium, webkit }
    const launchOptions = {
      headless: false,
      viewport: {
        width: 1024,
        height: 768
      }
    }
    const context = await browserTypes[browserName].launchPersistentContext(
      '',
      launchOptions
    )
    await use(context)
    await context.close()
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background)
      background = await context.waitForEvent("serviceworker");
    const extensionId = background.url().split("/")[2];
    await use(extensionId);
  },
});

test('Debank ADS', async ({ page }) => {
  await page.goto('https://debank.com');

  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];

    await page.locator('[class="Input_input__3YdgD"]').fill(address);
    await page.waitForTimeout(2000);
    const total = await page.$$eval('.db-user-amount', elements => {
      return elements.map(element => element.textContent);
    });
    await page.press('[class="Input_input__3YdgD"]', 'Enter');

    await page.waitForTimeout(2000);

    const values = await page.$$eval('.db-table-cell', elements => {
      return elements.map(element => element.textContent);
    });

    console.log(`ads${i + 1}: ${address}`);
    console.log('Total:', total);
    console.log(values);
    console.log('-----------------');
  }
});