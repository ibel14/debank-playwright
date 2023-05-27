const { test: base, chromium, webkit } = require('@playwright/test');
const path = require('path');
const addresses = require('../../page-objects/addresses.js');

const fs = require('fs');

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

  let output = '';

  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];

    // Вставляем адрес в поле поиска и нажимаем Enter
    await page.locator('[class="Input_input__3YdgD"]').fill(address);
    await page.waitForTimeout(2000);
    const total = await page.$$eval('.db-user-amount', elements => {
      return elements.map(element => element.textContent);
    });
    await page.press('[class="Input_input__3YdgD"]', 'Enter');

    // Ждем 2 секунды, чтобы страница прогрузилась
    await page.waitForTimeout(2000);

    const values = await page.$$eval('.db-table-cell', elements => {
      return elements.map(element => element.textContent);
    });

    output += `ads${i + 1}: ${address}\n`;
    output += `Total: ${total}\n`;
    output += `${values}\n`;
    output += '-----------------\n';
  }

  // Получение текущей даты и форматирование ее в строку
  const date = new Date();
  const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;

  // Использование dateString в имени файла
  fs.writeFileSync(`output-ads-${dateString}.txt`, output);
});