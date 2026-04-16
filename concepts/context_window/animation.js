const ANIMATIONS = {};

// ========== CONTEXT WINDOW ==========
ANIMATIONS.context_window = function(stage) {
  const maxTokens = 200000;
  const messages = [
    { role: 'system', text: 'System prompt: "Eres un asistente útil..."', tokens: 45 },
    { role: 'user', text: '¿Qué es la fotosíntesis?', tokens: 8 },
    { role: 'ai', text: 'La fotosíntesis es el proceso por el cual las plantas...', tokens: 85 },
    { role: 'user', text: 'Explícame más sobre la clorofila', tokens: 9 },
    { role: 'ai', text: 'La clorofila es el pigmento verde que absorbe...', tokens: 120 },
    { role: 'user', text: '¿Y la fase oscura del ciclo de Calvin?', tokens: 12 },
    { role: 'ai', text: 'El ciclo de Calvin ocurre en el estroma del cloroplasto...', tokens: 180 },
    { role: 'user', text: 'Dame un resumen de todo en formato tabla', tokens: 11 },
    { role: 'ai', text: '| Fase | Ubicación | Productos | ...\n(tabla con 5 filas detalladas)', tokens: 250 },
    { role: 'tools', text: '[Resultado de búsqueda web: 3 artículos, fragmentos largos...]', tokens: 1800 },
    { role: 'user', text: 'Ahora compara con la quimiosíntesis', tokens: 8 },
    { role: 'ai', text: '(Respuesta larga comparando los dos procesos, con ejemplos, bacterias...)', tokens: 320 },
  ];

  // Simulated jumps for drama
  const tokenJumps = [45, 53, 138, 147, 267, 279, 459, 470, 720, 2520, 2528, 2848];
  // Scale these up to show filling effect
  const scale = maxTokens / 5000;
  const scaledJumps = tokenJumps.map(t => Math.round(t * scale));

  stage.innerHTML = `
    <div class="stage-controls">
      <button id="cwGo" class="primary">▶ Simular conversación</button>
      <button id="cwReset">Reiniciar</button>
    </div>
    <div style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:4px;">
        <span>Contexto usado</span>
        <span id="cwCount">0 / 200.000 tokens</span>
      </div>
      <div style="height:28px;background:var(--surface-2);border-radius:8px;overflow:hidden;border:1px solid var(--border);">
        <div id="cwBar" style="height:100%;width:0%;background:linear-gradient(90deg,var(--accent),var(--purple));border-radius:8px;transition:width 0.5s,background 0.3s;"></div>
      </div>
      <div id="cwWarning" style="font-size:12px;margin-top:4px;min-height:18px;"></div>
    </div>
    <div class="tool-flow" id="cwFlow" style="max-height:340px;"></div>
  `;

  let currentMsg = 0;
  let totalTokens = 0;

  function updateBar() {
    const pct = (totalTokens / maxTokens) * 100;
    const bar = document.getElementById('cwBar');
    bar.style.width = pct + '%';
    if (pct > 85) bar.style.background = 'linear-gradient(90deg, #f85149, #f78166)';
    else if (pct > 60) bar.style.background = 'linear-gradient(90deg, var(--yellow), var(--orange))';
    else bar.style.background = 'linear-gradient(90deg, var(--accent), var(--purple))';
    document.getElementById('cwCount').textContent = totalTokens.toLocaleString('es') + ' / 200.000 tokens (' + pct.toFixed(0) + '%)';
    const warn = document.getElementById('cwWarning');
    if (pct > 85) warn.innerHTML = '🚨 <span style="color:#f85149;font-weight:600;">Cerca del límite — pronto habrá que compactar o empezar conversación nueva</span>';
    else if (pct > 60) warn.innerHTML = '⚠️ <span style="color:var(--yellow);">Conversación larga — cada turno cuesta más porque reenvía TODO el historial</span>';
    else warn.textContent = '';
  }

  const roleCls = { system: 'tf-exec', user: 'tf-user', ai: 'tf-answer', tools: 'tf-result' };
  const roleIcon = { system: '📋', user: '💬', ai: '🤖', tools: '🔧' };

  function reset() {
    currentMsg = 0;
    totalTokens = 0;
    updateBar();
    document.getElementById('cwFlow').innerHTML = '<div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver cómo se llena el contexto mensaje a mensaje</div></div>';
  }

  async function run() {
    if (currentMsg === 0) document.getElementById('cwFlow').innerHTML = '';
    while (currentMsg < messages.length) {
      const m = messages[currentMsg];
      totalTokens = scaledJumps[currentMsg];
      updateBar();
      const d = document.createElement('div');
      d.className = 'tf-step';
      d.innerHTML = `<div class="tf-label">${roleIcon[m.role]} ${m.role === 'ai' ? 'IA responde' : m.role === 'user' ? 'Usuario' : m.role === 'tools' ? 'Resultado de tool' : 'Sistema'} <span style="float:right;color:var(--muted);font-weight:400;">+${m.tokens} tok → ${totalTokens.toLocaleString('es')} total</span></div>
        <div class="tf-box ${roleCls[m.role]}"><pre>${m.text}</pre></div>`;
      document.getElementById('cwFlow').appendChild(d);
      document.getElementById('cwFlow').scrollTop = 99999;
      currentMsg++;
      await new Promise(r => setTimeout(r, 1000));
    }
    // Overflow message
    const warn = document.createElement('div');
    warn.className = 'tf-step';
    warn.innerHTML = `<div class="tf-label">💡 Observa</div><div class="tf-box tf-think"><pre>Cada nuevo mensaje del usuario reenvía TODO lo anterior como input.\nTurno 1: 45 tokens. Turno 6: 2.848 tokens.\nMisma pregunta, 60x más cara.\n\nSolución: compactar (resumir) o empezar conversación nueva.</pre></div>`;
    document.getElementById('cwFlow').appendChild(warn);
    document.getElementById('cwFlow').scrollTop = 99999;
  }

  document.getElementById('cwGo').addEventListener('click', run);
  document.getElementById('cwReset').addEventListener('click', reset);
  reset();
};

// ========== MINI: CONTEXT WINDOW 2 — what fits ==========
ANIMATIONS._cw2 = function(mount) {
  const items = [
    { icon: '💬', label: 'Un mensaje corto', tokens: 15, pct: 0.008 },
    { icon: '📧', label: 'Un email largo', tokens: 800, pct: 0.4 },
    { icon: '📄', label: '1 página A4', tokens: 500, pct: 0.25 },
    { icon: '📑', label: 'Un contrato (20 págs)', tokens: 10000, pct: 5 },
    { icon: '📖', label: 'Una novela (300 págs)', tokens: 80000, pct: 40 },
    { icon: '📚', label: 'Todo Harry Potter', tokens: 185000, pct: 92 },
    { icon: '🎬', label: '1h de transcripción', tokens: 12000, pct: 6 },
    { icon: '💻', label: 'Un repo medio (50 archivos)', tokens: 150000, pct: 75 },
  ];
  mount.innerHTML = '<div class="vtl" id="cw2Vtl"></div><div class="mini-controls"><button class="primary" id="cw2Go">▶ Mostrar</button></div>';
  function build() {
    document.getElementById('cw2Vtl').innerHTML = items.map((s, i) => `
      <div class="vtl-step s-result" id="cw2-s${i}">
        <div class="vtl-dot">${s.icon}</div>
        <div class="vtl-card">
          <div class="vtl-head">${s.label}</div>
          ~${s.tokens.toLocaleString('es')} tokens → <strong>${s.pct}%</strong> de una ventana de 200k
        </div>
      </div>`).join('');
  }
  async function run() {
    build();
    for (let i = 0; i < items.length; i++) {
      await new Promise(r => setTimeout(r, 500));
      document.getElementById('cw2-s' + i).classList.add('show');
    }
  }
  document.getElementById('cw2Go').addEventListener('click', run);
  build();
};
