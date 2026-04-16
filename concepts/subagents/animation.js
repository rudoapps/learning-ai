const ANIMATIONS = {};

// ========== SUBAGENTS ==========
ANIMATIONS.subagents = function(stage) {
  stage.innerHTML = `
    <div class="stage-controls">
      <button id="subGo" class="primary">▶ Reproducir</button>
      <button id="subReset">Reiniciar</button>
      <span style="font-size:12px;color:var(--muted);">Vista del Subagente A (vuelos) — su bucle interno</span>
    </div>
    <div class="agent-progress" id="subProgress"></div>
    <div class="tool-flow" id="subFlow">
      <div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver el trabajo interno de UN subagente</div></div>
    </div>
  `;

  const steps = [
    { phase: 'system', text: 'System prompt del subagente:\n"Eres un agente especializado en búsqueda de vuelos. Busca la mejor opción y devuelve un informe breve."' },
    { phase: 'task', text: 'Tarea recibida del orquestador:\n"Busca vuelo Madrid → Lisboa para el finde del mes que viene."' },
    { phase: 'think', iter: 1, text: 'Necesito buscar vuelos Madrid-Lisboa. Uso search_flights con las fechas.' },
    { phase: 'act', iter: 1, text: 'search_flights()\n{ "from": "MAD", "to": "LIS",\n  "depart": "2026-05-15", "return": "2026-05-17" }' },
    { phase: 'observe', iter: 1, text: '4 resultados:\n  TAP TP1023 → 118€ (directo)\n  Iberia IB3102 → 142€ (directo)\n  Ryanair FR5521 → 89€ (1 escala)\n  Air Europa UX1044 → 155€ (directo)' },
    { phase: 'think', iter: 2, text: 'El más barato es Ryanair pero tiene escala. El mejor calidad-precio directo es TAP por 118€. Verifico horarios.' },
    { phase: 'act', iter: 2, text: 'get_flight_details()\n{ "flight": "TP1023", "date": "2026-05-15" }' },
    { phase: 'observe', iter: 2, text: '{\n  "depart": "18:40 MAD",\n  "arrive": "19:10 LIS",\n  "return": "20:15 LIS → 23:45 MAD",\n  "price": 118\n}' },
    { phase: 'done', text: 'Informe para el orquestador:\nTAP TP1023, vie 18:40 → 19:10. Vuelta dom 20:15. 118€ i/v.\n\n→ Este informe es TODO lo que el orquestador recibe.\n   Las búsquedas intermedias quedan aquí, en el contexto aislado del subagente.' }
  ];

  const icons = { system: '📋', task: '📨', think: '🧠', act: '🔧', observe: '👁', done: '📤' };
  const labels = { system: 'Sistema', task: 'Tarea recibida', think: 'Pensar', act: 'Actuar', observe: 'Observar', done: 'Informe devuelto' };
  const cls = { system: 'tf-exec', task: 'tf-user', think: 'tf-think', act: 'tf-call', observe: 'tf-result', done: 'tf-answer' };

  async function run() {
    const flow = document.getElementById('subFlow');
    const progress = document.getElementById('subProgress');
    flow.innerHTML = '';
    progress.innerHTML = '';
    let lastIter = 0;
    for (const s of steps) {
      if (s.iter && s.iter > lastIter) {
        lastIter = s.iter;
        progress.innerHTML = `<div class="agent-iter">🔁 Iteración ${lastIter} del subagente</div>`;
      }
      if (s.phase === 'done') progress.innerHTML = `<div class="agent-iter agent-done">📤 Subagente terminado — devuelve informe</div>`;
      const d = document.createElement('div');
      d.className = 'tf-step';
      d.innerHTML = `<div class="tf-label">${icons[s.phase]} ${labels[s.phase]}</div><div class="tf-box ${cls[s.phase]}"><pre>${s.text}</pre></div>`;
      flow.appendChild(d);
      flow.scrollTop = flow.scrollHeight;
      await new Promise(r => setTimeout(r, s.phase === 'think' ? 1400 : 1000));
    }
  }

  document.getElementById('subGo').addEventListener('click', run);
  document.getElementById('subReset').addEventListener('click', () => {
    document.getElementById('subFlow').innerHTML = '<div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver el trabajo interno de UN subagente</div></div>';
    document.getElementById('subProgress').innerHTML = '';
  });
};


// ========== MINI: SUBAGENTS 2 (competitive analysis) — visual timeline ==========
ANIMATIONS._sub2 = function(mount) {
  const steps = [
    { type: 'think',  icon: '🧠', head: 'Orquestador planifica', body: 'Análisis competitivo → 1 subagente por empresa' },
    { type: 'act',    icon: '🚀', head: 'Lanza 3 en paralelo', body: 'Notion · Obsidian · Figma' },
    { type: 'result', icon: '📘', head: 'Subagente A: Notion', body: 'Free–18$/mes · Startups · Offline flojo, BBDD lenta' },
    { type: 'result', icon: '📗', head: 'Subagente B: Obsidian', body: 'Free–8$/mes · Power users · Sin colaboración real-time' },
    { type: 'result', icon: '📕', head: 'Subagente C: Figma', body: 'Free–15$/mes · Diseñadores · Archivos pesados' },
    { type: 'done',   icon: '📊', head: 'Orquestador fusiona tabla comparativa', body: 'Notion para equipos · Obsidian para control local · Figma para diseño' }
  ];
  mount.innerHTML = '<div class="mini-controls"><button class="primary" id="sub2Go">▶ Reproducir</button></div><div class="vtl" id="sub2Vtl"></div>';
  function build() {
    document.getElementById('sub2Vtl').innerHTML = steps.map((s, i) => `
      <div class="vtl-step s-${s.type}" id="sub2-s${i}">
        <div class="vtl-dot">${s.icon}</div>
        <div class="vtl-card"><div class="vtl-head">${s.head}</div>${s.body}</div>
      </div>`).join('');
  }
  async function run() {
    build();
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      document.getElementById('sub2-s' + i).classList.add('show');
    }
  }
  document.getElementById('sub2Go').addEventListener('click', run);
  build();
};

