const termEl = document.getElementById('term');
const techEl = document.getElementById('tech');
const playBtn = document.getElementById('play');
const resetBtn = document.getElementById('reset');
const scenarioSel = document.getElementById('scenario');
const speedSel = document.getElementById('speed');
const inTokensEl = document.getElementById('inTokens');
const outTokensEl = document.getElementById('outTokens');
const costEl = document.getElementById('cost');

const CONCEPT_LINKS = {
  list: 'tools', read: 'tools',
  edit: 'tools', bug: 'agent',
  test: 'agent', refactor: 'agent'
};

const PRICE_IN = 3 / 1_000_000;
const PRICE_OUT = 15 / 1_000_000;
let totalIn = 0;
let totalOut = 0;

function updateMeter() {
  inTokensEl.textContent = totalIn.toLocaleString('es-ES');
  outTokensEl.textContent = totalOut.toLocaleString('es-ES');
  const cost = totalIn * PRICE_IN + totalOut * PRICE_OUT;
  costEl.textContent = '$' + cost.toFixed(4);
}

function pulse(el) {
  el.classList.remove('pulse');
  void el.offsetWidth;
  el.classList.add('pulse');
}

function addTokens(inT, outT) {
  if (inT) { totalIn += inT; pulse(inTokensEl); }
  if (outT) { totalOut += outT; pulse(outTokensEl); }
  if (inT || outT) { pulse(costEl); updateMeter(); }
}

function resetMeter() { totalIn = 0; totalOut = 0; updateMeter(); }

let currentTimer = null;
let isPlaying = false;
let currentIndex = 0;
let currentSteps = [];

function clearAll() {
  termEl.innerHTML = '';
  techEl.innerHTML = '';
  currentIndex = 0;
  resetMeter();
}

function stop() {
  if (currentTimer) clearTimeout(currentTimer);
  currentTimer = null;
  isPlaying = false;
  playBtn.textContent = '▶ Reproducir';
}

function scrollBottom(el) { el.scrollTop = el.scrollHeight; }

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function removeTyping() {
  const t = termEl.querySelector('.typing-term');
  if (t) t.remove();
}

function renderTermStep(step) {
  removeTyping();

  if (step.type === 'user-cmd') {
    const div = document.createElement('div');
    div.className = 'term-line user-cmd';
    div.textContent = step.content;
    termEl.appendChild(div);
  } else if (step.type === 'thinking') {
    const div = document.createElement('div');
    div.className = 'typing-term';
    div.textContent = step.content || 'pensando';
    termEl.appendChild(div);
  } else if (step.type === 'tool') {
    const div = document.createElement('div');
    div.className = 'term-line tool';
    const body = step.body ? `<div class="tool-body">${escapeHtml(step.body)}</div>` : '';
    div.innerHTML = `<div class="tool-head">⏺ ${escapeHtml(step.head)}</div>${body}`;
    termEl.appendChild(div);
  } else if (step.type === 'approval') {
    const div = document.createElement('div');
    div.className = 'term-line approval';
    div.innerHTML = `<div class="ap-q">${escapeHtml(step.question)}</div><div class="ap-opts">[y] aceptar · [n] rechazar · [a] aceptar siempre</div>`;
    termEl.appendChild(div);
  } else if (step.type === 'approval-accepted') {
    const last = termEl.querySelector('.term-line.approval:not(.accepted)');
    if (last) {
      last.classList.add('accepted');
      last.querySelector('.ap-opts').textContent = `✓ ${step.choice || 'aceptado'}`;
    }
  } else if (step.type === 'diff') {
    const div = document.createElement('div');
    div.className = 'term-line diff';
    const parts = [];
    if (step.file) parts.push(`<div class="tool-head" style="color:var(--muted);font-size:11px;">${escapeHtml(step.file)}</div>`);
    for (const line of step.lines) {
      if (line.startsWith('-')) parts.push(`<span class="diff-minus">${escapeHtml(line)}</span>`);
      else if (line.startsWith('+')) parts.push(`<span class="diff-plus">${escapeHtml(line)}</span>`);
      else parts.push(`<span style="color:var(--muted);display:block;">${escapeHtml(line)}</span>`);
    }
    div.innerHTML = parts.join('');
    termEl.appendChild(div);
  } else if (step.type === 'status') {
    const div = document.createElement('div');
    div.className = 'term-line status';
    div.textContent = step.content;
    termEl.appendChild(div);
  } else if (step.type === 'assistant') {
    const div = document.createElement('div');
    div.className = 'term-line assistant';
    termEl.appendChild(div);
    const text = step.content;
    const speed = parseFloat(speedSel.value);
    let i = 0;
    const tick = () => {
      if (i < text.length) {
        const chunk = Math.max(1, Math.floor(Math.random() * 4));
        i = Math.min(text.length, i + chunk);
        div.innerHTML = escapeHtml(text.slice(0, i)) + '<span class="term-cursor"></span>';
        scrollBottom(termEl);
        setTimeout(tick, (step.tokenDelay || 28) * speed);
      } else {
        div.textContent = text;
      }
    };
    tick();
  } else if (step.type === 'summary') {
    const div = document.createElement('div');
    div.className = 'term-line summary';
    div.textContent = step.content;
    termEl.appendChild(div);
  } else if (step.type === 'err') {
    const div = document.createElement('div');
    div.className = 'term-line err';
    div.textContent = step.content;
    termEl.appendChild(div);
  }

  scrollBottom(termEl);
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
  const scenarioId = scenarioSel.value;
  const conceptId = CONCEPT_LINKS[scenarioId];
  if (!conceptId) return;
  const link = document.createElement('div');
  link.className = 'tech-block info';
  link.innerHTML = `<div class="label"><span>🔬 Aprende más</span></div><div class="body"><a href="../concepts/${conceptId}/index.html" style="color:var(--accent);text-decoration:none;font-weight:600;">Ver animación interactiva y explicación detallada →</a></div>`;
  techEl.appendChild(link);
  scrollBottom(techEl);
}

function playStep() {
  if (currentIndex >= currentSteps.length) {
    stop();
    showLearnMore();
    return;
  }
  const step = currentSteps[currentIndex];
  const speed = parseFloat(speedSel.value);
  const wait = (step.delay || 600) * speed;

  currentTimer = setTimeout(() => {
    if (step.side === 'term') renderTermStep(step);
    else renderTechStep(step);
    currentIndex++;
    if (isPlaying) playStep();
  }, wait);
}

function play() {
  if (isPlaying) { stop(); return; }
  if (currentIndex >= currentSteps.length) {
    clearAll();
    currentSteps = SCENARIOS[scenarioSel.value];
  }
  if (currentSteps.length === 0) currentSteps = SCENARIOS[scenarioSel.value];
  isPlaying = true;
  playBtn.textContent = '⏸ Pausar';
  playStep();
}

function reset() {
  stop();
  clearAll();
  currentSteps = SCENARIOS[scenarioSel.value];
}

playBtn.addEventListener('click', play);
resetBtn.addEventListener('click', reset);
scenarioSel.addEventListener('change', reset);

currentSteps = SCENARIOS[scenarioSel.value];
