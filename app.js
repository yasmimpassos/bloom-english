import { topics, levels, getQuestions, typeLabels } from './content.js';
import { exerciseHelp } from './help.js';
import {
  providers,
  validProvider,
  connectionRequest,
  testConnection,
  generateLesson,
} from './providers.js';
import {
  defaultState,
  dayKey,
  streak,
  recordAnswer,
  scheduleDoubt,
  validateQuestion,
  validateBackup,
} from './learning.js';

const $ = (s) => document.querySelector(s);
const esc = (s) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const uid = () => crypto.randomUUID();
const paths = {
  home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
  book: 'M12 5v16m0-16C9 3 5 3 2 4v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-7-1-10 1Z',
  folder: 'M3 7h18v13H3zM3 7V4h6l3 3',
  refresh: 'M20 7v5h-5M4 17v-5h5M5 8a8 8 0 0 1 13-3l2 3M4 16l2 3a8 8 0 0 0 13-3',
  cards: 'M8 3h13v16H8zM4 7H2v15h15v-1',
  chart: 'M4 20V10m8 10V4m8 16v-7M2 22h20',
  settings:
    'm9 3-1 3-3 1-2 3 2 2v3l-1 3 3 2 3-1 2 2 3-1 1-3 3-1 2-3-2-2v-3l1-3-3-2-3 1-2-2zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  chevron: 'm9 5 7 7-7 7',
  plus: 'M12 5v14M5 12h14',
  check: 'm5 12 4 4L20 5',
  close: 'm6 6 12 12M6 18 18 6',
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  flame: 'M12 2c2 6 6 7 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 0 4 3 4 3 1z',
  bolt: 'm13 2-9 12h7l-1 8 10-13h-8z',
  target: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0m-4 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0m-5 0h.01',
  coffee: 'M4 8h12v9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM16 9h2a3 3 0 0 1 0 6h-2M7 2v3m5-3v3M2 23h18',
  plane: 'm22 2-7 20-4-9-9-4zM22 2 11 13',
  sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
  puzzle:
    'M3 3h7v3a2 2 0 1 0 4 0V3h7v7h-3a2 2 0 1 0 0 4h3v7h-7v-3a2 2 0 1 0-4 0v3H3v-7h3a2 2 0 1 0 0-4H3z',
  briefcase: 'M3 7h18v14H3zM8 7V3h8v4M3 12c5 4 13 4 18 0m-9 1v4',
  map: 'm3 5 6-3 6 3 6-3v17l-6 3-6-3-6 3zM9 2v17m6-14v17',
  volume: 'M3 9h4l5-5v16l-5-5H3zM16 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14',
  upload: 'M12 16V3m-5 5 5-5 5 5M3 16v5h18v-5',
  key: 'M14 10a5 5 0 1 1 5 5h-4l-3 3H9v3H3v-5l9-9',
  leaf: 'M20 3C7 1 1 9 6 16c7 5 15-1 14-13ZM4 21 16 9',
  clock: 'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  star: 'm12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',
  download: 'M12 3v13m-5-5 5 5 5-5M3 17v4h18v-4',
  menu: 'M3 6h18M3 12h18M3 18h18',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
};
const icon = (name, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${(
    paths[name] || paths.book
  )
    .split(/(?=M)/)
    .map((d) => `<path d="${d}"/>`)
    .join('')}</svg>`;
const flower = `<svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="24" cy="15" rx="8" ry="12" transform="rotate(${r} 24 24)"/>`).join('')}<circle cx="24" cy="24" r="5" fill="#28664c"/></svg>`;
const illustration = `<svg class="hero-art" viewBox="0 0 390 265" role="img" aria-label="Um livro sorridente entre plantas, com uma xícara de café">
 <ellipse cx="205" cy="244" rx="153" ry="9" fill="#c6d3a9" opacity=".45"/>
 <path d="M58 235Q30 156 63 113Q88 177 58 235" fill="#a8bc7f"/><path d="M66 235Q67 165 112 144Q104 205 66 235" fill="#7e9f65"/><path d="M56 230 60 144" stroke="#6d8f5d" stroke-width="2"/>
 <path d="m274 236 21-53 21 53" fill="#e0a476"/><path d="M289 190q-29-52-1-70 29 25 7 70" fill="#8fa877"/><path d="M296 190q9-61 40-54-1 41-40 54" fill="#b3c78e"/><path d="M297 189q-4-27 9-46" fill="none" stroke="#628457" stroke-width="2"/>
 <path d="M133 203q-17 21-13 30l22 3m74-35q19 18 16 31l-23 3" fill="none" stroke="#365d45" stroke-width="7" stroke-linecap="round"/>
 <path d="m119 99 100-20 27 18-6 105-111 14-20-18z" fill="#457d56"/>
 <path d="m119 99 105-13 18 11-105 17z" fill="#faf6df"/>
 <path d="m117 104 111-15 3 116-108 14z" fill="#7aa778"/>
 <path d="m123 112 99-14 2 101-97 13z" fill="#a9c58b"/>
 <path d="m133 109 2 99" stroke="#d2e1ad" stroke-width="2"/>
 <ellipse cx="158" cy="149" rx="3.5" ry="5" fill="#345a3f"/><ellipse cx="196" cy="144" rx="3.5" ry="5" fill="#345a3f"/>
 <path d="M170 162q10 11 19-3" fill="none" stroke="#345a3f" stroke-width="3" stroke-linecap="round"/>
 <ellipse cx="151" cy="160" rx="8" ry="4" fill="#dfb99a"/><ellipse cx="202" cy="155" rx="8" ry="4" fill="#dfb99a"/>
 <path d="M122 163q-32 3-30 24m139-32q28-16 30-34" fill="none" stroke="#365d45" stroke-width="6" stroke-linecap="round"/>
 <path d="M244 43q0-20 28-20h56q23 0 23 22v21q0 20-23 20h-43l-24 18 5-20q-22-3-22-21z" fill="#fcfbf0" stroke="#d7dfc4"/>
 <text x="267" y="62" fill="#4d6e4a" font-size="23" font-family="Georgia,serif" font-style="italic">hello!</text>
 <path d="M274 214h34v15q0 14-17 14t-17-14z" fill="#f9eee0"/><path d="M308 216h5q13 12-5 15" fill="none" stroke="#f9eee0" stroke-width="5"/>
 <path d="M284 206q-6-8 0-14m11 14q-6-8 0-14" fill="none" stroke="#c6bda5" stroke-width="2" stroke-linecap="round"/>
 <g fill="#f7e6a3"><path d="m93 67 3 9 9 3-9 3-3 9-3-9-9-3 9-3z"/><path d="m339 110 2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></g>
 <path d="m140 49 4 7m9-14 1 8m-23 4 6 5" stroke="#91aa75" stroke-width="2" stroke-linecap="round"/>
</svg>`;

let state;
try {
  const saved = JSON.parse(localStorage.getItem('bloom.v1'));
  state = validateBackup(saved) ? { ...defaultState(), ...saved } : defaultState();
} catch {
  state = defaultState();
}
let page = 'home',
  filter = 'Todos',
  query = '',
  quiz = null,
  wordIndex = 0,
  flipped = false,
  generating = false;
const legacyKey = sessionStorage.getItem('bloom.key');
if (legacyKey) {
  sessionStorage.setItem('bloom.ai.openai.key', legacyKey);
  sessionStorage.setItem(
    'bloom.ai.openai.model',
    sessionStorage.getItem('bloom.model') || providers.openai.model,
  );
  sessionStorage.removeItem('bloom.key');
  sessionStorage.removeItem('bloom.model');
}
const savedProvider = sessionStorage.getItem('bloom.ai.provider');
let provider = validProvider(savedProvider) ? savedProvider : legacyKey ? 'openai' : 'groq';
let apiKey = '',
  model = '';
function loadProvider() {
  apiKey = sessionStorage.getItem(`bloom.ai.${provider}.key`) || '';
  model = sessionStorage.getItem(`bloom.ai.${provider}.model`) || providers[provider].model;
}
loadProvider();
function save() {
  try {
    localStorage.setItem('bloom.v1', JSON.stringify(state));
  } catch {
    toast('O armazenamento está cheio. Exporte um backup e remova materiais antigos.');
  }
}
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $('#toast').classList.remove('visible'), 4200);
}
const button = (text, action, cls = 'primary', extra = '') =>
  `<button class="btn ${cls}" data-action="${action}" ${extra}>${text}</button>`;
const progress = (n, cls = '') =>
  `<div class="progress ${cls}"><span style="width:${Math.min(100, n)}%"></span></div>`;
const topicDone = (t) =>
  Object.keys(state.completed).filter(
    (k) => k.startsWith(`${t.id}:`) && state.completed[k].score >= 0.8,
  ).length;
const stats = () => ({
  streak: streak(state.days),
  today: state.daily[dayKey()] || 0,
  accuracy: state.answers ? Math.round((state.correct / state.answers) * 100) : 0,
  lessons: state.history.length,
});

function render() {
  const s = stats();
  const nav = [
    ['home', 'home', 'Visão geral'],
    ['learn', 'book', 'Minhas trilhas'],
    ['materials', 'folder', 'Meus materiais'],
    ['review', 'refresh', 'Revisão inteligente'],
    ['vocab', 'cards', 'Meu vocabulário'],
    ['stats', 'chart', 'Meu progresso'],
  ];
  $('#app').innerHTML =
    `<aside class="sidebar"><a class="brand" href="#home" aria-label="Bloom início"><span class="brand-flower">${flower}</span>bloom<span class="brand-dot">.</span></a><div class="side-subtitle">UM POUCO TODO DIA. UM MUNDO A MAIS.</div><nav>${nav.map(([id, ic, label]) => `<button class="nav-item ${page === id ? 'active' : ''}" data-page="${id}">${icon(ic)}<span>${label}</span>${id === 'review' && state.errors.length ? `<span class="nav-badge">${state.errors.length}</span>` : ''}</button>`).join('')}</nav><div class="sidebar-bottom"><div class="grow-note"><span class="grow-sprout">${icon('leaf', 26)}</span><strong>No seu tempo.<br>Do seu jeito.</strong><p>Cada palavra é um novo começo.</p></div><button class="nav-item ${page === 'settings' ? 'active' : ''}" data-page="settings">${icon('settings')}<span>Configurações</span></button><div class="profile"><span class="avatar">${esc(state.name.slice(0, 1).toUpperCase())}</span><div><strong>${esc(state.name)}</strong><small>Uma jornada de descobertas</small></div><span class="profile-dot"></span></div></div></aside>
 <div class="workspace"><header class="topbar"><button class="icon-button mobile-menu" data-action="menu" aria-label="Abrir menu">${icon('menu')}</button><span class="breadcrumb">Meu espaço <span>/</span> <strong>${{ home: 'Visão geral', learn: 'Minhas trilhas', materials: 'Meus materiais', review: 'Revisão inteligente', vocab: 'Meu vocabulário', stats: 'Meu progresso', settings: 'Configurações' }[page]}</strong></span><div class="header-right"><span class="language"><svg width="22" height="15" viewBox="0 0 60 40" aria-label="Bandeira britânica"><rect width="60" height="40" rx="3" fill="#60769b"/><path d="m0 0 60 40M60 0 0 40" stroke="#fbfaf1" stroke-width="9"/><path d="m0 0 60 40M60 0 0 40" stroke="#bf7c7c" stroke-width="3"/><path d="M30 0v40M0 20h60" stroke="#fbfaf1" stroke-width="14"/><path d="M30 0v40M0 20h60" stroke="#bf7c7c" stroke-width="8"/></svg> Inglês</span><span class="top-divider"></span><span class="top-stat flame">${icon('flame')}<b>${s.streak}</b><span>dias</span></span><span class="top-stat xp">${icon('bolt')}<b>${state.xp}</b><span>XP</span></span><span class="avatar small">${esc(state.name[0].toUpperCase())}</span></div></header>
 <main id="main">${{ home: homeView, learn: learnView, materials: materialsView, review: reviewView, vocab: vocabView, stats: statsView, settings: settingsView }[page]()}</main><footer><span>Feito para o seu próximo <em>“I did it!”</em></span> <span>${icon('leaf', 13)} Bloom English</span></footer></div>`;
  bind();
}
function heading(eyebrow, title, description, action = '') {
  return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div>${action}</div>`;
}
function homeView() {
  const s = stats(),
    done = Object.keys(state.completed).length;
  return `${heading(
    'SEU INGLÊS FLORESCE AQUI',
    `Hello, ${state.name === 'Estudante' ? 'you' : esc(state.name)} <span class="hello-wave">✳</span>`,
    'Um novo dia para aprender algo que vai com você para a vida.',
    `<label class="level-select">${icon('book', 17)}<select id="level" aria-label="Nível de inglês">${Object.entries(
      levels,
    )
      .map(
        ([k, v]) =>
          `<option value="${k}" ${state.level === k ? 'selected' : ''}>${k} · ${v}</option>`,
      )
      .join('')}</select></label>`,
  )}
 <div class="dashboard-grid"><div class="main-column"><section class="hero"><div class="hero-copy"><span class="pill"><span class="live-dot"></span> SUA JORNADA, SEU RITMO</span><h2>Pequenos passos.<br><em>Grandes conversas.</em></h2><p>O próximo capítulo do seu inglês começa<br class="desktop-br"> com alguns minutos de prática.</p>${button(`${state.activeSession ? 'Continuar de onde parei' : 'Vamos praticar'} ${icon('arrow', 18)}`, 'start-daily')}<span class="hero-footnote">${icon('clock', 14)} 5–10 min <span>•</span> Exercícios no seu nível</span></div>${illustration}</section>
 <div class="section-title"><div><h2>Seu próximo destino</h2><p>Explore assuntos que fazem parte da sua vida.</p></div><button class="text-button" data-page="learn">Ver todas as trilhas ${icon('arrow', 16)}</button></div><div class="topic-grid home-topics">${topics.slice(0, 3).map(topicCard).join('')}</div>
 <section class="material-banner"><span class="banner-icon">${icon('folder', 26)}<i>✦</i></span><div><h3>Seu material vira aprendizado.</h3><p>Um texto, uma anotação ou um tema. A IA cria exercícios para você.</p></div>${button(`Criar exercícios ${icon('plus', 17)}`, 'new-material', 'outline')}</section>
 <div class="section-title compact"><h2>Pratique do seu jeito</h2><span class="subtle">Um pouquinho de cada, todos os dias.</span></div><div class="practice-grid">${[
   ['book', 'Reading', 'Histórias que ensinam', 'reading'],
   ['puzzle', 'Gramática', 'Entenda o porquê', 'choice'],
   ['cards', 'Monte a frase', 'Palavras no lugar certo', 'order'],
   ['leaf', 'Escrita', 'Encontre suas palavras', 'write'],
 ]
   .map(
     ([i, t, d, type]) =>
       `<button class="practice-card" data-practice="${type}"><span class="practice-icon">${icon(i, 21)}</span><strong>${t}</strong><small>${d}</small>${icon('chevron', 15)}</button>`,
   )
   .join('')}</div></div>
 <aside class="right-column"><section class="card daily-card"><div class="card-top"><h3>Sua meta diária</h3><span class="tiny-icon">${icon('target', 20)}</span></div><div class="goal-ring" style="--angle:${Math.min(100, (s.today / state.goal) * 100) * 3.6}deg"><div><strong>${s.today}<small> / ${state.goal}</small></strong><span>XP hoje</span></div></div><p>${s.today >= state.goal ? 'Meta alcançada. Você fez acontecer! 🌱' : 'Um pouco de prática, um passo à frente.'}</p><div class="week-row">${weekDots()}</div></section>
 <section class="card review-card"><div class="card-top"><span class="review-icon">${icon('refresh', 21)}</span><span class="pill pale-orange">${state.errors.length ? `${state.errors.length} para revisar` : 'SEU REFORÇO'}</span></div><h3>Errar também<br>é aprender.</h3><p>${state.errors.length ? 'Uma nova chance para o que ainda está se encaixando.' : 'Erros e dúvidas viram exercícios para você aprender de verdade.'}</p>${button(`Revisar agora ${icon('arrow', 16)}`, 'review-start', 'outline')}</section>
 <section class="word-of-day"><div class="eyebrow">UMA PALAVRA, UM MUNDO</div><div class="word-heading"><h3>serendipity</h3><button class="icon-button" data-speak="serendipity" aria-label="Ouvir serendipity">${icon('volume', 18)}</button></div><span class="phonetic">/ˌser.ənˈdɪp.ə.ti/ · substantivo</span><p>Encontrar algo bom quando você<br>nem estava procurando.</p><div class="word-example">“Learning brought a little<br>serendipity into my day.”</div><button class="text-button" data-action="save-word-day">${icon('plus', 15)} Salvar no vocabulário</button></section></aside></div>`;
}
function weekDots() {
  const now = new Date(),
    day = now.getDay(),
    monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  return ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
    .map((label, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      const key = dayKey(d),
        yes = state.days.includes(key);
      return `<div class="week-day ${yes ? 'done' : ''} ${key === dayKey() ? 'today' : ''}"><span>${label}</span><i>${yes ? icon('check', 13) : key === dayKey() ? '·' : ''}</i></div>`;
    })
    .join('');
}
function topicCard(t) {
  const done = topicDone(t),
    current = state.completed[`${t.id}:${state.level}`];
  return `<button class="topic-card" data-topic="${t.id}"><div class="topic-art ${t.color}"><span class="topic-doodle">${icon(t.icon, 48)}</span><span class="art-spark spark-one">✦</span><span class="art-spark spark-two">+</span><span class="art-orbit"></span><span class="level-pill">${state.level}</span></div><div class="topic-body"><span class="topic-tag">${t.tag}</span><h3>${t.title} ${icon('arrow', 17)}</h3><p>${t.sub}</p><div class="topic-progress"><span>${current ? 'Praticado neste nível' : done ? 'Continue explorando' : 'Vamos começar?'}</span><strong>${done}/4 níveis</strong></div>${progress((done / 4) * 100)}</div></button>`;
}
function learnView() {
  return `${heading(
    'CADA TEMA, UMA DESCOBERTA',
    'O mundo em novas palavras.',
    'Escolha um tema, encontre seu nível e vá no seu ritmo.',
    `<label class="level-select">Nível<select id="level" aria-label="Nível">${Object.entries(levels)
      .map(
        ([k, v]) =>
          `<option ${k === state.level ? 'selected' : ''} value="${k}">${k} · ${v}</option>`,
      )
      .join('')}</select></label>`,
  )}<div class="toolbar"><div class="tabs">${['Todos', 'Dia a dia', 'Gramática', 'Viagens', 'Carreira'].map((t) => `<button class="tab ${filter === t ? 'selected' : ''}" data-filter="${t}">${t}</button>`).join('')}</div><label class="search">${icon('search', 17)}<input id="topic-search" placeholder="Buscar uma trilha…" value="${esc(query)}" aria-label="Buscar trilha"></label></div><div class="topic-grid all-topics" id="topic-results">${filteredTopics()}</div>${state.custom.length ? `<div class="section-title"><h2>Trilhas criadas por você</h2></div><div class="list-grid">${state.custom.map((c) => `<section class="card custom-card"><span class="pill">${esc(c.level)} · PERSONALIZADA</span><h3>${esc(c.title)}</h3><p>${c.questions.length} exercícios · gerados com IA</p>${button(`Praticar ${icon('arrow', 16)}`, 'custom-start', 'primary', `data-id="${c.id}"`)}</section>`).join('')}</div>` : ''}<section class="soft-callout">${icon('leaf', 24)}<div><strong>A jornada é sua.</strong><p>Todos os níveis ficam disponíveis. Ao concluir as seis trilhas com pelo menos 80% de acertos, sugerimos o próximo nível.</p></div></section>`;
}
function filteredTopics() {
  const result = topics.filter(
    (t) =>
      (filter === 'Todos' || t.tag === filter.toUpperCase()) &&
      `${t.title} ${t.sub}`.toLowerCase().includes(query.toLowerCase()),
  );
  return result.length
    ? result.map(topicCard).join('')
    : '<div class="empty-inline">Nenhuma trilha encontrada. Experimente outra palavra.</div>';
}
function materialsView() {
  return `${heading('APRENDA COM O QUE TE INTERESSA', 'Seu conteúdo. Novas possibilidades.', 'Transforme seus textos e tópicos em exercícios para o seu momento.', button(`${icon('plus', 18)} Adicionar material`, 'new-material'))}<section class="materials-intro"><div class="intro-art">${icon('folder', 62)}<span>✦</span></div><div><h2>Da sua curiosidade para a prática.</h2><p>Escreva um tema como “na cafeteria”, cole suas anotações ou importe um arquivo TXT ou Markdown. A IA prepara atividades de leitura, gramática, escrita e muito mais.</p><div class="feature-pills"><span>${icon('check', 14)} Conteúdo no seu nível</span><span>${icon('check', 14)} Correções explicadas</span><span>${icon('check', 14)} Salvo para praticar depois</span></div></div></section><div class="section-title"><h2>Minha biblioteca <span class="count">${state.materials.length}</span></h2><span class="subtle">Seus materiais, sempre por perto.</span></div>${state.materials.length ? `<div class="list-grid">${state.materials.map((m) => `<article class="card material-card"><div class="card-top"><span class="file-icon">${icon('folder', 24)}</span><button class="icon-button" data-delete-material="${m.id}" aria-label="Excluir ${esc(m.title)}">${icon('trash', 17)}</button></div><span class="eyebrow">${esc(m.level)} · ${new Date(m.date).toLocaleDateString('pt-BR')}</span><h3>${esc(m.title)}</h3><p class="material-preview">${esc(m.content)}</p><div class="material-actions">${button('Editar', 'edit-material', 'outline', `data-id="${m.id}"`)}${button(`${icon('bolt', 15)} Gerar exercícios`, 'generate-material', 'primary', `data-id="${m.id}"`)}<button class="icon-button" data-view-material="${m.id}" aria-label="Ler material">${icon('book', 19)}</button></div></article>`).join('')}</div>` : empty('folder', 'Sua biblioteca começa com uma ideia.', 'Que tal adicionar um tema ou aquele texto que você quer entender melhor?', button('Adicionar meu primeiro material', 'new-material'))}${!apiKey ? `<div class="api-notice">${icon('key', 20)}<span>Para gerar exercícios personalizados, escolha uma IA e conecte sua chave, incluindo opções com cota gratuita.</span><button class="text-button" data-page="settings">Configurar API ${icon('arrow', 16)}</button></div>` : ''}`;
}
function reviewView() {
  const errors = [...state.errors].sort((a, b) => b.count - a.count);
  return `${heading('DÊ UMA NOVA CHANCE AO APRENDIZADO', 'O que você errou pode florescer.', 'Erros e dúvidas reunidos para reforçar o que você está aprendendo.', errors.length ? button(`${icon('refresh', 17)} Começar revisão`, 'review-start') : '')}<div class="review-metrics"><div class="card"><span class="metric-icon peach">${icon('refresh')}</span><strong>${errors.length}</strong><span>pontos para reforçar</span></div><div class="card"><span class="metric-icon mint">${icon('check')}</span><strong>${errors.filter((e) => e.successes > 0).length}</strong><span>em recuperação</span></div><div class="card"><span class="metric-icon yellow">${icon('target')}</span><strong>${stats().accuracy}%</strong><span>de acertos no total</span></div></div>${errors.length ? `<div class="error-list">${errors.map((e) => `<article class="card error-item"><span class="error-type">${icon(e.question.type === 'reading' ? 'book' : 'puzzle', 22)}</span><div><span class="eyebrow">${esc(e.topic)} · ${esc(e.level)} · ${typeLabels[e.question.type]}</span><h3>${esc(e.question.prompt)}</h3><p>${e.count > 0 ? `Sua resposta: <span class="wrong-text">${esc(e.answer || 'Sem resposta')}</span>` : 'Você pediu uma explicação para este exercício.'}</p><div class="error-meta">${e.count > 0 ? `<span>${e.count} ${e.count === 1 ? 'erro' : 'erros'}</span>` : ''}${e.doubts ? `<span class="doubt-label">${e.doubts} ${e.doubts === 1 ? 'dúvida consultada' : 'dúvidas consultadas'}</span>` : ''}<span>${e.successes || 0}/3 revisões sem ajuda</span><span>${e.due > Date.now() ? `Revisão em ${new Date(e.due).toLocaleDateString('pt-BR')}` : 'Pronto para revisar'}</span></div></div><button class="icon-button" data-review-one="${e.id}" aria-label="Revisar esta questão">${icon('arrow')}</button></article>`).join('')}</div>` : empty('leaf', 'Um espaço para crescer.', 'Quando você errar ou consultar uma explicação, o exercício aparece aqui. Acerte em três revisões sem ajuda para consolidar o aprendizado.', button('Praticar uma trilha', 'go-learn'))}<section class="soft-callout">${icon('clock', 25)}<div><strong>Repetir no momento certo faz diferença.</strong><p>Depois de acertar, a próxima revisão fica para amanhã e depois para uma semana. Você também pode praticar a qualquer momento.</p></div></section>`;
}
function vocabView() {
  const words = state.words;
  return `${heading('PALAVRAS QUE PASSAM A SER SUAS', 'Seu pequeno grande vocabulário.', 'Guarde descobertas, ouça a pronúncia e pratique do seu jeito.', button(`${icon('plus', 18)} Adicionar palavra`, 'new-word'))}<div class="vocab-summary"><span class="pill">${words.length} ${words.length === 1 ? 'PALAVRA' : 'PALAVRAS'} NA SUA COLEÇÃO</span><div><button class="btn outline" data-action="vocab-quiz" ${!words.length ? 'disabled' : ''}>${icon('puzzle', 17)} Praticar palavras</button><button class="btn primary" data-action="flashcards" ${!words.length ? 'disabled' : ''}>${icon('cards', 17)} Estudar com flashcards</button></div></div>${words.length ? `<label class="search vocab-search">${icon('search', 17)}<input id="word-search" placeholder="Encontre uma palavra…" aria-label="Buscar palavra"></label><div class="word-grid" id="word-list">${wordCards(words)}</div>` : empty('cards', 'Qual foi a última palavra que te deixou curioso?', 'Adicione palavras e expressões com tradução e um exemplo. Sua coleção acompanha o seu ritmo.', button('Adicionar minha primeira palavra', 'new-word'))}`;
}
function wordCards(words) {
  return words.length
    ? words
        .map(
          (w) =>
            `<article class="card vocab-card"><div class="card-top"><span class="eyebrow">${w.correct >= 3 ? 'FLORESCENDO' : 'EM DESCOBERTA'}</span><button class="icon-button" data-delete-word="${w.id}" aria-label="Excluir ${esc(w.word)}">${icon('trash', 16)}</button></div><div class="word-heading"><h3>${esc(w.word)}</h3><button class="icon-button" data-speak="${esc(w.word)}" aria-label="Ouvir ${esc(w.word)}">${icon('volume', 18)}</button></div><p>${esc(w.translation)}</p>${w.example ? `<blockquote>“${esc(w.example)}”</blockquote>` : ''}<div class="word-mastery">${[0, 1, 2].map((i) => `<span class="${(w.correct || 0) > i ? 'filled' : ''}"></span>`).join('')}<small>${w.correct || 0} acertos</small></div></article>`,
        )
        .join('')
    : '<p class="subtle">Nenhuma palavra encontrada.</p>';
}
function statsView() {
  const s = stats(),
    total = Object.values(state.daily),
    max = Math.max(30, ...total);
  return `${heading('OLHE O QUANTO VOCÊ JÁ CRESCEU', 'Cada passo conta.', 'Sua constância transforma pequenos momentos em grandes conquistas.')}<div class="stat-grid">${[
    ['bolt', state.xp, 'XP conquistados', 'mint'],
    ['flame', s.streak, 'dias de sequência', 'peach'],
    ['book', s.lessons, 'práticas concluídas', 'blue'],
    ['target', s.accuracy + '%', 'de acertos', 'purple'],
  ]
    .map(
      ([i, n, l, c]) =>
        `<div class="card stat-card"><span class="metric-icon ${c}">${icon(i, 23)}</span><strong>${n}</strong><p>${l}</p></div>`,
    )
    .join(
      '',
    )}</div><div class="stats-layout"><section class="card activity-card"><div class="card-top"><h2>Uma semana de descobertas</h2><span class="pill">XP POR DIA</span></div><div class="bar-chart">${Array.from(
    { length: 7 },
    (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const xp = state.daily[dayKey(d)] || 0;
      return `<div class="bar-col"><strong>${xp}</strong><div class="bar-track"><div style="height:${Math.max(2, (xp / max) * 100)}%" class="${dayKey(d) === dayKey() ? 'current' : ''}"></div></div><span>${d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span><small>${d.getDate()}</small></div>`;
    },
  ).join(
    '',
  )}</div></section><section class="card"><h2>Seu caminho pelos níveis</h2><div class="level-path">${Object.entries(
    levels,
  )
    .map(([k, v]) => {
      const count = topics.filter((t) => state.completed[`${t.id}:${k}`]?.score >= 0.8).length;
      return `<div class="level-step ${state.level === k ? 'current' : ''}"><span>${k}</span><div><strong>${v}</strong><small>${count}/6 trilhas com 80% de acertos</small>${progress((count / 6) * 100)}</div></div>`;
    })
    .join(
      '',
    )}</div></section></div><div class="section-title"><h2>Suas últimas práticas</h2></div>${
    state.history.length
      ? `<div class="card history-table"><table><thead><tr><th>Prática</th><th>Nível</th><th>Resultado</th><th>Data</th></tr></thead><tbody>${state.history
          .slice(-15)
          .reverse()
          .map(
            (h) =>
              `<tr><td>${esc(h.title)}</td><td><span class="pill">${esc(h.level)}</span></td><td>${h.correct}/${h.total} acertos</td><td>${new Date(h.date).toLocaleDateString('pt-BR')}</td></tr>`,
          )
          .join('')}</tbody></table></div>`
      : empty(
          'book',
          'Sua história começa na primeira prática.',
          'Complete uma atividade para acompanhar seu progresso por aqui.',
          button('Começar agora', 'start-daily'),
        )
  }`;
}
function settingsView() {
  return `${heading('DEIXE COM A SUA CARA', 'Seu espaço de aprendizado.', 'Ajuste seu perfil, conecte a IA e cuide da sua jornada.')}${apiQuickLinks()}<div class="settings-grid"><section class="card settings-card"><h2>${icon('leaf', 22)} Seu perfil</h2><form id="profile-form"><label>Como podemos te chamar?<input name="name" maxlength="30" value="${esc(state.name)}" required></label><label>Meu nível de inglês<select name="level">${Object.entries(
    levels,
  )
    .map(
      ([k, v]) =>
        `<option value="${k}" ${state.level === k ? 'selected' : ''}>${k} — ${v}</option>`,
    )
    .join(
      '',
    )}</select></label><label>Minha meta diária<select name="goal">${[20, 30, 50, 100].map((n) => `<option value="${n}" ${state.goal === n ? 'selected' : ''}>${n} XP · ${n <= 30 ? 'Leve' : n <= 50 ? 'Regular' : 'Intensa'}</option>`).join('')}</select></label><button class="btn primary" type="submit">Salvar preferências ${icon('check', 17)}</button></form></section>${apiSettingsView()}<section class="card settings-card backup-card"><h2>${icon('download', 22)} Sua jornada, com você</h2><p>O progresso é salvo neste navegador, neste dispositivo. Exporte uma cópia para guardar ou continuar em outro navegador.</p><div class="form-actions">${button(`${icon('download', 16)} Exportar backup`, 'export', 'outline')}<label class="btn outline file-btn">${icon('upload', 16)} Importar backup<input id="import-backup" type="file" accept="application/json,.json" hidden></label></div></section></div>`;
}
function apiQuickLinks() {
  return `<section class="card key-shortcuts" aria-labelledby="key-shortcuts-title"><div><h2 id="key-shortcuts-title">Crie sua chave de IA</h2><p>Links diretos para os painéis oficiais. Crie a chave no serviço escolhido e cole na configuração abaixo.</p></div><div class="key-shortcut-grid">${Object.entries(
    providers,
  )
    .map(
      ([id, p]) =>
        `<a class="key-shortcut" href="${p.keyUrl}" target="_blank" rel="noopener noreferrer"><span>${icon('key', 20)}<strong>${p.name}</strong></span><small>${id === 'openai' ? 'API paga' : 'Tem cota gratuita'}</small><span class="key-shortcut-action">Criar minha chave ↗</span></a>`,
    )
    .join('')}</div></section>`;
}
function apiSettingsView() {
  const selected = providers[provider];
  return `<section class="card settings-card api-card"><div class="card-top"><h2>${icon('key', 22)} Inteligência artificial</h2><span class="pill ${apiKey ? 'connected' : ''}">${apiKey ? 'CHAVE CONFIGURADA' : 'SEM CHAVE'}</span></div><p>Escolha sua IA. As trilhas prontas e as explicações continuam disponíveis sem chave.</p><form id="api-form"><label>Provedor de inteligência artificial<select id="ai-provider" name="provider">${Object.entries(
    providers,
  )
    .map(
      ([id, p]) =>
        `<option value="${id}" ${id === provider ? 'selected' : ''}>${p.name} ${id === 'openai' ? '· API paga' : '· cota gratuita'}</option>`,
    )
    .join(
      '',
    )}</select></label><div class="provider-guide"><span class="pill">${selected.badge}</span><p>${selected.description}</p><ol>${selected.steps.map((step) => `<li>${step}</li>`).join('')}</ol><a class="btn outline" href="${selected.keyUrl}" target="_blank" rel="noopener noreferrer">Criar minha chave em ${selected.name} ↗</a><p class="provider-note">${selected.note}</p><a class="external-link" href="${selected.docsUrl}" target="_blank" rel="noopener noreferrer">Ver cotas e condições oficiais ↗</a></div><label>Sua chave de API de ${selected.name}<div class="password-field"><input name="key" id="api-key" type="password" autocomplete="off" placeholder="${selected.placeholder}" value="${esc(apiKey)}"><button type="button" class="text-button" data-action="toggle-key">Mostrar</button></div></label><label>Modelo<input name="model" value="${esc(model)}" placeholder="${selected.model}" required maxlength="180"></label><button type="button" class="text-button" id="suggested-model">Usar modelo sugerido: ${selected.model}</button><div class="key-note">${icon('key', 16)}<span>Cada provedor usa sua própria chave. As chaves ficam somente nesta sessão, fora do progresso e dos backups. O material é enviado diretamente ao provedor escolhido quando você gera exercícios. O site não troca de provedor automaticamente.</span></div><div class="form-actions"><button class="btn primary" type="submit">Salvar chave</button><button class="btn outline" type="button" data-action="test-key">Testar conexão</button>${apiKey ? '<button type="button" class="text-button danger" data-action="remove-key">Remover</button>' : ''}</div><p id="api-status" role="status"></p></form></section>`;
}
function bindApiForm() {
  if (!$('#api-form')) return;
  $('.api-card')
    .querySelectorAll('[data-action]')
    .forEach((el) => (el.onclick = () => action(el.dataset.action, el)));
  $('#ai-provider').onchange = (e) => {
    if (!validProvider(e.target.value)) return;
    provider = e.target.value;
    sessionStorage.setItem('bloom.ai.provider', provider);
    loadProvider();
    $('.api-card').outerHTML = apiSettingsView();
    bindApiForm();
  };
  $('#suggested-model').onclick = () => {
    $('[name="model"]').value = providers[provider].model;
  };
  $('#api-form').onsubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target),
      key = form.get('key').trim(),
      nextModel = form.get('model').trim();
    try {
      connectionRequest({ provider, key: key || 'validate-model', model: nextModel });
    } catch (error) {
      toast(error.message);
      return;
    }
    apiKey = key;
    model = nextModel;
    sessionStorage.setItem('bloom.ai.provider', provider);
    sessionStorage.setItem(`bloom.ai.${provider}.key`, apiKey);
    sessionStorage.setItem(`bloom.ai.${provider}.model`, model);
    $('.api-card').outerHTML = apiSettingsView();
    bindApiForm();
    toast('Configuração salva nesta sessão.');
  };
}
function empty(ic, title, description, action) {
  return `<section class="empty-state"><span class="empty-icon">${icon(ic, 34)}</span><h2>${title}</h2><p>${description}</p>${action || ''}</section>`;
}

function navigate(p) {
  page = p;
  query = '';
  filter = 'Todos';
  location.hash = p;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function bind() {
  document
    .querySelectorAll('[data-page]')
    .forEach((el) => (el.onclick = () => navigate(el.dataset.page)));
  document
    .querySelectorAll('[data-action]')
    .forEach((el) => (el.onclick = () => action(el.dataset.action, el)));
  document
    .querySelectorAll('[data-topic]')
    .forEach(
      (el) =>
        (el.onclick = () =>
          startQuiz(
            getQuestions(el.dataset.topic, state.level),
            topics.find((t) => t.id === el.dataset.topic).title,
            state.level,
            el.dataset.topic,
          )),
    );
  document
    .querySelectorAll('[data-practice]')
    .forEach(
      (el) =>
        (el.onclick = () =>
          startQuiz(
            topics
              .map((t) =>
                getQuestions(t.id, state.level).find((q) => q.type === el.dataset.practice),
              )
              .filter(Boolean),
            typeLabels[el.dataset.practice],
            state.level,
          )),
    );
  document.querySelectorAll('[data-filter]').forEach(
    (el) =>
      (el.onclick = () => {
        filter = el.dataset.filter;
        render();
      }),
  );
  document
    .querySelectorAll('[data-speak]')
    .forEach((el) => (el.onclick = () => speak(el.dataset.speak)));
  document.querySelectorAll('[data-review-one]').forEach(
    (el) =>
      (el.onclick = () => {
        const e = state.errors.find((e) => e.id === el.dataset.reviewOne);
        startQuiz([e.question], e.topic, e.level, null, 'review');
      }),
  );
  document.querySelectorAll('[data-delete-material]').forEach(
    (el) =>
      (el.onclick = () =>
        confirmDialog(
          'Excluir este material?',
          'As atividades já geradas continuam nas suas trilhas.',
          () => {
            state.materials = state.materials.filter((m) => m.id !== el.dataset.deleteMaterial);
            save();
            render();
          },
        )),
  );
  document.querySelectorAll('[data-view-material]').forEach(
    (el) =>
      (el.onclick = () => {
        const m = state.materials.find((m) => m.id === el.dataset.viewMaterial);
        openModal(esc(m.title), `<p class="material-full">${esc(m.content)}</p>`);
      }),
  );
  document.querySelectorAll('[data-delete-word]').forEach(
    (el) =>
      (el.onclick = () =>
        confirmDialog('Excluir esta palavra?', 'Ela será removida do seu vocabulário.', () => {
          state.words = state.words.filter((w) => w.id !== el.dataset.deleteWord);
          save();
          render();
        })),
  );
  if ($('#level'))
    $('#level').onchange = (e) => {
      state.level = e.target.value;
      save();
      render();
    };
  if ($('#topic-search'))
    $('#topic-search').oninput = (e) => {
      query = e.target.value;
      $('#topic-results').innerHTML = filteredTopics();
      document
        .querySelectorAll('[data-topic]')
        .forEach(
          (el) =>
            (el.onclick = () =>
              startQuiz(
                getQuestions(el.dataset.topic, state.level),
                topics.find((t) => t.id === el.dataset.topic).title,
                state.level,
                el.dataset.topic,
              )),
        );
    };
  if ($('#word-search'))
    $('#word-search').oninput = (e) => {
      const term = e.target.value.toLowerCase();
      $('#word-list').innerHTML = wordCards(
        state.words.filter((w) => (w.word + ' ' + w.translation).toLowerCase().includes(term)),
      );
      document
        .querySelectorAll('[data-speak]')
        .forEach((el) => (el.onclick = () => speak(el.dataset.speak)));
      document.querySelectorAll('[data-delete-word]').forEach(
        (el) =>
          (el.onclick = () =>
            confirmDialog('Excluir esta palavra?', 'Ela será removida do seu vocabulário.', () => {
              state.words = state.words.filter((w) => w.id !== el.dataset.deleteWord);
              save();
              render();
            })),
      );
    };
  if ($('#profile-form'))
    $('#profile-form').onsubmit = (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      state.name = f.get('name').trim() || 'Estudante';
      state.level = f.get('level');
      state.goal = Number(f.get('goal'));
      save();
      render();
      toast('Pronto! Seu espaço está do seu jeito.');
    };
  bindApiForm();
  if ($('#import-backup')) $('#import-backup').onchange = importBackup;
}
function action(a, el) {
  const actions = {
    'start-daily': () => {
      if (state.activeSession) {
        quiz = state.activeSession;
        showQuiz();
      } else {
        const next =
          topics.find((t) => !(state.completed[`${t.id}:${state.level}`]?.score >= 0.8)) ||
          topics[0];
        startQuiz(getQuestions(next.id, state.level), next.title, state.level, next.id);
      }
    },
    'new-material': () => materialModal(),
    'edit-material': () => materialModal(state.materials.find((m) => m.id === el.dataset.id)),
    'new-word': () => wordModal(),
    'go-learn': () => navigate('learn'),
    'review-start': () => {
      const due = state.errors.filter((e) => e.due <= Date.now());
      const pool = due.length ? due : state.errors;
      if (!pool.length) {
        navigate('review');
        toast('Seus erros e dúvidas aparecerão aqui. Vamos continuar praticando!');
        return;
      }
      startQuiz(
        pool.slice(0, 12).map((e) => e.question),
        'Revisão inteligente',
        state.level,
        null,
        'review',
      );
    },
    'save-word-day': () =>
      addWord(
        'serendipity',
        'descoberta feliz por acaso',
        'Learning brought a little serendipity into my day.',
      ),
    'generate-material': () =>
      generateMaterial(state.materials.find((m) => m.id === el.dataset.id)),
    'custom-start': () => {
      const c = state.custom.find((c) => c.id === el.dataset.id);
      startQuiz(c.questions, c.title, c.level, c.id);
    },
    menu: () => $('.sidebar').classList.toggle('open'),
    'toggle-key': () => {
      const inp = $('#api-key');
      inp.type = inp.type === 'password' ? 'text' : 'password';
      el.textContent = inp.type === 'password' ? 'Mostrar' : 'Ocultar';
    },
    'remove-key': () => {
      apiKey = '';
      sessionStorage.removeItem(`bloom.ai.${provider}.key`);
      render();
      toast('Chave removida desta sessão.');
    },
    'test-key': testKey,
    export: exportBackup,
    flashcards: () => {
      wordIndex = 0;
      flipped = false;
      showFlashcard();
    },
    'vocab-quiz': () => {
      if (!state.words.length) return;
      startQuiz(
        shuffle(state.words)
          .slice(0, 12)
          .map((w) => ({
            type: 'write',
            prompt: `Escreva em inglês: “${w.translation}”`,
            answer: w.word,
            explanation: w.example || `${w.word} significa ${w.translation}.`,
            wordId: w.id,
          })),
        'Vocabulário livre',
        state.level,
        null,
        'vocab',
      );
    },
  };
  actions[a]?.();
}

let lastFocus;
function openModal(title, body, cls = '') {
  $('#app').inert = true;
  const existing = $('.modal');
  if (['quiz-modal', 'flashcard-modal'].includes(cls) && existing?.classList.contains(cls)) {
    existing.setAttribute('aria-label', title);
    existing.querySelector('.modal-head h2').innerHTML = title;
    existing.querySelector('.modal-body').innerHTML = body;
    existing.scrollTop = 0;
    $('.close-modal').onclick = closeModal;
    existing.querySelector('.modal-body input, .modal-body button')?.focus({ preventScroll: true });
    return;
  }
  lastFocus = document.activeElement;
  $('#modal-root').innerHTML =
    `<div class="modal-backdrop"><section class="modal ${cls}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-head"><div><span class="eyebrow">SEU ESPAÇO BLOOM</span><h2>${title}</h2></div><button class="icon-button close-modal" aria-label="Fechar">${icon('close', 23)}</button></div><div class="modal-body">${body}</div></section></div>`;
  $('.close-modal').onclick = closeModal;
  $('.modal-backdrop').onclick = (e) => {
    if (e.target === $('.modal-backdrop') && !quiz) closeModal();
  };
  $('.modal input, .modal textarea, .modal button')?.focus({ preventScroll: true });
}
function closeModal() {
  if (generating) {
    toast('Aguarde a geração terminar.');
    return;
  }
  const wasQuiz = Boolean(quiz);
  if (wasQuiz) {
    state.activeSession = quiz;
    save();
  }
  $('#modal-root').innerHTML = '';
  $('#app').inert = false;
  quiz = null;
  if (wasQuiz) render();
  lastFocus?.focus();
}
document.addEventListener('keydown', (e) => {
  if (!$('.modal')) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    closeModal();
  }
  if (e.key === 'Tab') {
    const els = [
      ...$('.modal').querySelectorAll('button:not([disabled]),input,select,textarea,a[href]'),
    ].filter((el) => el.offsetParent !== null);
    if (!els.length) return;
    if (e.shiftKey && document.activeElement === els[0]) {
      e.preventDefault();
      els.at(-1).focus();
    } else if (!e.shiftKey && document.activeElement === els.at(-1)) {
      e.preventDefault();
      els[0].focus();
    }
  }
});
function confirmDialog(title, description, callback) {
  openModal(
    title,
    `<p>${description}</p><div class="form-actions">${button('Cancelar', 'cancel', 'outline')}${button('Excluir', 'confirm', 'danger-button')}</div>`,
  );
  $('[data-action="cancel"]').onclick = closeModal;
  $('[data-action="confirm"]').onclick = () => {
    callback();
    closeModal();
    toast('Excluído.');
  };
}
function wordModal(word = '', translation = '', example = '') {
  openModal(
    'Uma nova palavra para sua coleção.',
    `<form id="word-form"><div class="form-row"><label>Palavra ou expressão em inglês<input name="word" value="${esc(word)}" placeholder="Ex.: looking forward to" required maxlength="120"></label><label>Significado em português<input name="translation" value="${esc(translation)}" placeholder="Ex.: ansioso por" required maxlength="200"></label></div><label>Uma frase de exemplo <span class="subtle">(opcional)</span><textarea name="example" rows="3" maxlength="500" placeholder="I’m looking forward to our next lesson.">${esc(example)}</textarea></label><button class="btn primary" type="submit">${icon('plus', 17)} Adicionar ao vocabulário</button></form>`,
  );
  $('#word-form').onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    if (!f.get('word').trim() || !f.get('translation').trim()) return;
    addWord(f.get('word').trim(), f.get('translation').trim(), f.get('example').trim());
    closeModal();
    if (page === 'vocab') render();
  };
}
function addWord(word, translation, example = '') {
  if (state.words.some((w) => w.word.toLowerCase() === word.toLowerCase())) {
    toast('Essa palavra já está na sua coleção.');
    return;
  }
  state.words.push({ id: uid(), word, translation, example, correct: 0 });
  save();
  toast('Palavra guardada no seu vocabulário. 🌱');
}
function materialModal(existing = null) {
  openModal(
    existing ? 'Editar material' : 'O que vamos aprender hoje?',
    `<form id="material-form"><div class="form-row"><label>Título ou tema<input name="title" placeholder="Ex.: Pedindo um café em Londres" required maxlength="120"></label><label>Nível<select name="level">${Object.entries(
      levels,
    )
      .map(
        ([k, v]) =>
          `<option value="${k}" ${k === state.level ? 'selected' : ''}>${k} · ${v}</option>`,
      )
      .join(
        '',
      )}</select></label></div><label>Texto, anotações ou o que você quer estudar<textarea name="content" id="material-content" rows="6" maxlength="30000" placeholder="Cole seu conteúdo ou descreva o tema. Ex.: Quero praticar como pedir um café, escolher o tamanho e perguntar o preço." required></textarea></label><label class="file-drop">${icon('upload', 24)}<span><strong>Importar um arquivo</strong><small>TXT ou Markdown · até 200 KB e 30 mil caracteres</small></span><input id="material-file" type="file" accept=".txt,.md,text/plain,text/markdown" hidden></label><div class="form-row"><label>Quantidade de questões<select name="count"><option>6</option><option>12</option><option>18</option></select></label><fieldset class="type-fieldset"><legend>Tipos de exercício</legend><div>${Object.entries(
      typeLabels,
    )
      .map(
        ([k, v]) => `<label><input type="checkbox" name="types" value="${k}" checked> ${v}</label>`,
      )
      .join(
        '',
      )}</div></fieldset></div><p class="form-note">${icon('key', 15)} ${apiKey ? `A geração usa sua chave de ${providers[provider].name}.` : 'Você pode salvar agora e conectar sua chave em Configurações para gerar depois.'}</p><div class="form-actions"><button class="btn outline" name="intent" value="save" type="submit">${existing ? 'Salvar alterações' : 'Salvar material'}</button><button class="btn primary" name="intent" value="generate" type="submit">${icon('bolt', 16)} Salvar e gerar exercícios</button></div><div id="generation-status" role="status"></div></form>`,
    'wide-modal',
  );
  if (existing) {
    const form = $('#material-form');
    form.elements.title.value = existing.title;
    form.elements.content.value = existing.content;
    form.elements.level.value = existing.level;
    form.elements.count.value = String(existing.count || 6);
    form.querySelectorAll('[name="types"]').forEach((input) => {
      input.checked = (existing.types || Object.keys(typeLabels)).includes(input.value);
    });
    const note = document.createElement('p');
    note.className = 'form-note';
    note.textContent =
      'As alterações serão usadas nas próximas gerações. As trilhas já criadas e seu progresso continuam salvos.';
    form.querySelector('.form-actions').before(note);
  }
  $('#material-file').onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 200000) {
      toast('Escolha um arquivo de até 200 KB.');
      return;
    }
    const content = await f.text();
    if (content.length > 30000) {
      toast(
        'O texto excede 30 mil caracteres. Importe um trecho menor para preservar todo o conteúdo.',
      );
      return;
    }
    $('#material-content').value = content;
    if (!$('[name="title"]').value) $('[name="title"]').value = f.name.replace(/\.[^.]+$/, '');
    toast('Conteúdo importado. Revise antes de salvar.');
  };
  $('#material-form').onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target),
      types = f.getAll('types');
    if (!types.length) {
      toast('Escolha pelo menos um tipo de exercício.');
      return;
    }
    if (!f.get('title').trim() || !f.get('content').trim()) {
      toast('Preencha o título e o conteúdo.');
      return;
    }
    const m = {
      ...(existing || {}),
      id: existing?.id || uid(),
      title: f.get('title').trim(),
      content: f.get('content').trim(),
      level: f.get('level'),
      count: Number(f.get('count')),
      types,
      date: existing?.date || new Date().toISOString(),
    };
    if (existing)
      state.materials = state.materials.map((item) => (item.id === existing.id ? m : item));
    else state.materials.push(m);
    save();
    if (e.submitter.value === 'generate' && apiKey) await generateMaterial(m);
    else {
      closeModal();
      navigate('materials');
      toast(
        e.submitter.value === 'generate'
          ? 'Material salvo. Configure sua chave de API para gerar os exercícios.'
          : existing
            ? 'Material atualizado na sua biblioteca.'
            : 'Material salvo na sua biblioteca.',
      );
    }
  };
}

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function startQuiz(questions, title, level, topicId = null, mode = 'lesson') {
  quiz = {
    questions: questions.map((q) => ({
      ...q,
      options: q.options ? shuffle(q.options) : undefined,
      tokens: q.words ? shuffle(q.words.map((word, id) => ({ word, id }))) : undefined,
    })),
    title,
    level,
    topicId,
    mode,
    index: 0,
    correct: 0,
    earned: 0,
    checked: false,
    selected: '',
    selectedTokens: [],
    lastCorrect: false,
    helpUsed: false,
    helpOpen: false,
  };
  state.activeSession = quiz;
  save();
  showQuiz();
}
function showQuiz() {
  if (quiz.index >= quiz.questions.length) {
    finishQuiz();
    return;
  }
  const q = quiz.questions[quiz.index];
  const n = quiz.questions.length;
  openModal(
    esc(quiz.title),
    `<div class="quiz-top"><span class="pill">${esc(quiz.level)} · ${typeLabels[q.type]}</span><span>${quiz.index + 1} de ${n} exercícios</span></div>${progress((quiz.index / n) * 100, 'quiz-progress')}<div class="quiz-question"><span class="quiz-mascot">${icon(q.type === 'reading' ? 'book' : q.type === 'order' ? 'puzzle' : q.type === 'match' ? 'cards' : 'leaf', 28)}</span><h3>${esc(q.prompt)}</h3>${quizHelpHTML(q)}${q.passage ? `<div class="reading-passage"><div class="card-top"><span class="eyebrow">LEIA O TEXTO</span><button class="icon-button" id="read-passage" aria-label="Ouvir texto">${icon('volume', 19)}</button></div><p>${esc(q.passage)}</p></div>` : ''}${
      q.options
        ? `<div class="answer-options">${q.options.map((o, i) => `<button class="answer-option ${quiz.selected === o ? 'selected' : ''}" data-option="${i}" ${quiz.checked ? 'disabled' : ''}><span class="option-letter">${i + 1}</span>${esc(o)}</button>`).join('')}</div>`
        : q.type === 'order'
          ? `<div class="sentence-built" id="sentence-built" aria-label="Sua frase"><span class="sentence-placeholder" ${quiz.selectedTokens.length ? 'hidden' : ''}>Toque nas palavras para formar sua frase.</span>${renderSelectedWords(q)}</div><div class="word-bank">${q.tokens
              .map(
                (t) =>
                  `<span class="word-slot ${quiz.selectedTokens.includes(t.id) ? 'is-used' : ''}" data-word-slot="${t.id}"><span class="word-token word-token-placeholder" aria-hidden="true" ${quiz.selectedTokens.includes(t.id) ? '' : 'hidden'}>${esc(t.word)}</span><button class="word-token" data-token="${t.id}" ${quiz.checked || quiz.selectedTokens.includes(t.id) ? 'disabled' : ''}>${esc(t.word)}</button></span>`,
              )
              .join(
                '',
              )}</div><p class="form-note">Toque nas palavras para montar a frase. Toque novamente para remover.</p>`
          : `<label class="answer-label">Sua resposta<input id="quiz-answer" class="quiz-input" placeholder="${q.type === 'fill' ? 'Digite a palavra que falta…' : 'Escreva sua resposta em inglês…'}" value="${esc(quiz.selected)}" autocomplete="off" spellcheck="false" ${quiz.checked ? 'disabled' : ''}></label>`
    }</div><div id="quiz-feedback" aria-live="polite">${quiz.checked ? feedbackHTML(q) : ''}</div><div class="quiz-bottom"><span>${icon('bolt', 16)} ${quiz.earned} XP nesta prática</span><button class="btn primary" id="check-answer" ${q.options && !quiz.checked ? 'hidden' : ''} ${!quiz.checked && !hasAnswer() ? 'disabled' : ''}>${quiz.checked ? (quiz.index === n - 1 ? 'Ver resultado' : 'Continuar') : 'Verificar'} ${icon('arrow', 17)}</button></div>`,
    'quiz-modal',
  );
  $('.close-modal').onclick = () => {
    state.activeSession = quiz;
    save();
    closeModal();
    render();
    toast('Seu ponto de parada foi salvo. Continue quando quiser.');
  };
  document.querySelectorAll('[data-option]').forEach(
    (el) =>
      (el.onclick = () => {
        if (quiz.checked) return;
        quiz.selected = q.options[Number(el.dataset.option)];
        checkAnswer();
      }),
  );
  if (q.type === 'order') {
    $('#sentence-built').style.minHeight =
      `${Math.max(78, $('.word-bank').getBoundingClientRect().height + 28)}px`;
    $('.quiz-question').onclick = (event) => {
      const token = event.target.closest('[data-token], [data-remove-token]');
      if (!token || quiz.checked) return;
      const modal = $('.quiz-modal'),
        scrollTop = modal.scrollTop;
      const adding = token.hasAttribute('data-token');
      const id = Number(adding ? token.dataset.token : token.dataset.removeToken);
      const slot = $(`[data-word-slot="${id}"]`);
      if (adding) {
        if (quiz.selectedTokens.includes(id)) return;
        quiz.selectedTokens.push(id);
        token.disabled = true;
        slot.classList.add('is-used');
        slot.querySelector('.word-token-placeholder').hidden = false;
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'word-token placed';
        chip.dataset.removeToken = id;
        chip.textContent = q.tokens.find((value) => value.id === id).word;
        $('#sentence-built').append(chip);
        if (event.detail === 0) chip.focus({ preventScroll: true });
      } else {
        quiz.selectedTokens = quiz.selectedTokens.filter((value) => value !== id);
        slot.classList.remove('is-used');
        slot.querySelector('.word-token-placeholder').hidden = true;
        const bankToken = slot.querySelector('[data-token]');
        bankToken.disabled = false;
        token.remove();
        if (event.detail === 0) bankToken.focus({ preventScroll: true });
      }
      $('.sentence-placeholder').hidden = quiz.selectedTokens.length > 0;
      $('#check-answer').disabled = !hasAnswer();
      modal.scrollTop = scrollTop;
      state.activeSession = quiz;
      save();
    };
  }
  if ($('#quiz-answer')) {
    $('#quiz-answer').oninput = (e) => {
      quiz.selected = e.target.value;
      $('#check-answer').disabled = !hasAnswer();
    };
    $('#quiz-answer').onkeydown = (e) => {
      if (e.key === 'Enter' && hasAnswer()) checkAnswer();
    };
  }
  if ($('#read-passage')) $('#read-passage').onclick = () => speak(q.passage);
  $('#quiz-help-toggle').onclick = () => {
    quiz.helpOpen = !quiz.helpOpen;
    if (quiz.helpOpen && !quiz.helpUsed) {
      const entry = scheduleDoubt(state, q, quiz.title, quiz.level);
      quiz.helpUsed = true;
      quiz.helpDue = entry.due;
    }
    $('#quiz-help-panel').hidden = !quiz.helpOpen;
    $('#quiz-help-toggle').setAttribute('aria-expanded', String(quiz.helpOpen));
    $('#quiz-help-toggle').innerHTML =
      `${icon('book', 16)} ${quiz.helpOpen ? 'Fechar explicação' : 'Tenho uma dúvida'}`;
    $('#quiz-help-note').textContent = helpReviewNote();
    state.activeSession = quiz;
    save();
  };
  $('#check-answer').onclick = () => (quiz.checked ? nextQuestion() : checkAnswer());
  bindQuizFeedback(q);
  if (quiz.checked) $('#check-answer').focus({ preventScroll: true });
}
function helpReviewNote() {
  return quiz.helpUsed
    ? `Revisão agendada para ${new Date(quiz.helpDue).toLocaleDateString('pt-BR')}, mesmo se você acertar.`
    : 'Ao consultar, este ponto entra na sua revisão futura.';
}
function quizHelpHTML(q) {
  const help = exerciseHelp(q);
  return `<div class="quiz-help-controls"><button type="button" class="text-button" id="quiz-help-toggle" aria-expanded="${Boolean(quiz.helpOpen)}" aria-controls="quiz-help-panel">${icon('book', 16)} ${quiz.helpOpen ? 'Fechar explicação' : 'Tenho uma dúvida'}</button><span id="quiz-help-note">${esc(helpReviewNote())}</span></div><section id="quiz-help-panel" class="quiz-help-panel" aria-labelledby="quiz-help-title" ${quiz.helpOpen ? '' : 'hidden'}><span class="eyebrow">VAMOS ENTENDER JUNTOS</span><h4 id="quiz-help-title">${esc(help.title)}</h4><p>${esc(help.intro)}</p>${help.formula ? `<div class="help-formula">${esc(help.formula)}</div>` : ''}${help.steps.length ? `<ol>${help.steps.map((step) => `<li>${esc(step)}</li>`).join('')}</ol>` : ''}${help.example ? `<div class="help-example"><strong>Exemplo explicado</strong><p>${esc(help.example)}</p></div>` : ''}<p class="help-review-reminder">Consultar uma explicação faz parte do aprendizado. Você poderá tentar novamente na revisão, sem ajuda.</p></section>`;
}
function bindQuizFeedback(q) {
  if ($('#save-quiz-word'))
    $('#save-quiz-word').onclick = () => {
      const current = quiz;
      quiz = null;
      wordModal(q.vocab || q.answer, '');
      $('.close-modal').onclick = () => {
        closeModal();
        quiz = current;
        showQuiz();
      };
      $('#word-form').addEventListener('submit', () => {
        quiz = current;
        showQuiz();
      });
    };
}
function hasAnswer() {
  return quiz.questions[quiz.index].type === 'order'
    ? quiz.selectedTokens.length > 0
    : quiz.selected.trim().length > 0;
}
function renderSelectedWords(q) {
  return quiz.selectedTokens.length
    ? quiz.selectedTokens
        .map(
          (id) =>
            `<button class="word-token placed" data-remove-token="${id}" ${quiz.checked ? 'disabled' : ''}>${esc(q.tokens.find((t) => t.id === id).word)}</button>`,
        )
        .join('')
    : '';
}
function feedbackHTML(q) {
  return `<div class="quiz-feedback ${quiz.lastCorrect ? 'correct' : 'incorrect'}"><span>${icon(quiz.lastCorrect ? 'check' : 'refresh', 23)}</span><div><strong>${quiz.lastCorrect ? 'Muito bem! Mais um passo.' : 'Tudo bem. Vamos entender juntos.'}</strong>${!quiz.lastCorrect ? `<p>Resposta: <b>${esc(q.answer)}</b></p>` : ''}<p>${esc(q.explanation)}</p><button class="text-button" id="save-quiz-word">${icon('plus', 14)} Guardar no vocabulário</button></div></div>`;
}
function checkAnswer() {
  if (quiz.checked || !hasAnswer()) return;
  const q = quiz.questions[quiz.index],
    answer =
      q.type === 'order'
        ? quiz.selectedTokens.map((id) => q.tokens.find((t) => t.id === id).word).join(' ')
        : quiz.selected;
  const correct = recordAnswer(state, q, answer, quiz.title, quiz.level, {
    assisted: Boolean(quiz.helpUsed),
  });
  quiz.checked = true;
  quiz.lastCorrect = correct;
  quiz.correct += Number(correct);
  quiz.earned += correct ? 10 : 2;
  if (q.wordId) {
    const w = state.words.find((w) => w.id === q.wordId);
    if (w) w.correct = correct ? (w.correct || 0) + 1 : Math.max(0, (w.correct || 0) - 1);
  }
  state.activeSession = quiz;
  save();
  document.querySelectorAll('[data-option]').forEach((el) => {
    el.classList.toggle('selected', q.options[Number(el.dataset.option)] === quiz.selected);
    el.disabled = true;
  });
  document.querySelectorAll('.word-token, #quiz-answer').forEach((el) => {
    el.disabled = true;
  });
  $('#quiz-feedback').innerHTML = feedbackHTML(q);
  $('.quiz-bottom > span').innerHTML = `${icon('bolt', 16)} ${quiz.earned} XP nesta prática`;
  const nextButton = $('#check-answer');
  nextButton.hidden = false;
  nextButton.disabled = false;
  nextButton.innerHTML = `${quiz.index === quiz.questions.length - 1 ? 'Ver resultado' : 'Continuar'} ${icon('arrow', 17)}`;
  bindQuizFeedback(q);
  nextButton.focus({ preventScroll: true });
}
function nextQuestion() {
  quiz.index++;
  quiz.checked = false;
  quiz.selected = '';
  quiz.selectedTokens = [];
  quiz.helpUsed = false;
  quiz.helpOpen = false;
  quiz.helpDue = null;
  state.activeSession = quiz;
  save();
  showQuiz();
}
function finishQuiz() {
  const result = { ...quiz };
  if (result.topicId) {
    const key = `${result.topicId}:${result.level}`;
    state.completed[key] = {
      score: Math.max(state.completed[key]?.score || 0, result.correct / result.questions.length),
      date: Date.now(),
    };
  }
  state.history.push({
    title: result.title,
    level: result.level,
    correct: result.correct,
    total: result.questions.length,
    date: new Date().toISOString(),
  });
  state.activeSession = null;
  const levelIndex = Object.keys(levels).indexOf(result.level),
    advance =
      topics.every((t) => state.completed[`${t.id}:${result.level}`]?.score >= 0.8) &&
      levelIndex < 3;
  if (advance && state.level === result.level) state.level = Object.keys(levels)[levelIndex + 1];
  save();
  quiz = null;
  render();
  openModal(
    'Mais um passo na sua jornada.',
    `<div class="result"><div class="result-flower">${flower}</div><span class="eyebrow">PRÁTICA CONCLUÍDA</span><h3>${result.correct / result.questions.length >= 0.8 ? 'Você está florescendo!' : 'Cada tentativa faz você crescer.'}</h3><p>${esc(result.title)} · ${esc(result.level)}</p><div class="result-stats"><div><strong>${result.correct}/${result.questions.length}</strong><span>acertos</span></div><div><strong>+${result.earned}</strong><span>XP conquistados</span></div><div><strong>${streak(state.days)}</strong><span>dias de sequência</span></div></div>${advance ? `<div class="soft-callout">${icon('star')}<p>Novo capítulo! Seu nível agora é <strong>${state.level}</strong>. Você pode trocar quando quiser.</p></div>` : ''}<p class="subtle">${result.correct < result.questions.length ? 'Seus erros e dúvidas estão guardados na revisão inteligente.' : 'Continue praticando para consolidar o que aprendeu.'}</p><div class="form-actions">${button('Continuar explorando', 'result-close')}${button('Revisar meus erros', 'result-review', 'outline')}</div></div>`,
  );
  $('[data-action="result-close"]').onclick = closeModal;
  $('[data-action="result-review"]').onclick = () => {
    closeModal();
    navigate('review');
  };
}
function showFlashcard() {
  const w = state.words[wordIndex];
  if ($('.flashcard-modal')) {
    const card = $('#flip-card');
    card.classList.toggle('flipped', flipped);
    card.querySelector('.eyebrow').textContent = flipped ? 'SIGNIFICADO' : 'COMO VOCÊ DIRIA?';
    card.querySelector('strong').textContent = flipped ? w.translation : w.word;
    card.querySelector('p').textContent = w.example ? `“${w.example}”` : '';
    card.querySelector('p').hidden = !flipped || !w.example;
    card.querySelector('small').textContent =
      `Toque para ${flipped ? 'ver a palavra' : 'revelar o significado'}`;
    $('.flashcard-modal .quiz-top > span:last-child').textContent =
      `${wordIndex + 1} de ${state.words.length}`;
    return;
  }
  openModal(
    'Uma palavra de cada vez.',
    `<div class="quiz-top"><span class="pill">VOCABULÁRIO LIVRE</span><span>${wordIndex + 1} de ${state.words.length}</span></div><button id="flip-card" class="flashcard ${flipped ? 'flipped' : ''}"><span class="eyebrow">${flipped ? 'SIGNIFICADO' : 'COMO VOCÊ DIRIA?'}</span><strong>${esc(flipped ? w.translation : w.word)}</strong><p ${flipped && w.example ? '' : 'hidden'}>${esc(w.example ? `“${w.example}”` : '')}</p><small>Toque para ${flipped ? 'ver a palavra' : 'revelar o significado'}</small></button><button class="text-button flash-audio" id="flash-audio">${icon('volume', 18)} Ouvir pronúncia</button><div class="form-actions centered">${button('Vou revisar', 'flash-again', 'outline')}${button(`${icon('check', 17)} Eu sabia`, 'flash-know')}</div><p class="subtle center">Avalie sua memória. Os acertos ajudam a acompanhar seu domínio.</p>`,
    'flashcard-modal',
  );
  $('#flip-card').onclick = () => {
    flipped = !flipped;
    showFlashcard();
  };
  $('#flash-audio').onclick = () => speak(state.words[wordIndex].word);
  $('[data-action="flash-again"]').onclick = () => {
    const current = state.words[wordIndex];
    current.correct = Math.max(0, (current.correct || 0) - 1);
    nextFlashcard();
  };
  $('[data-action="flash-know"]').onclick = () => {
    if (!flipped) {
      toast('Revele o significado primeiro para conferir.');
      return;
    }
    const current = state.words[wordIndex];
    current.correct = (current.correct || 0) + 1;
    nextFlashcard();
  };
}
function nextFlashcard() {
  save();
  if (wordIndex >= state.words.length - 1) {
    closeModal();
    render();
    toast('Coleção revisada. Cada palavra é uma nova possibilidade!');
  } else {
    wordIndex++;
    flipped = false;
    showFlashcard();
  }
}
function speak(text) {
  if (!('speechSynthesis' in window)) {
    toast('Este navegador não oferece pronúncia em voz alta.');
    return;
  }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.85;
  const voice = speechSynthesis.getVoices().find((v) => v.lang.startsWith('en'));
  if (voice) u.voice = voice;
  u.onerror = () => toast('A pronúncia não está disponível neste dispositivo agora.');
  speechSynthesis.speak(u);
}

async function testKey() {
  const key = $('#api-key').value.trim(),
    m = $('[name="model"]').value.trim();
  if (!key) {
    toast('Adicione a chave deste provedor para testar.');
    return;
  }
  const el = $('[data-action="test-key"]');
  el.disabled = true;
  $('#api-status').textContent = 'Testando sua conexão…';
  try {
    const message = await testConnection({ provider, key, model: m });
    $('#api-status').textContent = message + ' Salve a chave para ativar.';
  } catch (e) {
    $('#api-status').textContent =
      e.name === 'TimeoutError'
        ? 'A conexão demorou demais. Tente novamente.'
        : e.message === 'Failed to fetch'
          ? 'Não foi possível conectar. Verifique sua internet.'
          : e.message;
  } finally {
    el.disabled = false;
  }
}
async function generateMaterial(material) {
  if (generating) {
    toast('Já existe uma geração em andamento.');
    return;
  }
  if (!apiKey) {
    navigate('settings');
    toast('Escolha um provedor e adicione sua chave para gerar atividades.');
    return;
  }
  openModal('Preparando novas descobertas.', `<div id="generation-status" role="status"></div>`);
  generating = true;
  $('#generation-status').innerHTML =
    `<div class="generation-loading"><span class="spinner"></span><strong>Transformando seu material em aprendizado…</strong><p>Criando ${material.count || 6} exercícios no nível ${esc(material.level)}. Pode levar alguns instantes.</p></div>`;
  const settings = { provider, key: apiKey, model };
  try {
    const questions = await generateLesson(settings, material);
    if (
      !Array.isArray(questions) ||
      questions.length !== (material.count || 6) ||
      !questions.every(validateQuestion)
    )
      throw new Error(
        'Os exercícios vieram em um formato incompleto. Seu material está salvo; tente gerar novamente.',
      );
    const normalized = questions.map((q) => {
      const item = { ...q };
      if (!['choice', 'reading', 'match'].includes(q.type)) delete item.options;
      if (q.type !== 'order') delete item.words;
      if (q.type !== 'reading') delete item.passage;
      return item;
    });
    const lesson = {
      id: uid(),
      title: material.title,
      level: material.level,
      questions: normalized,
      materialId: material.id,
      date: new Date().toISOString(),
    };
    state.custom.push(lesson);
    save();
    generating = false;
    closeModal();
    navigate('learn');
    toast('Sua trilha personalizada está pronta!');
    startQuiz(lesson.questions, lesson.title, lesson.level, lesson.id);
  } catch (e) {
    generating = false;
    $('#generation-status').innerHTML =
      `<div class="generation-error"><strong>Seu material está salvo.</strong><p>${esc(e.name === 'TimeoutError' ? 'A geração demorou demais. Tente novamente.' : e.message === 'Failed to fetch' ? 'Não foi possível conectar ao provedor selecionado. Verifique sua conexão e tente novamente.' : e.message)}</p><button type="button" class="btn outline" id="generation-retry">Tentar novamente</button><button type="button" class="text-button" id="generation-library">Ir para minha biblioteca</button></div>`;
    $('#generation-retry').onclick = () => generateMaterial(material);
    $('#generation-library').onclick = () => {
      closeModal();
      navigate('materials');
    };
  }
}
function exportBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }),
    url = URL.createObjectURL(blob),
    a = document.createElement('a');
  a.href = url;
  a.download = `bloom-backup-${dayKey()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Seu backup foi exportado sem a chave de API.');
}
async function importBackup(e) {
  const file = e.target.files[0];
  if (!file) return;
  try {
    if (file.size > 10000000) throw new Error();
    const data = JSON.parse(await file.text());
    if (!validateBackup(data)) throw new Error();
    openModal(
      'Restaurar sua jornada?',
      `<p>O backup de <strong>${esc(data.name)}</strong> tem ${data.words.length} palavras e ${data.materials.length} materiais. Ele substituirá o progresso atual deste navegador.</p><div class="form-actions">${button('Cancelar', 'cancel', 'outline')}${button('Restaurar backup', 'restore')}</div>`,
    );
    $('[data-action="cancel"]').onclick = closeModal;
    $('[data-action="restore"]').onclick = () => {
      state = Object.fromEntries(Object.keys(defaultState()).map((key) => [key, data[key]]));
      state.activeSession = null;
      save();
      closeModal();
      render();
      toast('Sua jornada foi restaurada.');
    };
  } catch {
    toast('Este arquivo não é um backup válido do Bloom.');
  }
  e.target.value = '';
}
function readHash() {
  const p = location.hash.slice(1);
  if (['home', 'learn', 'materials', 'review', 'vocab', 'stats', 'settings'].includes(p)) page = p;
}
window.addEventListener('hashchange', () => {
  readHash();
  render();
});
readHash();
render();
