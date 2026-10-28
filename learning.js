export function normalize(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9'\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
export function isCorrect(value, question) {
  return [question.answer, ...(question.accepted || [])].some(
    (a) => normalize(a) === normalize(value),
  );
}
export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function streak(days, today = new Date()) {
  const d = new Date(today);
  let count = 0;
  if (!days.includes(dayKey(d))) d.setDate(d.getDate() - 1);
  while (days.includes(dayKey(d))) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}
export function defaultState() {
  return {
    version: 1,
    name: 'Estudante',
    level: 'A1',
    goal: 30,
    xp: 0,
    answers: 0,
    correct: 0,
    days: [],
    daily: {},
    completed: {},
    errors: [],
    words: [],
    materials: [],
    custom: [],
    history: [],
  };
}
export function validateQuestion(q) {
  const types = ['choice', 'fill', 'order', 'write', 'reading', 'match'];
  if (
    !q ||
    !types.includes(q.type) ||
    typeof q.prompt !== 'string' ||
    !q.prompt.trim() ||
    typeof q.answer !== 'string' ||
    !q.answer.trim() ||
    typeof q.explanation !== 'string'
  )
    return false;
  if (q.prompt.length > 4000 || q.answer.length > 2000 || q.explanation.length > 8000) return false;
  if (q.help !== undefined && (typeof q.help !== 'string' || q.help.length > 10000)) return false;
  if (
    q.accepted !== undefined &&
    (!Array.isArray(q.accepted) || !q.accepted.every((a) => typeof a === 'string'))
  )
    return false;
  if (
    ['choice', 'reading', 'match'].includes(q.type) &&
    (!Array.isArray(q.options) ||
      q.options.length < 2 ||
      !q.options.every((x) => typeof x === 'string') ||
      !q.options.includes(q.answer))
  )
    return false;
  if (q.type === 'reading' && (typeof q.passage !== 'string' || !q.passage.trim())) return false;
  if (
    q.type === 'order' &&
    (!Array.isArray(q.words) ||
      !q.words.every((x) => typeof x === 'string') ||
      !isCorrect(q.words.join(' '), q))
  )
    return false;
  return true;
}
// Normalize only equivalent representations; never invent an answer or missing content.
export function prepareGeneratedLesson(raw, count, types) {
  const issues = [];
  if (!Array.isArray(raw))
    return { questions: [], issues: ['A IA não retornou uma lista de exercícios.'] };
  if (raw.length !== count)
    issues.push(`Foram recebidos ${raw.length} exercícios; eram esperados ${count}.`);
  const questions = raw.map((value, index) => {
    const q = value && typeof value === 'object' ? { ...value } : {};
    for (const field of ['prompt', 'answer', 'explanation', 'help', 'passage'])
      if (typeof q[field] === 'string') q[field] = q[field].trim();
    if (q.accepted == null) delete q.accepted;
    if (q.help == null) delete q.help;
    if (
      ['choice', 'reading', 'match'].includes(q.type) &&
      Array.isArray(q.options) &&
      typeof q.answer === 'string'
    ) {
      const equivalent = q.options.filter(
        (option) => typeof option === 'string' && normalize(option) === normalize(q.answer),
      );
      if (equivalent.length === 1) q.answer = equivalent[0];
    }
    if (
      q.type === 'order' &&
      typeof q.answer === 'string' &&
      Array.isArray(q.words) &&
      q.words.every((word) => typeof word === 'string')
    ) {
      const tokens = q.answer.split(/\s+/);
      const bag = (words) => words.map(normalize).sort().join('\n');
      if (bag(tokens) === bag(q.words)) q.words = tokens;
    }
    if (!validateQuestion(q) || (types && !types.includes(q.type))) {
      let reason = 'campos obrigatórios ausentes ou inválidos';
      if (
        !['choice', 'fill', 'order', 'write', 'reading', 'match'].includes(q.type) ||
        (types && !types.includes(q.type))
      )
        reason = 'tipo de exercício não solicitado ou desconhecido';
      else if (
        ['choice', 'reading', 'match'].includes(q.type) &&
        (!Array.isArray(q.options) || !q.options.includes(q.answer))
      )
        reason = 'a resposta não corresponde às alternativas';
      else if (q.type === 'order') reason = 'as palavras fornecidas não formam a resposta';
      else if (q.type === 'reading' && (typeof q.passage !== 'string' || !q.passage.trim()))
        reason = 'o texto de leitura está ausente';
      issues.push(`Exercício ${index + 1}: ${reason}.`);
    }
    return q;
  });
  return { questions, issues };
}
export function validateBackup(d) {
  const str = (s, max = 30000) => typeof s === 'string' && s.length <= max;
  const id = (s) => typeof s === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(s);
  const num = (n, max = 1e9) => Number.isFinite(n) && n >= 0 && n <= max;
  const arr = (a, check, max = 10000) => Array.isArray(a) && a.length <= max && a.every(check);
  const obj = (o) => o !== null && typeof o === 'object' && !Array.isArray(o);
  const level = (l) => ['A1', 'A2', 'B1', 'B2'].includes(l);
  const date = (v) => typeof v === 'string' && Number.isFinite(Date.parse(v));
  return (
    obj(d) &&
    d.version === 1 &&
    str(d.name, 30) &&
    d.name.trim().length > 0 &&
    level(d.level) &&
    [20, 30, 50, 100].includes(d.goal) &&
    num(d.xp) &&
    num(d.answers) &&
    num(d.correct) &&
    d.correct <= d.answers &&
    arr(d.days, (v) => /^\d{4}-\d{2}-\d{2}$/.test(v)) &&
    obj(d.daily) &&
    Object.entries(d.daily).every(([k, v]) => /^\d{4}-\d{2}-\d{2}$/.test(k) && num(v)) &&
    obj(d.completed) &&
    Object.entries(d.completed).every(
      ([k, v]) =>
        /^[a-zA-Z0-9-]+:(A1|A2|B1|B2)$/.test(k) && obj(v) && num(v.score, 1) && num(v.date, 1e14),
    ) &&
    arr(
      d.words,
      (w) =>
        obj(w) &&
        id(w.id) &&
        str(w.word, 120) &&
        str(w.translation, 200) &&
        str(w.example, 500) &&
        num(w.correct),
    ) &&
    arr(
      d.materials,
      (m) =>
        obj(m) &&
        id(m.id) &&
        str(m.title, 120) &&
        str(m.content) &&
        level(m.level) &&
        date(m.date) &&
        [6, 12, 18].includes(m.count) &&
        arr(
          m.types,
          (t) => ['choice', 'fill', 'order', 'write', 'reading', 'match'].includes(t),
          6,
        ),
    ) &&
    arr(
      d.custom,
      (c) =>
        obj(c) &&
        id(c.id) &&
        str(c.title, 120) &&
        level(c.level) &&
        arr(c.questions, validateQuestion, 100) &&
        c.questions.length > 0,
    ) &&
    arr(
      d.errors,
      (e) =>
        obj(e) &&
        id(e.id) &&
        validateQuestion(e.question) &&
        str(e.topic, 120) &&
        level(e.level) &&
        str(e.answer) &&
        num(e.count) &&
        num(e.successes) &&
        num(e.due, 1e14) &&
        (e.doubts === undefined || num(e.doubts)),
    ) &&
    arr(
      d.history,
      (h) =>
        obj(h) &&
        str(h.title, 120) &&
        level(h.level) &&
        num(h.correct) &&
        num(h.total) &&
        h.correct <= h.total &&
        date(h.date),
    )
  );
}
export function scheduleDoubt(state, q, topic, level) {
  let entry = state.errors.find(
    (e) => e.question.prompt === q.prompt && e.question.answer === q.answer,
  );
  if (!entry) {
    entry = {
      id: globalThis.crypto.randomUUID(),
      question: q,
      answer: '',
      topic,
      level,
      count: 0,
      successes: 0,
    };
    state.errors.push(entry);
  }
  entry.doubts = (entry.doubts || 0) + 1;
  entry.successes = 0;
  entry.due = Date.now() + 86400000;
  return entry;
}
export function recordAnswer(state, q, answer, topic, level, { assisted = false } = {}) {
  const correct = isCorrect(answer, q),
    today = dayKey();
  state.answers++;
  state.correct += Number(correct);
  state.xp += correct ? 10 : 2;
  state.daily[today] = (state.daily[today] || 0) + (correct ? 10 : 2);
  if (!state.days.includes(today)) state.days.push(today);
  if (
    assisted &&
    !state.errors.some((e) => e.question.prompt === q.prompt && e.question.answer === q.answer)
  ) {
    scheduleDoubt(state, q, topic, level);
  }
  const index = state.errors.findIndex(
    (e) => e.question.prompt === q.prompt && e.question.answer === q.answer,
  );
  if (correct && index >= 0 && !assisted) {
    const e = state.errors[index];
    e.successes = (e.successes || 0) + 1;
    e.due = Date.now() + (e.successes >= 2 ? 7 : 1) * 86400000;
    if (e.successes >= 3) state.errors.splice(index, 1);
  }
  if (!correct) {
    const e = {
      id: globalThis.crypto.randomUUID(),
      question: q,
      answer,
      topic,
      level,
      count: 1,
      successes: 0,
      due: Date.now(),
    };
    if (index >= 0)
      Object.assign(state.errors[index], {
        answer,
        count: state.errors[index].count + 1,
        successes: 0,
        due: Date.now() + (assisted ? 86400000 : 0),
      });
    else state.errors.push(e);
  }
  if (assisted && index >= 0) {
    state.errors[index].successes = 0;
    state.errors[index].due = Date.now() + 86400000;
  }
  return correct;
}
