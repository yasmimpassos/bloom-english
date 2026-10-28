import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  providers,
  connectionRequest,
  generationRequest,
  parseLessonResponse,
  generateLesson,
  testConnection,
} from '../providers.js';
const material = {
  title: 'Cafeteria',
  content: 'Order coffee',
  level: 'A1',
  count: 6,
  types: ['choice', 'write'],
};
const settings = (provider) => ({
  provider,
  key: `test-${provider}-secret`,
  model: providers[provider].model,
});
test('four providers use the correct API contract and credentials never enter body or URL', () => {
  for (const provider of Object.keys(providers)) {
    const config = settings(provider),
      r = generationRequest(config, material);
    assert.ok(r.url.startsWith('https://'));
    assert.ok(!r.url.includes(config.key));
    assert.ok(!JSON.stringify(r.body).includes(config.key));
    const get = connectionRequest(config);
    assert.ok(!get.url.includes(config.key));
    if (provider === 'gemini') {
      assert.equal(r.headers['x-goog-api-key'], config.key);
      assert.equal(r.headers.Authorization, undefined);
      assert.equal(r.body.generationConfig.responseMimeType, 'application/json');
      assert.ok(r.body.generationConfig.responseJsonSchema.properties.questions);
    } else assert.equal(r.headers.Authorization, `Bearer ${config.key}`);
    if (provider === 'openai') assert.equal(r.body.store, false);
    if (provider === 'groq') assert.equal(r.body.response_format.json_schema.strict, true);
    if (provider === 'openrouter')
      assert.deepEqual(r.body.provider.max_price, { prompt: 0, completion: 0 });
  }
});
test('paid OpenRouter models and invalid endpoints cannot be selected', () => {
  assert.throws(
    () => generationRequest({ ...settings('openrouter'), model: 'openai/gpt-4.1' }, material),
    /pagos estão bloqueados/,
  );
  assert.throws(
    () => generationRequest({ ...settings('groq'), model: '../../malicious?key=x' }, material),
    /modelo/,
  );
  assert.throws(
    () => generationRequest({ ...settings('groq'), provider: 'unknown' }, material),
    /provedor/,
  );
});
test('all response shapes parse and malformed, refused or truncated replies are rejected', () => {
  const text = JSON.stringify({ questions: [{ prompt: 'Test' }] });
  assert.equal(
    parseLessonResponse('gemini', {
      candidates: [{ content: { parts: [{ thought: true, text: 'Ignore this' }, { text }] } }],
    })[0].prompt,
    'Test',
  );
  assert.equal(
    parseLessonResponse('openai', { output: [{ content: [{ type: 'output_text', text }] }] })[0]
      .prompt,
    'Test',
  );
  for (const p of ['groq', 'openrouter'])
    assert.equal(
      parseLessonResponse(p, {
        choices: [{ message: { content: '```json\n' + text + '\n```' } }],
      })[0].prompt,
      'Test',
    );
  assert.throws(
    () =>
      parseLessonResponse('groq', {
        choices: [{ message: { content: 'truncated' }, finish_reason: 'length' }],
      }),
    /cortada/,
  );
  assert.throws(
    () => parseLessonResponse('gemini', { promptFeedback: { blockReason: 'SAFETY' } }),
    /não retornou/,
  );
  assert.throws(
    () => parseLessonResponse('groq', { choices: [{ message: { content: 'not JSON' } }] }),
    /formato inválido/,
  );
});
test('quota and eligibility errors never fall back to a paid provider', async () => {
  for (const [p, status] of [
    ['groq', 429],
    ['gemini', 403],
    ['openrouter', 402],
  ]) {
    let calls = 0;
    await assert.rejects(
      () =>
        generateLesson(settings(p), material, async () => {
          calls++;
          return new Response('{}', { status });
        }),
      /cota|limite|acesso/i,
    );
    assert.equal(calls, 1);
  }
});
test('connection checks validate Groq model availability and OpenRouter keys without generation', async () => {
  await assert.rejects(
    () =>
      testConnection(settings('groq'), async (url, options) => {
        assert.ok(url.endsWith('/models'));
        assert.equal(options.method, undefined);
        return new Response(JSON.stringify({ data: [] }));
      }),
    /modelo não está disponível/,
  );
  const message = await testConnection(settings('openrouter'), async (url) => {
    assert.ok(url.endsWith('/key'));
    return new Response(JSON.stringify({ data: { is_free_tier: true } }));
  });
  assert.match(message, /disponibilidade/);
});

test('Groq failures distinguish credentials, oversized input and invalid generation without leaking data', async () => {
  for (const [status, code, message, expected] of [
    [401, 'invalid_api_key', 'secret-value', /chave Groq não foi aceita/],
    [400, 'json_validate_failed', 'secret-value', /Sua chave foi aceita/],
    [413, '', 'secret-value', /Reduza o texto/],
    [400, 'model_decommissioned', 'secret-value', /Usar modelo sugerido/],
    [429, '', 'Request too large secret-value', /Reduza o texto/],
  ]) {
    await assert.rejects(
      generateLesson(
        settings('groq'),
        material,
        async () => new Response(JSON.stringify({ error: { code, message } }), { status }),
      ),
      (error) => expected.test(error.message) && !error.message.includes('secret-value'),
    );
  }
});
test('rate limits include retry guidance and non-JSON failures retain their HTTP diagnosis', async () => {
  await assert.rejects(
    testConnection(
      settings('groq'),
      async () =>
        new Response('{}', {
          status: 429,
          headers: { 'retry-after': '12' },
        }),
    ),
    /12 segundos.*HTTP 429/,
  );
  await assert.rejects(
    testConnection(
      settings('groq'),
      async () => new Response('<html>down</html>', { status: 503 }),
    ),
    /HTTP 503/,
  );
});

test('Groq retries a rejected schema once using JSON mode with the same credentials and model', async () => {
  const calls = [];
  const result = await generateLesson(settings('groq'), material, async (url, options) => {
    calls.push({ url, ...options, body: JSON.parse(options.body) });
    return calls.length === 1
      ? new Response(JSON.stringify({ error: { message: 'response_format schema rejected' } }), {
          status: 400,
        })
      : new Response(
          JSON.stringify({
            choices: [{ message: { content: '{"questions":[{"prompt":"Coffee?"}]}' } }],
          }),
        );
  });
  assert.equal(result[0].prompt, 'Coffee?');
  assert.equal(calls.length, 2);
  assert.equal(calls[0].body.response_format.type, 'json_schema');
  assert.equal(calls[1].body.response_format.type, 'json_object');
  assert.equal(calls[0].url, calls[1].url);
  assert.deepEqual(calls[0].headers, calls[1].headers);
  assert.equal(calls[0].body.model, calls[1].body.model);
});
test('Groq does not retry unrelated failures and stops after one format fallback', async () => {
  for (const [status, code, expectedCalls] of [
    [400, 'invalid_api_key', 1],
    [401, '', 1],
    [429, '', 1],
    [400, 'json_validate_failed', 2],
  ]) {
    let calls = 0;
    await assert.rejects(
      generateLesson(settings('groq'), material, async () => {
        calls++;
        return new Response(JSON.stringify({ error: { code } }), { status });
      }),
    );
    assert.equal(calls, expectedCalls);
  }
});

test('Groq reserves output space for explained exercises and limits GPT-OSS reasoning', () => {
  for (const count of [6, 12, 18]) {
    const request = generationRequest(settings('groq'), { ...material, count });
    assert.equal(request.body.max_completion_tokens, 1024 + count * 850);
    assert.equal(request.body.reasoning_effort, 'low');
  }
  const custom = generationRequest(
    { ...settings('groq'), model: 'llama-3.3-70b-versatile' },
    material,
  );
  assert.equal(custom.body.reasoning_effort, undefined);
  assert.equal(
    generationRequest(settings('openrouter'), material).body.reasoning_effort,
    undefined,
  );
});
test('truncation reports an output limit without blaming the study material', () => {
  assert.throws(
    () =>
      parseLessonResponse('groq', {
        choices: [{ finish_reason: 'length', message: { content: '{"questions":[' } }],
      }),
    (error) =>
      error.message.includes('não do tamanho do seu material') &&
      !error.message.includes('reduzir o material'),
  );
});
