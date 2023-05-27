const { test: base, chromium, webkit } = require('@playwright/test');
const path = require('path');
const addresses = require('../../page-objects/addresses.js');

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

test('Debank Transactions and Gas', async ({ page }) => {
    await page.goto('https://debank.com');
  
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
  
      await page.locator('[class="Input_input__3YdgD"]').first().fill(address);
      await page.waitForTimeout(2000);
      await page.locator('[class="Input_input__3YdgD"]').first().press('Enter');
  
      await page.waitForTimeout(2000);
  
      await page.getByText('Transactions').click();
  
      await page.waitForTimeout(2000);
  
      let loadMoreButton = await page.locator('[class="Button_button__1yaWD Button_is_default__2ObHV History_loadMore__1DkZs"]');
      while (await loadMoreButton.isVisible()) {
        await loadMoreButton.click();
        await page.waitForTimeout(2000);
        loadMoreButton = await page.locator('[class="Button_button__1yaWD Button_is_default__2ObHV History_loadMore__1DkZs"]');
      }
  
      const gasValues = await page.$$eval('.History_gasPrice__2TKTX', elements => {
        return elements.reduce((total, element) => {
          const value = element.textContent;
          const dollarIndex = value.indexOf('$');
          if (dollarIndex !== -1) {
            const number = parseFloat(value.substring(dollarIndex + 1));
            if (!isNaN(number)) {
              total += number;
            }
          }
          return total;
        }, 0);
      });
  
      console.log(`ads${i + 1}: ${address}`);
      console.log(`Total Gas: $${gasValues}`);
      console.log('-----------------');
    }
  });  