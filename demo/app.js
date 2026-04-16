const chatEl = document.getElementById('chat');
const techEl = document.getElementById('tech');
const playBtn = document.getElementById('play');
const resetBtn = document.getElementById('reset');
const scenarioSel = document.getElementById('scenario');
const speedSel = document.getElementById('speed');
const inTokensEl = document.getElementById('inTokens');
const outTokensEl = document.getElementById('outTokens');
const costEl = document.getElementById('cost');

// Precio ilustrativo tipo Claude Sonnet: $3/M input, $15/M output
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

function resetMeter() {
  totalIn = 0;
  totalOut = 0;
  updateMeter();
}

let currentTimer = null;
let isPlaying = false;
let currentIndex = 0;
let currentSteps = [];

function clearAll() {
  chatEl.innerHTML = '';
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

function removeTyping() {
  const t = chatEl.querySelector('.typing');
  if (t) t.remove();
}

function scrollBottom(el) {
  el.scrollTop = el.scrollHeight;
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatBubble(text) {
  const lines = escapeHtml(text).split('\n');
  const out = [];
  let listType = null;

  const closeList = () => {
    if (listType) { out.push(`</${listType}>`); listType = null; }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const ol = line.match(/^\s*(\d+)[\.\)]\s+(.*)$/);
    const ul = line.match(/^\s*[•\-\*]\s+(.*)$/);
    if (ol) {
      if (listType !== 'ol') { closeList(); out.push('<ol>'); listType = 'ol'; }
      out.push(`<li>${ol[2]}</li>`);
    } else if (ul) {
      if (listType !== 'ul') { closeList(); out.push('<ul>'); listType = 'ul'; }
      out.push(`<li>${ul[1]}</li>`);
    } else if (line === '') {
      closeList();
      out.push('');
    } else {
      closeList();
      out.push(line);
    }
  }
  closeList();

  // join non-list lines with <br>, keep blank lines as paragraph break
  let html = '';
  let buf = [];
  const flush = () => {
    if (buf.length) { html += `<p>${buf.join('<br>')}</p>`; buf = []; }
  };
  for (const part of out) {
    if (part.startsWith('<ol>') || part.startsWith('<ul>') || part.startsWith('<li>') || part.startsWith('</ol>') || part.startsWith('</ul>')) {
      flush();
      html += part;
    } else if (part === '') {
      flush();
    } else {
      buf.push(part);
    }
  }
  flush();

  // inline: **bold**, *italic*, `code`
  html = html
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');

  return html;
}

function renderUserStep(step) {
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
  } else if (step.type === 'assistant-stream') {
    removeTyping();
    const div = document.createElement('div');
    div.className = 'bubble assistant';
    chatEl.appendChild(div);
    const tokens = step.content.split(/(\s+)/);
    let i = 0;
    const speed = parseFloat(speedSel.value);
    const tick = () => {
      if (i < tokens.length) {
        div.innerHTML = formatBubble(tokens.slice(0, i + 1).join('')) + '<span class="cursor">▍</span>';
        i++;
        scrollBottom(chatEl);
        setTimeout(tick, (step.tokenDelay || 60) * speed);
      } else {
        div.innerHTML = formatBubble(step.content);
      }
    };
    tick();
  }
  scrollBottom(chatEl);
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

function playStep() {
  if (currentIndex >= currentSteps.length) {
    stop();
    return;
  }
  const step = currentSteps[currentIndex];
  const speed = parseFloat(speedSel.value);
  const wait = (step.delay || 600) * speed;

  currentTimer = setTimeout(() => {
    if (step.side === 'user') renderUserStep(step);
    else renderTechStep(step);
    currentIndex++;
    if (isPlaying) playStep();
  }, wait);
}

function play() {
  if (isPlaying) {
    stop();
    return;
  }
  if (currentIndex >= currentSteps.length) {
    clearAll();
    currentSteps = SCENARIOS[scenarioSel.value];
  }
  if (currentSteps.length === 0) {
    currentSteps = SCENARIOS[scenarioSel.value];
  }
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

// init
currentSteps = SCENARIOS[scenarioSel.value];
