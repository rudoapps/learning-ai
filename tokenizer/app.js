// ── Tokenizador heurístico (aproximación BPE) ────────────
// No usa la librería real de OpenAI/Anthropic — replica el
// comportamiento visible del BPE: espacios pegados al token
// siguiente, palabras comunes = 1 token, palabras largas se
// trocean, acentos y emojis cuestan más, código tiene muchos
// tokens. Conteo real ±10-15% del tokenizer oficial.

const COMMON_EN = new Set([
  'the','of','to','and','in','a','is','it','for','on','that','was','as',
  'with','by','at','be','this','from','or','have','an','not','are','but',
  'they','you','he','she','his','her','my','me','we','us','our','your',
  'all','can','will','one','if','do','so','up','out','no','yes','its',
  'has','had','were','been','being','said','says','say','i',
  'who','what','when','where','why','how','which','than','then','more',
  'some','any','many','much','most','other','also','just','very','only',
  'about','into','through','over','under','before','after','between','am',
  'because','while','since','until','though','although','however','would',
  'could','should','may','might','make','made','take','took','get','got',
  'go','went','see','saw','know','knew','think','thought','want','need'
]);

const COMMON_ES = new Set([
  'el','la','los','las','un','una','unos','unas','de','del','en','y','o',
  'a','que','es','son','fue','era','ser','con','por','para','sin','sobre',
  'no','si','lo','le','les','se','su','sus','este','esta','esto','ese',
  'esa','eso','aquel','tu','tus','mi','mis','yo','tú','él','nos',
  'pero','como','solo','aqui','alli','antes','despues','dónde','donde',
  'al','ya','o','u','muy','mas','menos','tan','tanto','poco','algo'
]);

const CONTROL_TOKENS = new Set([' ','  ','\n','\t']);

function tokenize(text) {
  const tokens = [];
  if (!text) return tokens;

  // Split en átomos: whitespace | letras | dígitos | otro carácter (uno a uno)
  const atoms = [];
  const re = /(\s+)|([A-Za-zÀ-ÿñÑ]+)|(\d+)|([\s\S])/gu;
  let m;
  while ((m = re.exec(text)) !== null) atoms.push(m[0]);

  let pendingSpace = '';
  const flushPending = () => {
    if (pendingSpace) {
      tokens.push({ text: pendingSpace, count: 1, type: 'ws' });
      pendingSpace = '';
    }
  };

  for (const atom of atoms) {
    // Whitespace
    if (/^\s+$/.test(atom)) {
      const newlines = (atom.match(/\n/g) || []).length;
      const tabs = (atom.match(/\t/g) || []).length;
      const spaces = atom.replace(/[\n\t]/g, '').length;

      for (let k = 0; k < newlines; k++) {
        flushPending();
        tokens.push({ text: '\n', count: 1, type: 'newline' });
      }
      for (let k = 0; k < tabs; k++) {
        flushPending();
        tokens.push({ text: '\t', count: 1, type: 'tab' });
      }
      if (spaces > 0) {
        if (pendingSpace) tokens.push({ text: pendingSpace, count: 1, type: 'ws' });
        // Un espacio queda pendiente para pegarse al siguiente token
        // El resto se emiten como tokens propios
        for (let k = 0; k < spaces - 1; k++) {
          tokens.push({ text: ' ', count: 1, type: 'ws' });
        }
        pendingSpace = ' ';
      }
      continue;
    }

    // Palabras (letras)
    if (/^[A-Za-zÀ-ÿñÑ]+$/.test(atom)) {
      const lower = atom.toLowerCase();
      const hasAccent = /[À-ÿñÑ]/.test(atom);
      const isCommon = !hasAccent && (COMMON_EN.has(lower) || COMMON_ES.has(lower));

      if (isCommon || (!hasAccent && atom.length <= 4) || (hasAccent && atom.length <= 3)) {
        tokens.push({ text: pendingSpace + atom, count: 1, type: 'word' });
      } else {
        const target = hasAccent ? 3 : 4;
        const chunks = chunkWord(atom, target);
        chunks.forEach((c, i) => {
          tokens.push({
            text: i === 0 ? pendingSpace + c : c,
            count: 1,
            type: 'subword'
          });
        });
      }
      pendingSpace = '';
      continue;
    }

    // Dígitos
    if (/^\d+$/.test(atom)) {
      const chunks = atom.match(/.{1,3}/g);
      chunks.forEach((c, i) => {
        tokens.push({
          text: i === 0 ? pendingSpace + c : c,
          count: 1,
          type: 'number'
        });
      });
      pendingSpace = '';
      continue;
    }

    // Carácter individual: puntuación ASCII / unicode / emoji
    const code = atom.codePointAt(0);
    if (code > 0x7F) {
      const utf8Bytes = new TextEncoder().encode(atom).length;
      let tokenCount;
      if (utf8Bytes >= 4) tokenCount = Math.max(2, Math.round(utf8Bytes / 2));
      else tokenCount = Math.max(1, Math.ceil(utf8Bytes / 2));
      tokens.push({
        text: pendingSpace + atom,
        count: tokenCount,
        type: utf8Bytes >= 4 ? 'emoji' : 'unicode'
      });
    } else {
      tokens.push({ text: pendingSpace + atom, count: 1, type: 'punct' });
    }
    pendingSpace = '';
  }

  flushPending();
  return tokens;
}

function chunkWord(word, target) {
  const chunks = [];
  let pos = 0;
  while (pos < word.length) {
    const remaining = word.length - pos;
    let len;
    if (remaining <= target) len = remaining;
    else if (remaining < target * 1.6) len = Math.ceil(remaining / 2);
    else len = target;
    chunks.push(word.slice(pos, pos + len));
    pos += len;
  }
  return chunks;
}

function totalTokenCount(tokens) {
  return tokens.reduce((sum, t) => sum + t.count, 0);
}

// ── Modelos y precios ($/1M tokens) ──────────────────────
// Precios actualizados a enero 2026. Verifica los oficiales
// antes de usar en producción — pueden cambiar.
const MODELS = [
  { id: 'haiku',        name: 'Claude Haiku 4.5',   family: 'Anthropic', input: 1.00,  output: 5.00,  cache: 0.10 },
  { id: 'sonnet',       name: 'Claude Sonnet 4.6',  family: 'Anthropic', input: 3.00,  output: 15.00, cache: 0.30 },
  { id: 'opus',         name: 'Claude Opus 4.7',    family: 'Anthropic', input: 15.00, output: 75.00, cache: 1.50 },
  { id: 'gpt4o-mini',   name: 'GPT-4o mini',        family: 'OpenAI',    input: 0.15,  output: 0.60,  cache: 0.075 },
  { id: 'gpt4o',        name: 'GPT-4o',             family: 'OpenAI',    input: 2.50,  output: 10.00, cache: 1.25 },
  { id: 'gpt5',         name: 'GPT-5',              family: 'OpenAI',    input: 5.00,  output: 15.00, cache: 1.25 },
  { id: 'gemini-flash', name: 'Gemini 2.5 Flash',   family: 'Google',    input: 0.30,  output: 2.50,  cache: 0.075 },
  { id: 'gemini-pro',   name: 'Gemini 2.5 Pro',     family: 'Google',    input: 1.25,  output: 10.00, cache: 0.31 },
  { id: 'llama-405',    name: 'Llama 3.1 405B',     family: 'Meta/host', input: 3.00,  output: 3.00,  cache: null },
];

function calcCost(inputTokens, outputTokens, model, useCache=false) {
  const inputPrice = useCache && model.cache != null ? model.cache : model.input;
  const inCost = (inputTokens / 1_000_000) * inputPrice;
  const outCost = (outputTokens / 1_000_000) * model.output;
  return { inCost, outCost, total: inCost + outCost };
}

function formatCost(c) {
  if (c === 0) return '$0';
  if (c < 0.0001) return '<$0.0001';
  if (c < 0.01) return '$' + c.toFixed(5);
  if (c < 1) return '$' + c.toFixed(4);
  return '$' + c.toFixed(2);
}

// ── Ejemplos ─────────────────────────────────────────────
const SAMPLES = {
  en: {
    label: '🇬🇧 Inglés',
    hint: 'Texto en inglés — la base "barata" del BPE',
    text: `The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.

In 2026, large language models process billions of tokens every day. A token is roughly four characters of English text — but the real number depends on the tokenizer.`
  },
  es: {
    label: '🇪🇸 Español',
    hint: 'Mismo concepto en español — más caro, ¿por qué?',
    text: `El veloz murciélago hindú comía feliz cardillo y kiwi. La cigüeña tocaba el saxofón detrás del palenque de paja.

En 2026, los grandes modelos de lenguaje procesan miles de millones de tokens al día. Un token equivale aproximadamente a cuatro caracteres de inglés — pero el número real depende del tokenizador.`
  },
  code: {
    label: '💻 Código',
    hint: 'JavaScript real — los símbolos cuestan tokens',
    text: `function calculateTotal(items, taxRate = 0.21) {
  const subtotal = items.reduce((acc, item) => {
    return acc + (item.price * item.quantity);
  }, 0);
  const tax = subtotal * taxRate;
  return {
    subtotal: subtotal.toFixed(2),
    tax: tax.toFixed(2),
    total: (subtotal + tax).toFixed(2)
  };
}`
  },
  json: {
    label: '📊 JSON',
    hint: 'Estructura típica de API — corchetes, comas, todo cuenta',
    text: `{
  "user": {
    "id": "u_4f8a92b1",
    "email": "ana@example.com",
    "preferences": {
      "language": "es-ES",
      "theme": "dark",
      "notifications": ["email", "push"]
    }
  },
  "metadata": {
    "createdAt": "2026-01-15T10:30:00Z",
    "lastLogin": "2026-05-02T08:12:34Z"
  }
}`
  },
  emojis: {
    label: '😀 Emojis',
    hint: 'Cada emoji = 2-4 tokens. Los flags son especialmente caros.',
    text: `¡Hola! 👋 Bienvenido a la demo 🎉

Estados: ✅ ❌ ⚠️ 🚀 💡 🔥
Banderas: 🇪🇸 🇺🇸 🇫🇷 🇯🇵 🇲🇽
Combinados: 👨‍👩‍👧‍👦 🏳️‍🌈 👩🏽‍💻

Los emojis "compuestos" (familia, profesión + tono de piel) usan ZWJ (zero-width joiner) y cuestan aún más.`
  },
  chinese: {
    label: '🌏 Chino',
    hint: 'CJK suele costar ~1.5-2 tokens por carácter',
    text: `人工智能正在改变世界。大型语言模型可以理解和生成多种语言的文本。

每个汉字通常需要1到2个token,这意味着中文比英文更"昂贵"。`
  },
  prompt: {
    label: '🎯 System prompt',
    hint: 'Un prompt típico de producción — mide su coste fijo',
    text: `You are a helpful customer support assistant for Acme Corp. Follow these rules:

1. Always greet the customer politely.
2. If asked about pricing, refer them to the pricing page at acme.com/pricing.
3. For technical issues, ask for: (a) the error message, (b) browser/OS, (c) steps to reproduce.
4. Never make promises about features that aren't documented.
5. If the question is outside your scope, transfer to a human agent.

Available tools: search_kb, create_ticket, lookup_order, transfer_to_human.

Tone: friendly but concise. Use the customer's language. Confirm understanding before resolving.`
  }
};

// ── UI ───────────────────────────────────────────────────
let currentTokens = [];
let outputTokens = 500;
let useCache = false;

function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

function colorForToken(text, type) {
  if (type === 'newline') return { bg: 'rgba(255,255,255,0.04)', fg: 'var(--muted)' };
  if (type === 'tab') return { bg: 'rgba(255,255,255,0.04)', fg: 'var(--muted)' };
  if (type === 'ws') return { bg: 'rgba(255,255,255,0.03)', fg: 'transparent' };
  // Hash-based color (consistent per token text)
  const palette = [
    { bg: 'rgba(88,166,255,0.18)',  fg: '#9cc7ff' },
    { bg: 'rgba(63,185,80,0.18)',   fg: '#7fd391' },
    { bg: 'rgba(247,129,102,0.18)', fg: '#f5a48d' },
    { bg: 'rgba(188,140,255,0.18)', fg: '#cfafff' },
    { bg: 'rgba(227,179,65,0.18)',  fg: '#e8c97a' },
    { bg: 'rgba(255,123,166,0.18)', fg: '#ffa1bd' },
    { bg: 'rgba(105,205,205,0.18)', fg: '#9ed8d8' },
  ];
  let h = 0;
  for (let i = 0; i < text.length; i++) h = ((h << 5) - h + text.charCodeAt(i)) | 0;
  return palette[Math.abs(h) % palette.length];
}

function renderTokens() {
  const container = $('#tokens');
  container.innerHTML = '';

  if (currentTokens.length === 0) {
    container.innerHTML = '<div class="tokens-empty">Empieza a escribir o elige un ejemplo.</div>';
    return;
  }

  currentTokens.forEach((tok, idx) => {
    const span = document.createElement('span');
    span.className = 'tok tok-' + tok.type;

    let display = tok.text;
    if (tok.type === 'newline') display = '↵\n';
    else if (tok.type === 'tab') display = '→';
    else if (tok.type === 'ws') display = '·';

    const color = colorForToken(tok.text, tok.type);
    span.style.background = color.bg;
    if (tok.type === 'ws' || tok.type === 'newline' || tok.type === 'tab') {
      span.style.color = 'var(--muted)';
      span.style.opacity = '0.6';
    }

    if (tok.count > 1) {
      span.innerHTML = `${escapeHtml(display)}<sup class="tok-mult">×${tok.count}</sup>`;
    } else {
      span.textContent = display;
    }

    span.title = `Token #${idx + 1} · "${tok.text.replace(/\n/g, '\\n').replace(/\t/g, '\\t')}" · ${tok.count} ${tok.count === 1 ? 'token' : 'tokens'}`;
    container.appendChild(span);

    if (tok.type === 'newline') {
      container.appendChild(document.createElement('br'));
    }
  });
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderStats() {
  const text = $('#input').value;
  const totalTokens = totalTokenCount(currentTokens);
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const ratio = totalTokens > 0 ? (chars / totalTokens).toFixed(2) : '—';

  $('#statTokens').textContent = totalTokens.toLocaleString('es-ES');
  $('#statChars').textContent = chars.toLocaleString('es-ES');
  $('#statWords').textContent = words.toLocaleString('es-ES');
  $('#statRatio').textContent = ratio;
}

function renderPrices() {
  const inputTokens = totalTokenCount(currentTokens);
  const tbody = $('#priceTable tbody');
  tbody.innerHTML = '';

  // Encontrar coste mínimo y máximo para barra visual
  const costs = MODELS.map(m => calcCost(inputTokens, outputTokens, m, useCache).total);
  const maxCost = Math.max(...costs);

  MODELS.forEach((m, i) => {
    const c = calcCost(inputTokens, outputTokens, m, useCache);
    const tr = document.createElement('tr');
    const barWidth = maxCost > 0 ? (c.total / maxCost) * 100 : 0;
    const inputPriceShown = useCache && m.cache != null ? m.cache : m.input;
    const cacheNote = useCache && m.cache != null ? ' <span class="cache-badge">cache</span>' : (useCache && m.cache == null ? ' <span class="cache-na">n/a</span>' : '');

    tr.innerHTML = `
      <td>
        <div class="model-name">${m.name}</div>
        <div class="model-family">${m.family}</div>
      </td>
      <td class="price-col">$${inputPriceShown.toFixed(2)}${cacheNote}<div class="sub">por 1M in</div></td>
      <td class="price-col">$${m.output.toFixed(2)}<div class="sub">por 1M out</div></td>
      <td class="cost-col">
        <div class="cost-val">${formatCost(c.total)}</div>
        <div class="cost-bar"><div class="cost-bar-fill" style="width:${barWidth}%"></div></div>
        <div class="sub">in ${formatCost(c.inCost)} · out ${formatCost(c.outCost)}</div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Escenarios prácticos
  renderScenarios(inputTokens, outputTokens);
}

function renderScenarios(inputTokens, outputTokens) {
  const scenarios = [
    { label: '1 llamada', mult: 1 },
    { label: '100 llamadas', mult: 100 },
    { label: '10 000 llamadas', mult: 10_000 },
    { label: '1 M llamadas', mult: 1_000_000 },
  ];
  const cheapest = MODELS.find(m => m.id === 'haiku');
  const mid = MODELS.find(m => m.id === 'sonnet');
  const flagship = MODELS.find(m => m.id === 'opus');

  const container = $('#scenarios');
  container.innerHTML = scenarios.map(s => {
    const cH = calcCost(inputTokens * s.mult, outputTokens * s.mult, cheapest, useCache).total;
    const cS = calcCost(inputTokens * s.mult, outputTokens * s.mult, mid, useCache).total;
    const cO = calcCost(inputTokens * s.mult, outputTokens * s.mult, flagship, useCache).total;
    return `
      <div class="scenario-card">
        <div class="sc-label">${s.label}</div>
        <div class="sc-row"><span>Haiku</span><span class="sc-val sc-good">${formatCost(cH)}</span></div>
        <div class="sc-row"><span>Sonnet</span><span class="sc-val">${formatCost(cS)}</span></div>
        <div class="sc-row"><span>Opus</span><span class="sc-val sc-bad">${formatCost(cO)}</span></div>
      </div>
    `;
  }).join('');
}

function update() {
  const text = $('#input').value;
  currentTokens = tokenize(text);
  renderTokens();
  renderStats();
  renderPrices();
}

function loadSample(key) {
  const s = SAMPLES[key];
  if (!s) return;
  $('#input').value = s.text;
  $('#sampleHint').textContent = s.hint;
  $$('#sampleButtons button').forEach(b => {
    b.classList.toggle('active', b.dataset.sample === key);
  });
  update();
}

document.addEventListener('DOMContentLoaded', () => {
  // Render sample buttons
  const btnContainer = $('#sampleButtons');
  Object.entries(SAMPLES).forEach(([key, s]) => {
    const b = document.createElement('button');
    b.dataset.sample = key;
    b.textContent = s.label;
    b.addEventListener('click', () => loadSample(key));
    btnContainer.appendChild(b);
  });

  // Output slider
  const slider = $('#outputSlider');
  const sliderVal = $('#outputValue');
  slider.addEventListener('input', () => {
    outputTokens = parseInt(slider.value, 10);
    sliderVal.textContent = outputTokens.toLocaleString('es-ES') + ' tokens';
    renderPrices();
  });

  // Cache toggle
  $('#cacheToggle').addEventListener('change', (e) => {
    useCache = e.target.checked;
    renderPrices();
  });

  // Input
  $('#input').addEventListener('input', update);

  // Clear
  $('#btnClear').addEventListener('click', () => {
    $('#input').value = '';
    $('#sampleHint').textContent = '';
    $$('#sampleButtons button').forEach(b => b.classList.remove('active'));
    update();
  });

  // Inicial
  loadSample('es');
});
