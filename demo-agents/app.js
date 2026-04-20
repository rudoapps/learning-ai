const chatEl = document.getElementById('chat');
const techEl = document.getElementById('tech');
const lanesEl = document.getElementById('lanes');
const playBtn = document.getElementById('play');
const resetBtn = document.getElementById('reset');
const scenarioSel = document.getElementById('scenario');
const speedSel = document.getElementById('speed');
const inTokensEl = document.getElementById('inTokens');
const outTokensEl = document.getElementById('outTokens');
const costEl = document.getElementById('cost');

const CONCEPT_LINKS = {
  parallel: 'subagents', sequential: 'agent',
  isolated: 'subagents', recover: 'agent'
};

const PRICE_IN = 3 / 1_000_000;
const PRICE_OUT = 15 / 1_000_000;
let totalIn = 0, totalOut = 0;
let agentTokens = {}; // agentId → {in, out}

function updateMeter() {
  inTokensEl.textContent = totalIn.toLocaleString('es-ES');
  outTokensEl.textContent = totalOut.toLocaleString('es-ES');
  const cost = totalIn * PRICE_IN + totalOut * PRICE_OUT;
  costEl.textContent = '$' + cost.toFixed(4);
}
function pulse(el) { if (!el) return; el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); }

function addAgentTokens(agentId, inT, outT) {
  if (!agentId) return;
  if (!agentTokens[agentId]) agentTokens[agentId] = { in: 0, out: 0 };
  agentTokens[agentId].in += inT || 0;
  agentTokens[agentId].out += outT || 0;
  const laneEl = lanesEl.querySelector(`.lane[data-id="${agentId}"] .lh-tokens`);
  if (laneEl) {
    const t = agentTokens[agentId];
    laneEl.textContent = `↓${t.in}  ↑${t.out}`;
  }
}

function addTokens(inT, outT, agentId) {
  if (inT) { totalIn += inT; pulse(inTokensEl); }
  if (outT) { totalOut += outT; pulse(outTokensEl); }
  if (inT || outT) { pulse(costEl); updateMeter(); addAgentTokens(agentId, inT, outT); }
}
function resetMeter() {
  totalIn = 0; totalOut = 0; agentTokens = {};
  updateMeter();
}

let currentTimer = null;
let isPlaying = false;
let currentIndex = 0;
let currentScenario = null;
let currentSteps = [];

function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function renderLanes(scenario) {
  lanesEl.innerHTML = '';
  for (const ag of (scenario.agents || [])) {
    const lane = document.createElement('div');
    lane.className = 'lane idle';
    lane.dataset.id = ag.id;
    lane.dataset.tint = ag.tint || 'accent';
    lane.innerHTML = `
      <div class="lane-head">
        <div class="lh-row">
          <span class="lh-icon">${ag.icon}</span>
          <span class="lh-name">${escapeHtml(ag.name)}</span>
        </div>
        <div class="lh-role">${escapeHtml(ag.role || '')}</div>
        <div class="lh-tokens">↓0  ↑0</div>
      </div>
      <div class="lane-timeline"></div>
    `;
    lanesEl.appendChild(lane);
  }
}

function clearAll() {
  chatEl.innerHTML = '';
  techEl.innerHTML = '';
  currentIndex = 0;
  resetMeter();
  if (currentScenario) renderLanes(currentScenario);
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

function formatBubble(text) { return escapeHtml(text).replace(/\n/g, '<br>'); }

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
    div.className = 'bubble assistant';
    div.innerHTML = formatBubble(step.content);
    chatEl.appendChild(div);
  }
  scrollBottom(chatEl);
}

function renderLaneStep(step) {
  const lane = lanesEl.querySelector(`.lane[data-id="${step.agent}"]`);
  if (!lane) return;
  lane.classList.remove('idle');

  if (step.type === 'activate') {
    lane.classList.add('active');
    return;
  }
  if (step.type === 'done') {
    lane.classList.remove('active');
    lane.classList.add('done');
    return;
  }
  if (step.type === 'arrow') {
    const arrow = document.createElement('span');
    arrow.className = 'lane-arrow';
    arrow.textContent = step.dir === 'down' ? '↓' : '↑';
    lane.appendChild(arrow);
    setTimeout(() => arrow.remove(), 900);
    return;
  }

  const timeline = lane.querySelector('.lane-timeline');
  const ev = document.createElement('span');
  ev.className = `lane-event ${step.type}`;
  if (step.working) ev.classList.add('working');
  const detail = step.detail ? `<span class="ev-detail">${escapeHtml(step.detail)}</span>` : '';
  ev.innerHTML = `${escapeHtml(step.label || step.type)}${detail}`;
  timeline.appendChild(ev);

  lane.classList.add('active');
  timeline.scrollLeft = timeline.scrollWidth;

  addTokens(step.inTokens || 0, step.outTokens || 0, step.agent);
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
  link.innerHTML = `<div class="label"><span>🔬 Aprende más</span></div><div class="body"><a href="../concepts/${cid}/index.html" style="color:var(--orange);text-decoration:none;font-weight:600;">Ver animación interactiva →</a></div>`;
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
    else if (step.side === 'lane') renderLaneStep(step);
    else renderTechStep(step);
    currentIndex++;
    if (isPlaying) playStep();
  }, wait);
}

function loadScenario() {
  currentScenario = SCENARIOS[scenarioSel.value];
  currentSteps = currentScenario.steps;
  renderLanes(currentScenario);
}

function play() {
  if (isPlaying) { stop(); return; }
  if (currentIndex >= currentSteps.length) { clearAll(); loadScenario(); }
  if (currentSteps.length === 0) loadScenario();
  isPlaying = true;
  playBtn.textContent = '⏸ Pausar';
  playStep();
}

function reset() { stop(); clearAll(); loadScenario(); }

playBtn.addEventListener('click', play);
resetBtn.addEventListener('click', reset);
scenarioSel.addEventListener('change', reset);

loadScenario();
