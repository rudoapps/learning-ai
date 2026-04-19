const chatEl = document.getElementById('chat');
const techEl = document.getElementById('tech');
const vdbGridEl = document.getElementById('vdb-grid');
const vdbMetaEl = document.getElementById('vdb-meta');
const vdbQueryEl = document.getElementById('vdb-query');
const vqVecEl = document.getElementById('vq-vec');
const playBtn = document.getElementById('play');
const resetBtn = document.getElementById('reset');
const scenarioSel = document.getElementById('scenario');
const speedSel = document.getElementById('speed');
const inTokensEl = document.getElementById('inTokens');
const outTokensEl = document.getElementById('outTokens');
const costEl = document.getElementById('cost');

const CONCEPT_LINKS = {
  basic: 'rag', nomatch: 'rag', chunking: 'rag',
  ambiguous: 'rag', rerank: 'rag', hybrid: 'rag'
};

const PRICE_IN = 3 / 1_000_000;
const PRICE_OUT = 15 / 1_000_000;
let totalIn = 0, totalOut = 0;

function updateMeter() {
  inTokensEl.textContent = totalIn.toLocaleString('es-ES');
  outTokensEl.textContent = totalOut.toLocaleString('es-ES');
  const cost = totalIn * PRICE_IN + totalOut * PRICE_OUT;
  costEl.textContent = '$' + cost.toFixed(4);
}
function pulse(el) { el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); }
function addTokens(inT, outT) {
  if (inT) { totalIn += inT; pulse(inTokensEl); }
  if (outT) { totalOut += outT; pulse(outTokensEl); }
  if (inT || outT) { pulse(costEl); updateMeter(); }
}
function resetMeter() { totalIn = 0; totalOut = 0; updateMeter(); }

let currentTimer = null;
let isPlaying = false;
let currentIndex = 0;
let currentScenario = null;
let currentSteps = [];

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function scoreClass(s) {
  if (s >= 0.6) return 'high';
  if (s >= 0.35) return 'med';
  return 'low';
}

function renderKB(scenario) {
  vdbGridEl.innerHTML = '';
  const kb = scenario.knowledgeBase || [];
  vdbMetaEl.textContent = kb.length ? `${kb.length} chunks · dim 1536` : 'sin documentos';
  for (const c of kb) {
    const el = document.createElement('div');
    el.className = 'vdb-chunk active';
    el.dataset.id = c.id;
    el.innerHTML = `
      <div class="vdb-chunk-title">${escapeHtml(c.title)}</div>
      <div class="vdb-chunk-text">${escapeHtml(c.text)}</div>
      <div class="vdb-chunk-score"></div>
      <div class="vdb-chunk-bar"></div>
    `;
    vdbGridEl.appendChild(el);
  }
  vdbQueryEl.style.display = 'none';
}

function clearAll() {
  chatEl.innerHTML = '';
  techEl.innerHTML = '';
  vdbGridEl.innerHTML = '';
  vdbQueryEl.style.display = 'none';
  currentIndex = 0;
  resetMeter();
  if (currentScenario) renderKB(currentScenario);
}

function stop() {
  if (currentTimer) clearTimeout(currentTimer);
  currentTimer = null;
  isPlaying = false;
  playBtn.textContent = '▶ Reproducir';
}

function scrollBottom(el) { el.scrollTop = el.scrollHeight; }

function removeTyping() {
  const t = chatEl.querySelector('.typing');
  if (t) t.remove();
}

function renderSources(ids) {
  const kb = (currentScenario.knowledgeBase || []);
  const chips = ids.map(id => {
    const c = kb.find(x => x.id === id);
    return `<span class="source-chip">📄 ${escapeHtml(c ? c.title : id)}</span>`;
  }).join('');
  return `<div class="sources"><span class="sources-label">Fuentes citadas</span>${chips}</div>`;
}

function formatBubble(text) {
  return escapeHtml(text).replace(/\n/g, '<br>');
}

function renderChatStep(step) {
  if (step.type === 'user-message') {
    removeTyping();
    const div = document.createElement('div');
    div.className = 'bubble user';
    div.innerHTML = formatBubble(step.content);
    chatEl.appendChild(div);
  } else if (step.type === 'typing') {
    removeTyping();
    const div = document.createElement('div');
    div.className = 'typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    chatEl.appendChild(div);
  } else if (step.type === 'assistant-message') {
    removeTyping();
    const div = document.createElement('div');
    div.className = 'bubble assistant' + (step.variant === 'no-info' ? ' no-info' : '');
    let html = formatBubble(step.content);
    if (step.sources && step.sources.length) html += renderSources(step.sources);
    div.innerHTML = html;
    chatEl.appendChild(div);
  }
  scrollBottom(chatEl);
}

function renderVdbStep(step) {
  const chunks = vdbGridEl.querySelectorAll('.vdb-chunk');

  if (step.type === 'embed-query') {
    vdbQueryEl.style.display = 'block';
    vqVecEl.textContent = step.vector || '[0.12, -0.44, 0.88, ..., 0.03]  (1536 dim)';
    vdbQueryEl.classList.remove('pulse'); void vdbQueryEl.offsetWidth; vdbQueryEl.classList.add('pulse');
  } else if (step.type === 'score') {
    chunks.forEach(ch => {
      const id = ch.dataset.id;
      const score = step.scores[id];
      const scoreEl = ch.querySelector('.vdb-chunk-score');
      const barEl = ch.querySelector('.vdb-chunk-bar');
      if (score === undefined) return;
      const cls = scoreClass(score);
      ch.classList.remove('scored', 'high', 'med', 'low', 'selected');
      ch.classList.add('scored', cls);
      scoreEl.className = 'vdb-chunk-score ' + cls;
      scoreEl.textContent = score.toFixed(2);
      barEl.style.width = Math.round(score * 100) + '%';
      ch.classList.add('pulse');
    });
  } else if (step.type === 'select') {
    chunks.forEach(ch => {
      if (step.topk.includes(ch.dataset.id)) ch.classList.add('selected');
      else ch.classList.remove('selected');
    });
  } else if (step.type === 'reset') {
    vdbQueryEl.style.display = 'none';
    chunks.forEach(ch => {
      ch.classList.remove('scored', 'high', 'med', 'low', 'selected');
      const bar = ch.querySelector('.vdb-chunk-bar');
      const sc = ch.querySelector('.vdb-chunk-score');
      if (bar) bar.style.width = '0';
      if (sc) sc.textContent = '';
    });
  } else if (step.type === 'rerank') {
    // second-stage: keep only step.topk, show new scores
    chunks.forEach(ch => {
      const id = ch.dataset.id;
      if (!step.topk.includes(id)) {
        ch.classList.add('scored', 'low');
        ch.classList.remove('selected', 'high', 'med');
        return;
      }
      const score = step.scores[id];
      const cls = scoreClass(score);
      const scoreEl = ch.querySelector('.vdb-chunk-score');
      const barEl = ch.querySelector('.vdb-chunk-bar');
      ch.classList.remove('low', 'med', 'high');
      ch.classList.add('scored', cls, 'selected');
      scoreEl.className = 'vdb-chunk-score ' + cls;
      scoreEl.textContent = score.toFixed(2);
      barEl.style.width = Math.round(score * 100) + '%';
      ch.classList.add('pulse');
    });
  }
}

function renderTechStep(step) {
  const block = document.createElement('div');
  block.className = `tech-block ${step.type}`;
  const label = document.createElement('div');
  label.className = 'label';
  let right = '';
  if (step.inTokens) right += `<span class="token-badge in">↓ ${step.inTokens}</span>`;
  if (step.outTokens) right += `<span class="token-badge out">↑ ${step.outTokens}</span>`;
  if (step.tag && !right) right = `<span class="tag">${step.tag}</span>`;
  else if (step.tag) right = `<span class="tag">${step.tag}</span>` + right;
  label.innerHTML = `<span>${step.label || step.type}</span><span>${right}</span>`;
  addTokens(step.inTokens || 0, step.outTokens || 0);
  const body = document.createElement('div');
  body.className = 'body';
  body.textContent = step.content;
  block.appendChild(label);
  block.appendChild(body);
  techEl.appendChild(block);
  scrollBottom(techEl);
}

function showLearnMore() {
  const cid = CONCEPT_LINKS[scenarioSel.value];
  if (!cid) return;
  const link = document.createElement('div');
  link.className = 'tech-block info';
  link.innerHTML = `<div class="label"><span>🔬 Aprende más</span></div><div class="body"><a href="../concepts/${cid}/index.html" style="color:var(--purple);text-decoration:none;font-weight:600;">Ver animación interactiva de RAG →</a></div>`;
  techEl.appendChild(link);
  scrollBottom(techEl);
}

function playStep() {
  if (currentIndex >= currentSteps.length) { stop(); showLearnMore(); return; }
  const step = currentSteps[currentIndex];
  const speed = parseFloat(speedSel.value);
  const wait = (step.delay || 600) * speed;

  currentTimer = setTimeout(() => {
    if (step.side === 'chat') renderChatStep(step);
    else if (step.side === 'vdb') renderVdbStep(step);
    else renderTechStep(step);
    currentIndex++;
    if (isPlaying) playStep();
  }, wait);
}

function loadScenario() {
  currentScenario = SCENARIOS[scenarioSel.value];
  currentSteps = currentScenario.steps;
  renderKB(currentScenario);
}

function play() {
  if (isPlaying) { stop(); return; }
  if (currentIndex >= currentSteps.length) {
    clearAll();
    loadScenario();
  }
  if (currentSteps.length === 0) loadScenario();
  isPlaying = true;
  playBtn.textContent = '⏸ Pausar';
  playStep();
}

function reset() {
  stop();
  clearAll();
  loadScenario();
}

playBtn.addEventListener('click', play);
resetBtn.addEventListener('click', reset);
scenarioSel.addEventListener('change', reset);

loadScenario();
