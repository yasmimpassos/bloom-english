import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultState,
  isCorrect,
  normalize,
  recordAnswer,
  scheduleDoubt,
  validateQuestion,
  prepareGeneratedLesson,
  validateBackup,
  streak,
  dayKey,
} from '../learning.js';
import { topics, levels, getQuestions } from '../content.js';
import { exerciseHelp } from '../help.js';
test('all topic and level combinations contain six valid exercise formats', () => {
  for (const t of topics)
    for (const level of Object.keys(levels)) {
      const qs = getQuestions(t.id, level);
      assert.equal(qs.length, 6);
      assert.equal(new Set(qs.map((q) => q.type)).size, 6);
      for (const q of qs) assert.ok(validateQuestion(q), `${t.id}/${level}/${q.type}`);
    }
});
test('grading ignores punctuation and case but preserves significant English spelling', () => {
  assert.equal(normalize('  I’m  here! '), "i'm here");
  assert.ok(isCorrect('I have a book.', { answer: 'I have a book' }));
  assert.ok(
    isCorrect("I've got a book", { answer: 'I have a book', accepted: ["I've got a book"] }),
  );
  assert.equal(isCorrect('He drink coffee', { answer: 'He drinks coffee' }), false);
});
test('wrong answers enter review once, persist attempt count, and retire after three correct reviews', () => {
  const s = defaultState(),
    q = getQuestions('coffee')[0];
  assert.equal(recordAnswer(s, q, 'mesa', 'Cafeteria', 'A1'), false);
  assert.equal(s.xp, 2);
  assert.equal(s.errors.length, 1);
  recordAnswer(s, q, 'prato', 'Cafeteria', 'A1');
  assert.equal(s.errors.length, 1);
  assert.equal(s.errors[0].count, 2);
  recordAnswer(s, q, q.answer, 'Revisão', 'A1');
  assert.equal(s.errors[0].successes, 1);
  assert.ok(s.errors[0].due > Date.now());
  recordAnswer(s, q, q.answer, 'Revisão', 'A1');
  recordAnswer(s, q, q.answer, 'Revisão', 'A1');
  assert.equal(s.errors.length, 0);
  assert.equal(s.xp, 34);
  assert.equal(s.answers, 5);
  assert.equal(s.correct, 3);
  assert.deepEqual(s.days, [dayKey()]);
  assert.equal(s.daily[dayKey()], 34);
});
test('a new mistake resets consolidation and correct-only sessions do not enter review', () => {
  const s = defaultState(),
    q = getQuestions('daily', 'A2')[1];
  recordAnswer(s, q, q.answer, 'Rotina', 'A2');
  assert.equal(s.errors.length, 0);
  recordAnswer(s, q, 'bad', 'Rotina', 'A2');
  recordAnswer(s, q, q.answer, 'Revisão', 'A2');
  recordAnswer(s, q, 'bad', 'Rotina', 'A2');
  assert.equal(s.errors[0].successes, 0);
});
test('streak respects yesterday grace period, gaps and local dates', () => {
  const now = new Date(2026, 9, 28, 12);
  assert.equal(streak(['2026-10-27', '2026-10-26'], now), 2);
  assert.equal(streak(['2026-10-28', '2026-10-27'], now), 2);
  assert.equal(streak(['2026-10-25'], now), 0);
  assert.equal(dayKey(new Date(2026, 0, 2, 1)), '2026-01-02');
});
test('malformed generated questions and contradictory order answers are rejected', () => {
  assert.equal(
    validateQuestion({
      type: 'choice',
      prompt: 'Choose',
      answer: 'yes',
      options: ['no', 'maybe'],
      explanation: 'x',
    }),
    false,
  );
  assert.equal(
    validateQuestion({
      type: 'order',
      prompt: 'Order',
      answer: 'I am here',
      words: ['here', 'am', 'I'],
      explanation: 'x',
    }),
    false,
  );
  assert.equal(
    validateQuestion({
      type: 'reading',
      prompt: 'Read',
      answer: 'yes',
      options: ['yes', 'no'],
      explanation: 'x',
    }),
    false,
  );
});
test('backups validate nested state and reject unsafe identifiers or corrupt progress', () => {
  const d = defaultState();
  assert.ok(validateBackup(d));
  d.words.push({
    id: 'valid-id',
    word: 'cup',
    translation: 'xícara',
    example: 'A cup of tea.',
    correct: 1,
  });
  assert.ok(validateBackup(d));
  d.words[0].id = '"><img src=x onerror=alert(1)>';
  assert.equal(validateBackup(d), false);
  d.words[0].id = 'valid-id';
  d.correct = 10;
  assert.equal(validateBackup(d), false);
});

test('requesting an explanation schedules a doubt without counting an error or an attempt', () => {
  const s = defaultState(),
    q = getQuestions('coffee', 'B2')[5],
    before = Date.now();
  const e = scheduleDoubt(s, q, 'Voz passiva', 'B2');
  assert.equal(e.count, 0);
  assert.equal(e.doubts, 1);
  assert.equal(s.answers, 0);
  assert.equal(s.xp, 0);
  assert.ok(e.due >= before + 86400000);
  assert.ok(validateBackup(s));
  recordAnswer(s, q, q.answer, 'Voz passiva', 'B2', { assisted: true });
  assert.equal(s.errors.length, 1);
  assert.equal(s.errors[0].successes, 0);
  assert.equal(s.errors[0].count, 0);
  for (let i = 0; i < 3; i++) recordAnswer(s, q, q.answer, 'Revisão', 'B2');
  assert.equal(s.errors.length, 0);
});

test('a doubt reuses existing review and resets consolidation, including after a wrong answer', () => {
  const s = defaultState(),
    q = getQuestions('coffee', 'B2')[5];
  recordAnswer(s, q, 'wrong', 'Cafeteria', 'B2');
  recordAnswer(s, q, q.answer, 'Revisão', 'B2');
  const id = s.errors[0].id;
  scheduleDoubt(s, q, 'Cafeteria', 'B2');
  assert.equal(s.errors.length, 1);
  assert.equal(s.errors[0].id, id);
  assert.equal(s.errors[0].successes, 0);
  recordAnswer(s, q, 'wrong again', 'Cafeteria', 'B2', { assisted: true });
  assert.equal(s.errors[0].count, 2);
  assert.equal(s.errors[0].doubts, 1);
  assert.ok(s.errors[0].due > Date.now());
  const fresh = defaultState();
  recordAnswer(fresh, q, q.answer, 'Cafeteria', 'B2', { assisted: true });
  assert.equal(fresh.errors.length, 1);
  assert.equal(fresh.errors[0].successes, 0);
});

test('every built-in exercise has conceptual help and passive voice explains construction', () => {
  for (const t of topics)
    for (const level of Object.keys(levels))
      for (const q of getQuestions(t.id, level)) {
        const h = exerciseHelp(q);
        assert.ok(h.title);
        assert.ok(h.intro);
        assert.ok(h.example);
      }
  const h = exerciseHelp(getQuestions('coffee', 'B2')[5]);
  assert.match(h.title, /voz passiva/);
  assert.match(h.formula, /has\/have \+ been/);
  assert.match(h.example, /The coffee has been prepared/);
  assert.ok(h.steps.length >= 4);
  assert.equal(
    exerciseHelp({
      type: 'write',
      prompt: 'Rewrite',
      explanation: 'x',
      help: 'Explicação personalizada.',
    }).intro,
    'Explicação personalizada.',
  );
});

test('generated lessons normalize equivalent answers and shuffled words without changing source data', () => {
  const order = {
    type: 'order',
    prompt: 'Monte a inversão',
    answer: 'Never had I seen this.',
    words: ['this.', 'I', 'Never', 'seen', 'had'],
    explanation: 'Inverta o auxiliar.',
  };
  const choice = {
    type: 'choice',
    prompt: 'Escolha',
    answer: 'we do agree.',
    options: ['We do agree.', 'We does agree.'],
    explanation: 'Use do.',
    accepted: null,
  };
  const result = prepareGeneratedLesson([order, choice], 2);
  assert.deepEqual(result.issues, []);
  assert.equal(result.questions[0].words.join(' '), order.answer);
  assert.equal(result.questions[1].answer, 'We do agree.');
  assert.equal(order.words[0], 'this.');
});
test('incomplete lessons report count and broken question without inventing answers', () => {
  const result = prepareGeneratedLesson(
    [
      {
        type: 'order',
        prompt: 'Monte',
        answer: 'Never had I agreed.',
        words: ['Never', 'I', 'agreed.'],
        explanation: 'Inversão.',
      },
    ],
    6,
  );
  assert.match(result.issues.join(' '), /recebidos 1.*esperados 6/);
  assert.match(result.issues.join(' '), /Exercício 1.*palavras/);
  assert.deepEqual(result.questions[0].words, ['Never', 'I', 'agreed.']);
  assert.ok(prepareGeneratedLesson([{ type: 'reading', passage: 42 }], 1).issues.length);
});
