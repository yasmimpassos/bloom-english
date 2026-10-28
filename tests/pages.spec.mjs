import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

test('production build works under a GitHub Pages repository path', async ({ page }) => {
  const prefix = '/bloom-english/',
    root = path.resolve('dist');
  const types = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
  };
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (!url.pathname.startsWith(prefix)) {
        res.writeHead(404);
        res.end();
        return;
      }
      const file = path.resolve(root, url.pathname.slice(prefix.length) || 'index.html');
      if (!file.startsWith(root + '/')) {
        res.writeHead(404);
        res.end();
        return;
      }
      const content = await readFile(file);
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'text/plain' });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (response) => {
    if (response.url().startsWith(origin) && response.status() >= 400) errors.push(response.url());
  });
  try {
    await page.goto(origin + prefix + '#settings');
    await expect(
      page.getByRole('heading', { name: 'Seu espaço de aprendizado.', exact: true }),
    ).toBeVisible();
    await expect(page.locator('.key-shortcut')).toHaveCount(4);
    await page.goto(origin + prefix + '#home');
    await page.getByRole('button', { name: 'Vamos praticar' }).click();
    await page.locator('[data-option]').first().click();
    await expect(page.locator('.quiz-feedback')).toBeVisible();
    await page.getByRole('button', { name: 'Tenho uma dúvida', exact: true }).click();
    await expect(page.locator('#quiz-help-panel')).toBeVisible();
    expect(errors).toEqual([]);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
