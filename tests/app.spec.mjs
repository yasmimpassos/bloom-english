import { test, expect } from '@playwright/test';
import { getQuestions } from '../content.js';
import { defaultState } from '../learning.js';
import { readFile } from 'node:fs/promises';

test('dashboard, responsive layout and all navigation areas work without browser errors', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Hello, you' })).toBeVisible();
  await page.screenshot({ path: 'test-results/bloom-desktop.png', fullPage: true });
  for (const [hash, text] of [
    ['learn', 'O mundo em novas palavras.'],
    ['materials', 'Seu conteúdo. Novas possibilidades.'],
    ['review', 'O que você errou pode florescer.'],
    ['vocab', 'Seu pequeno grande vocabulário.'],
    ['stats', 'Cada passo conta.'],
    ['settings', 'Seu espaço de aprendizado.'],
  ]) {
    await page.goto('/#' + hash);
    await expect(page.getByRole('heading', { name: text, exact: true })).toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.hero')).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
  await page.screenshot({ path: 'test-results/bloom-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await page.locator('.nav-item[data-page="vocab"]').click();
  await expect(page.locator('h1')).toContainText('vocabulário');
  expect(errors).toEqual([]);
});

test('full six-format lesson saves answers, review, XP and resume across reload', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Vamos praticar' }).click();
  await page.getByRole('button', { name: 'colher', exact: false }).click();
  await expect(page.locator('.quiz-feedback')).toContainText('Resposta: xícara');
  await page.locator('.close-modal').click();
  await page.reload();
  await page.getByRole('button', { name: 'Continuar de onde parei' }).click();
  await expect(page.locator('.quiz-feedback')).toContainText('xícara');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('button', { name: 'The coffee is hot.', exact: false }).click();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  const sentenceModal = await page.locator('.quiz-modal').elementHandle();
  for (const w of ['I', 'would', 'like', 'a', 'coffee', 'please'])
    await page.locator('.word-bank').getByRole('button', { name: w, exact: true }).click();
  expect(
    await sentenceModal.evaluate((node) => node === document.querySelector('.quiz-modal')),
  ).toBe(true);
  await page
    .locator('.sentence-built')
    .getByRole('button', { name: 'please', exact: true })
    .click();
  await expect(
    page.locator('.word-bank').getByRole('button', { name: 'please', exact: true }),
  ).toBeVisible();
  await page.locator('.word-bank').getByRole('button', { name: 'please', exact: true }).click();
  await page.getByRole('button', { name: 'Verificar', exact: false }).click();
  await expect(page.locator('.quiz-feedback')).toHaveClass(/correct/);
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.locator('#quiz-answer').fill('drinks');
  await page.getByRole('button', { name: 'Verificar', exact: false }).click();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('button', { name: 'Tea', exact: false }).click();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.locator('#quiz-answer').fill('I want a tea.');
  await page.getByRole('button', { name: 'Verificar', exact: false }).click();
  await page.getByRole('button', { name: 'Ver resultado' }).click();
  await expect(page.locator('.result-stats')).toContainText('5/6');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('bloom.v1')));
  expect(saved.xp).toBe(52);
  expect(saved.errors).toHaveLength(1);
  expect(saved.history).toHaveLength(1);
  expect(saved.completed['coffee:A1'].score).toBeCloseTo(5 / 6);
  expect(saved.activeSession).toBeNull();
  await page.getByRole('button', { name: 'Revisar meus erros' }).click();
  await page.getByRole('button', { name: 'Começar revisão' }).click();
  await page.getByRole('button', { name: 'xícara', exact: false }).click();
  await expect(page.locator('.quiz-feedback')).toHaveClass(/correct/);
  await page.screenshot({ path: 'test-results/bloom-quiz.png', fullPage: true });
});

test('single-choice answers submit once without replacing the modal or resetting its scroll', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 640 });
  await page.goto('/');
  for (const type of ['match', 'choice', 'reading']) {
    if (type === 'match') await page.locator('[data-topic="coffee"]').click();
    else await page.locator(`[data-practice="${type}"]`).click();
    const modal = await page.locator('.quiz-modal').elementHandle();
    await expect(page.locator('#check-answer')).toBeHidden();
    const answersBefore = await page.evaluate(
      () => JSON.parse(localStorage.getItem('bloom.v1')).answers,
    );
    const scrollBefore = await modal.evaluate((node) => {
      node.scrollTop = 60;
      return node.scrollTop;
    });
    await page
      .locator('[data-option]')
      .first()
      .evaluate((node) => node.click());
    await expect(page.locator('.quiz-feedback')).toBeVisible();
    expect(await modal.evaluate((node) => node === document.querySelector('.quiz-modal'))).toBe(
      true,
    );
    expect(await modal.evaluate((node) => node.scrollTop)).toBe(scrollBefore);
    await expect(page.locator('#check-answer')).toHaveText(/Continuar/);
    for (const option of await page.locator('[data-option]').all())
      await expect(option).toBeDisabled();
    await page.locator('[data-option]').first().dispatchEvent('click');
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('bloom.v1')));
    expect(saved.answers).toBe(answersBefore + 1);
    expect(saved.activeSession.checked).toBe(true);
    await page.locator('.close-modal').click();
  }
});

test('vocabulary creation, flashcards, exact writing practice and profile persistence', async ({
  page,
}) => {
  await page.goto('/#vocab');
  await page.getByRole('button', { name: 'Adicionar palavra', exact: false }).first().click();
  await page.locator('[name="word"]').fill('cup');
  await page.locator('[name="translation"]').fill('xícara');
  await page.locator('[name="example"]').fill('A cup of tea.');
  await page.getByRole('button', { name: 'Adicionar ao vocabulário', exact: false }).click();
  await expect(page.locator('.vocab-card')).toContainText('cup');
  await page.getByRole('button', { name: 'Estudar com flashcards' }).click();
  await page.locator('#flip-card').click();
  await expect(page.locator('.flashcard')).toContainText('xícara');
  await page.getByRole('button', { name: 'Eu sabia' }).click();
  await page.getByRole('button', { name: 'Praticar palavras' }).click();
  await page.locator('#quiz-answer').fill('cup');
  await page.getByRole('button', { name: 'Verificar', exact: false }).click();
  await expect(page.locator('.quiz-feedback')).toHaveClass(/correct/);
  await page.locator('.close-modal').click();
  await page.goto('/#settings');
  await page.locator('[name="name"]').fill('Yasmim');
  await page.locator('[name="level"]').selectOption('B1');
  await page.locator('[name="goal"]').selectOption('50');
  await page.getByRole('button', { name: 'Salvar preferências' }).click();
  await page.reload();
  await expect(page.locator('[name="name"]')).toHaveValue('Yasmim');
  expect(await page.locator('[name="level"]').inputValue()).toBe('B1');
});

test('materials save without API and generation handles errors then successful structured response', async ({
  page,
}) => {
  await page.goto('/#materials');
  await page.getByRole('button', { name: 'Adicionar material', exact: false }).first().click();
  await page.locator('[name="title"]').fill('Cafeteria');
  await page.locator('#material-content').fill('How to order coffee, please.');
  await page.getByRole('button', { name: 'Salvar material', exact: true }).click();
  await expect(page.locator('.material-card')).toContainText('Cafeteria');
  await page.goto('/#settings');
  await page.locator('#ai-provider').selectOption('openai');
  await page.locator('#api-key').fill('sk-test-only');
  await page.getByRole('button', { name: 'Salvar chave', exact: true }).click();
  await page.route('https://api.openai.com/v1/responses', (route) =>
    route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({ error: { message: 'quota' } }),
    }),
  );
  await page.goto('/#materials');
  await page.getByRole('button', { name: 'Gerar exercícios' }).click();
  await expect(page.locator('#generation-status')).toContainText('Limite ou saldo');
  await page.unroute('https://api.openai.com/v1/responses');
  const qs = getQuestions('coffee').map((q) => ({
    ...q,
    options: q.options || [],
    words: q.words || [],
    passage: q.passage || '',
    accepted: q.accepted || [],
  }));
  await page.route('https://api.openai.com/v1/responses', (route) => {
    const body = route.request().postDataJSON();
    expect(body.store).toBe(false);
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        output: [{ content: [{ type: 'output_text', text: JSON.stringify({ questions: qs }) }] }],
      }),
    });
  });
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.locator('.quiz-modal')).toBeVisible();
  const saved = await page.evaluate(() => localStorage.getItem('bloom.v1'));
  expect(saved).not.toContain('sk-test-only');
  const data = JSON.parse(saved);
  expect(data.custom).toHaveLength(1);
  expect(data.materials).toHaveLength(1);
  expect(data.custom[0].questions).toHaveLength(6);
});

test('backup export excludes API credentials and valid import restores progress safely', async ({
  page,
}) => {
  await page.goto('/#settings');
  await page.locator('#ai-provider').selectOption('openai');
  await page.locator('#api-key').fill('sk-test-backup-secret');
  await page.getByRole('button', { name: 'Salvar chave', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar backup' }).click();
  const download = await downloadPromise;
  const exported = await readFile(await download.path(), 'utf8');
  expect(exported).not.toContain('sk-test-backup-secret');
  const backup = defaultState();
  backup.name = 'Yasmim';
  backup.xp = 80;
  backup.words = [
    {
      id: 'restored-word',
      word: 'bloom',
      translation: 'florescer',
      example: 'Let your English bloom.',
      correct: 2,
    },
  ];
  await page.locator('#import-backup').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await expect(page.getByRole('heading', { name: 'Restaurar sua jornada?' })).toBeVisible();
  await page.getByRole('button', { name: 'Restaurar backup', exact: true }).click();
  await expect(page.locator('[name="name"]')).toHaveValue('Yasmim');
  await page.goto('/#vocab');
  await expect(page.locator('.vocab-card')).toContainText('bloom');
  await page.goto('/#settings');
  backup.words[0].id = '"><img src=x onerror=alert(1)>';
  await page.locator('#import-backup').setInputFiles({
    name: 'unsafe.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await expect(page.locator('#toast')).toContainText('não é um backup válido');
  await expect(page.locator('.modal')).toHaveCount(0);
});

test('a repeat with mistakes preserves an earlier mastered lesson score', async ({ page }) => {
  await page.goto('/');
  const initial = defaultState();
  initial.completed['coffee:A1'] = { score: 1, date: Date.now() };
  await page.evaluate((s) => localStorage.setItem('bloom.v1', JSON.stringify(s)), initial);
  await page.reload();
  await page.locator('[data-topic="coffee"]').click();
  for (let i = 0; i < 6; i++) {
    const q = await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('bloom.v1')).activeSession.questions[
          JSON.parse(localStorage.getItem('bloom.v1')).activeSession.index
        ],
    );
    if (q.options)
      await page
        .getByRole('button', { name: q.options.find((o) => o !== q.answer), exact: false })
        .click();
    else if (q.type === 'order') await page.locator('.word-bank button').first().click();
    else await page.locator('#quiz-answer').fill('wrong');
    if (!q.options) await page.getByRole('button', { name: 'Verificar', exact: false }).click();
    await page.locator('#check-answer').click();
  }
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('bloom.v1')));
  expect(state.completed['coffee:A1'].score).toBe(1);
  expect(state.history[0].correct).toBe(0);
});

test('asking about passive voice explains construction and persists a future review after a correct answer', async ({
  page,
}) => {
  await page.goto('/');
  const initial = defaultState();
  initial.level = 'B2';
  initial.custom = [
    {
      id: 'passive-lesson',
      title: 'Voz passiva',
      level: 'B2',
      questions: [getQuestions('coffee', 'B2')[5]],
    },
  ];
  await page.evaluate((s) => localStorage.setItem('bloom.v1', JSON.stringify(s)), initial);
  await page.goto('/#learn');
  await page.reload();
  await page.locator('[data-id="passive-lesson"]').click();
  await page.locator('#quiz-answer').fill('The cof');
  const modal = await page.locator('.quiz-modal').elementHandle();
  const before = Date.now();
  await page.getByRole('button', { name: 'Tenho uma dúvida', exact: true }).click();
  await expect(page.locator('#quiz-help-panel')).toContainText('O que é voz passiva?');
  await expect(page.locator('#quiz-help-panel')).toContainText('has/have + been + particípio');
  await expect(page.locator('#quiz-help-panel')).toContainText('The coffee has been prepared.');
  await expect(page.locator('#quiz-answer')).toHaveValue('The cof');
  expect(await modal.evaluate((node) => node === document.querySelector('.quiz-modal'))).toBe(true);
  let saved = await page.evaluate(() => JSON.parse(localStorage.getItem('bloom.v1')));
  expect(saved.answers).toBe(0);
  expect(saved.errors).toHaveLength(1);
  expect(saved.errors[0].count).toBe(0);
  expect(saved.errors[0].due).toBeGreaterThanOrEqual(before + 86400000);
  await page.getByRole('button', { name: 'Fechar explicação', exact: true }).click();
  await expect(page.locator('#quiz-help-panel')).toBeHidden();
  await page.getByRole('button', { name: 'Tenho uma dúvida', exact: true }).click();
  await page.reload();
  await page.goto('/#home');
  await page.getByRole('button', { name: 'Continuar de onde parei' }).click();
  await expect(page.locator('#quiz-help-panel')).toBeVisible();
  await expect(page.locator('#quiz-answer')).toHaveValue('The cof');
  await page.locator('#quiz-answer').fill('The coffee has been prepared.');
  await page.getByRole('button', { name: 'Verificar', exact: false }).click();
  await expect(page.locator('.quiz-feedback')).toHaveClass(/correct/);
  saved = await page.evaluate(() => JSON.parse(localStorage.getItem('bloom.v1')));
  expect(saved.errors).toHaveLength(1);
  expect(saved.errors[0].count).toBe(0);
  expect(saved.errors[0].successes).toBe(0);
  expect(saved.errors[0].doubts).toBe(1);
  await page.getByRole('button', { name: 'Ver resultado' }).click();
  await page.getByRole('button', { name: 'Revisar meus erros' }).click();
  await expect(page.locator('.error-item')).toContainText('1 dúvida consultada');
  await expect(page.locator('.error-item')).toContainText('Revisão em');
  await expect(page.locator('.error-item')).not.toContainText('0 erros');
  await page.getByRole('button', { name: 'Revisar esta questão' }).click();
  await expect(page.locator('#quiz-help-panel')).toBeHidden();
  await page.locator('#quiz-answer').fill('The coffee has been prepared.');
  await page.getByRole('button', { name: 'Verificar', exact: false }).click();
  saved = await page.evaluate(() => JSON.parse(localStorage.getItem('bloom.v1')));
  expect(saved.errors[0].successes).toBe(1);
});

for (const width of [390, 1440]) {
  test(`word clicks keep the dialog, tokens and layout stable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await page.locator('[data-practice="order"]').click();
    const modal = await page.locator('.quiz-modal').elementHandle();
    const backdrop = await page.locator('.modal-backdrop').elementHandle();
    const bounds = await page.locator('.quiz-modal').boundingBox();
    const bank = await page.locator('.word-bank').boundingBox();
    const slots = await page.locator('.word-slot').evaluateAll((nodes) =>
      nodes.map((n) => ({
        id: n.dataset.wordSlot,
        x: n.getBoundingClientRect().x,
        y: n.getBoundingClientRect().y,
      })),
    );
    let firstToken;
    for (const word of ['I', 'would', 'like', 'a', 'coffee', 'please']) {
      const token = page.locator('.word-bank').getByRole('button', { name: word, exact: true });
      const handle = await token.elementHandle();
      if (!firstToken) firstToken = handle;
      await token.click();
      expect(
        await handle.evaluate(
          (node) =>
            node.isConnected && node.parentElement.classList.contains('word-slot') && node.disabled,
        ),
      ).toBe(true);
      expect(await modal.evaluate((node) => node === document.querySelector('.quiz-modal'))).toBe(
        true,
      );
      expect(
        await backdrop.evaluate((node) => node === document.querySelector('.modal-backdrop')),
      ).toBe(true);
      expect(await page.locator('.quiz-modal').boundingBox()).toEqual(bounds);
      expect(await page.locator('.word-bank').boundingBox()).toEqual(bank);
      expect(
        await page.locator('.word-slot').evaluateAll((nodes) =>
          nodes.map((n) => ({
            id: n.dataset.wordSlot,
            x: n.getBoundingClientRect().x,
            y: n.getBoundingClientRect().y,
          })),
        ),
      ).toEqual(slots);
    }
    await page.locator('.sentence-built').getByRole('button', { name: 'I', exact: true }).click();
    expect(
      await firstToken.evaluate(
        (node) => node.isConnected && node.parentElement.classList.contains('word-slot'),
      ),
    ).toBe(true);
    await firstToken.click();
    await page.getByRole('button', { name: 'Verificar', exact: false }).click();
    expect(await page.locator('.quiz-modal').boundingBox()).toEqual(bounds);
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    expect(await modal.evaluate((node) => node === document.querySelector('.quiz-modal'))).toBe(
      true,
    );
    expect(await page.locator('.quiz-modal').boundingBox()).toEqual(bounds);
  });
}

test('flipping words and advancing flashcards preserves the same dialog and card', async ({
  page,
}) => {
  await page.goto('/');
  const initial = defaultState();
  initial.words = [
    { id: 'one', word: 'cup', translation: 'xícara', example: 'A cup of tea.', correct: 0 },
    {
      id: 'two',
      word: 'bloom',
      translation: 'florescer',
      example: 'Let your English bloom.',
      correct: 0,
    },
  ];
  await page.evaluate((s) => localStorage.setItem('bloom.v1', JSON.stringify(s)), initial);
  await page.goto('/#vocab');
  await page.reload();
  await page.getByRole('button', { name: 'Estudar com flashcards' }).click();
  const modal = await page.locator('.flashcard-modal').elementHandle();
  const card = await page.locator('#flip-card').elementHandle();
  const bounds = await page.locator('.flashcard-modal').boundingBox();
  for (let i = 0; i < 3; i++) {
    await page.locator('#flip-card').click();
    expect(await card.evaluate((node) => node === document.querySelector('#flip-card'))).toBe(true);
    expect(
      await modal.evaluate((node) => node === document.querySelector('.flashcard-modal')),
    ).toBe(true);
    expect(await page.locator('.flashcard-modal').boundingBox()).toEqual(bounds);
  }
  await expect(page.locator('#flip-card')).toContainText('xícara');
  await page.getByRole('button', { name: 'Eu sabia' }).click();
  await expect(page.locator('#flip-card')).toContainText('bloom');
  expect(await card.evaluate((node) => node === document.querySelector('#flip-card'))).toBe(true);
  await page.locator('#flip-card').click();
  await expect(page.locator('#flip-card')).toContainText('florescer');
  await page.getByRole('button', { name: 'Eu sabia' }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('bloom.v1')));
  expect(saved.words.map((w) => w.correct)).toEqual([1, 1]);
});

test('provider selection isolates saved keys and preserves existing OpenAI sessions', async ({
  page,
}) => {
  await page.goto('/#settings');
  await expect(page.locator('#ai-provider')).toHaveValue('groq');
  await page.locator('#api-key').fill('groq-private-test');
  await page.getByRole('button', { name: 'Salvar chave', exact: true }).click();
  await page.locator('#ai-provider').selectOption('gemini');
  await expect(page.locator('#api-key')).toHaveValue('');
  await expect(page.locator('[name="model"]')).toHaveValue('gemini-2.5-flash-lite');
  await page.locator('#api-key').fill('gemini-private-test');
  await page.getByRole('button', { name: 'Salvar chave', exact: true }).click();
  await page.locator('#ai-provider').selectOption('groq');
  await expect(page.locator('#api-key')).toHaveValue('groq-private-test');
  expect(await page.evaluate(() => localStorage.getItem('bloom.v1') || '')).not.toContain(
    'private-test',
  );
  await page.getByRole('button', { name: 'Remover', exact: true }).click();
  await expect(page.locator('#api-key')).toHaveValue('');
  await page.locator('#ai-provider').selectOption('gemini');
  await expect(page.locator('#api-key')).toHaveValue('gemini-private-test');
  await page.evaluate(() => {
    sessionStorage.clear();
    sessionStorage.setItem('bloom.key', 'legacy-openai-private-test');
    sessionStorage.setItem('bloom.model', 'gpt-4.1-mini');
  });
  await page.reload();
  await expect(page.locator('#ai-provider')).toHaveValue('openai');
  await expect(page.locator('#api-key')).toHaveValue('legacy-openai-private-test');
  expect(await page.evaluate(() => sessionStorage.getItem('bloom.key'))).toBeNull();
});

test('all official API key links are visible together in settings on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#settings');
  const section = page.getByRole('region', { name: 'Crie sua chave de IA' });
  await expect(section).toBeVisible();
  const urls = [
    'https://console.groq.com/keys',
    'https://aistudio.google.com/apikey',
    'https://openrouter.ai/settings/keys',
    'https://platform.openai.com/api-keys',
  ];
  for (const url of urls) {
    const link = section.locator(`a[href="${url}"]`);
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const provider of ['groq', 'gemini', 'openrouter']) {
  test(`${provider} connects and generates exercises with its own API format`, async ({ page }) => {
    await page.goto('/#settings');
    await page.locator('#ai-provider').selectOption(provider);
    await page.locator('#api-key').fill(`${provider}-test-secret`);
    const endpoint =
      provider === 'groq'
        ? 'https://api.groq.com/openai/v1/models'
        : provider === 'gemini'
          ? 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite'
          : 'https://openrouter.ai/api/v1/key';
    await page.route(endpoint, (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(
          provider === 'groq'
            ? { data: [{ id: 'openai/gpt-oss-20b' }] }
            : { data: { is_free_tier: true } },
        ),
      }),
    );
    await page.getByRole('button', { name: 'Testar conexão' }).click();
    await expect(page.locator('#api-status')).toContainText('reconhecid');
    await page.getByRole('button', { name: 'Salvar chave', exact: true }).click();
    const questions = getQuestions('coffee').map((q) => ({
      ...q,
      help: 'Aprenda com este exemplo.',
      options: q.options || [],
      words: q.words || [],
      passage: q.passage || '',
      accepted: q.accepted || [],
    }));
    const generation =
      provider === 'groq'
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : provider === 'gemini'
          ? 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent'
          : 'https://openrouter.ai/api/v1/chat/completions';
    await page.route(generation, (route) => {
      const req = route.request(),
        body = req.postDataJSON();
      expect(req.headers()[provider === 'gemini' ? 'x-goog-api-key' : 'authorization']).toContain(
        `${provider}-test-secret`,
      );
      expect(req.url()).not.toContain('secret');
      expect(JSON.stringify(body)).not.toContain('secret');
      if (provider === 'openrouter') {
        expect(body.model).toBe('openrouter/free');
        expect(body.provider.max_price).toEqual({ prompt: 0, completion: 0 });
      }
      const text = JSON.stringify({ questions });
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(
          provider === 'gemini'
            ? { candidates: [{ content: { parts: [{ text }] } }] }
            : { choices: [{ message: { content: text }, finish_reason: 'stop' }] },
        ),
      });
    });
    await page.goto('/#materials');
    await page.getByRole('button', { name: 'Adicionar material', exact: false }).first().click();
    await page.locator('[name="title"]').fill(`Cafeteria ${provider}`);
    await page.locator('#material-content').fill('Ordering coffee in English.');
    await page.getByRole('button', { name: 'Salvar e gerar exercícios' }).click();
    await expect(page.locator('.quiz-modal')).toBeVisible();
    const saved = await page.evaluate(() => localStorage.getItem('bloom.v1'));
    expect(JSON.parse(saved).custom[0].questions).toHaveLength(6);
    expect(saved).not.toContain('test-secret');
  });
}

test('editing a library material persists in place and closing discards unsaved edits', async ({
  page,
}) => {
  await page.goto('/#materials');
  await page.getByRole('button', { name: 'Adicionar material', exact: false }).first().click();
  await page.locator('[name="title"]').fill('Cafeteria');
  await page.locator('#material-content').fill('Order coffee.');
  await page.getByRole('button', { name: 'Salvar material', exact: true }).click();
  const original = await page.evaluate(
    () => JSON.parse(localStorage.getItem('bloom.v1')).materials[0],
  );
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  await expect(page.locator('[name="title"]')).toHaveValue('Cafeteria');
  await page.locator('[name="title"]').fill('Modal verbs');
  await page.locator('#material-content').fill('Can, could and should.');
  await page.locator('[name="level"]').selectOption('B1');
  await page.locator('[name="count"]').selectOption('12');
  await page.locator('[name="types"][value="reading"]').uncheck();
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await page.reload();
  await expect(page.locator('.material-card')).toHaveCount(1);
  await expect(page.locator('.material-card')).toContainText('Modal verbs');
  const updated = await page.evaluate(
    () => JSON.parse(localStorage.getItem('bloom.v1')).materials[0],
  );
  expect(updated).toMatchObject({
    id: original.id,
    date: original.date,
    title: 'Modal verbs',
    content: 'Can, could and should.',
    level: 'B1',
    count: 12,
  });
  expect(updated.types).not.toContain('reading');
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  await expect(page.locator('[name="count"]')).toHaveValue('12');
  await expect(page.locator('[name="types"][value="reading"]')).not.toBeChecked();
  await page.locator('[name="title"]').fill('Unsaved');
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await expect(page.locator('.material-card')).toContainText('Modal verbs');
});

test('generation repairs an incomplete lesson once and saves only a valid complete result', async ({
  page,
}) => {
  await page.goto('/#settings');
  await page.locator('#api-key').fill('gsk-test-only');
  await page.getByRole('button', { name: 'Salvar chave', exact: true }).click();
  let calls = 0;
  await page.route('https://api.groq.com/openai/v1/chat/completions', (route) => {
    calls++;
    const body = route.request().postDataJSON();
    if (calls === 2) expect(body.messages[1].content).toContain('correction');
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({ questions: calls === 1 ? [] : getQuestions('coffee') }),
            },
          },
        ],
      }),
    });
  });
  await page.goto('/#materials');
  await page.getByRole('button', { name: 'Adicionar material', exact: false }).first().click();
  await page.locator('[name="title"]').fill('Corporate emphasis');
  await page
    .locator('#material-content')
    .fill('Cleft sentences, do/does/did emphasis and inversion in business.');
  await page.getByRole('button', { name: 'Salvar e gerar exercícios', exact: true }).click();
  await expect(page.locator('.quiz-modal')).toBeVisible();
  expect(calls).toBe(2);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('bloom.v1')));
  expect(saved.custom).toHaveLength(1);
  expect(saved.custom[0].questions).toHaveLength(6);
});
