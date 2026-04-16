const ANIMATIONS = {};

// ========== AGENT ==========
ANIMATIONS.agent = function(stage) {
  stage.innerHTML = `
    <div class="stage-controls">
      <button id="agentGo" class="primary">▶ Reproducir</button>
      <button id="agentReset">Reiniciar</button>
      <span style="font-size:12px;color:var(--muted);">Ejemplo: "Resérvame cena italiana el sábado"</span>
    </div>
    <div class="agent-progress" id="agentProgress"></div>
    <div class="tool-flow" id="agentFlow">
      <div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver el bucle pensar → actuar → observar</div></div>
    </div>
  `;

  const steps = [
    { phase: 'user', iter: 0, text: 'Resérvame una cena italiana este sábado a las 21h para 4 personas en Madrid.' },
    { phase: 'think', iter: 1, text: 'El usuario quiere una reserva. No tengo restaurantes todavía. Primer paso: buscar italianos en Madrid.' },
    { phase: 'act', iter: 1, text: 'search_restaurants()\n{ "city": "Madrid", "type": "italiano" }' },
    { phase: 'observe', iter: 1, text: '3 resultados:\n  • Trattoria Sant\'Arcangelo (4.6★)\n  • Noi Madrid (4.4★)\n  • La Tagliatella Gran Vía (4.1★)' },
    { phase: 'think', iter: 2, text: 'Pruebo con el mejor valorado: Trattoria Sant\'Arcangelo.' },
    { phase: 'act', iter: 2, text: 'check_availability()\n{ "restaurant": "Trattoria Sant\'Arcangelo",\n  "date": "sábado 21:00", "people": 4 }' },
    { phase: 'observe', iter: 2, text: '❌ Completo. No hay mesa disponible.' },
    { phase: 'think', iter: 3, text: 'El primero está lleno. Un chat normal aquí se habría rendido. Yo sigo: pruebo el segundo, Noi Madrid.' },
    { phase: 'act', iter: 3, text: 'check_availability()\n{ "restaurant": "Noi Madrid",\n  "date": "sábado 21:00", "people": 4 }' },
    { phase: 'observe', iter: 3, text: '✅ Disponible.' },
    { phase: 'act', iter: 4, text: 'make_reservation()\n{ "restaurant": "Noi Madrid",\n  "date": "sábado 21:00", "people": 4 }' },
    { phase: 'observe', iter: 4, text: '✅ Reserva confirmada. Código: NOI-8842.' },
    { phase: 'done', iter: 4, text: 'Reserva hecha en Noi Madrid, sábado 21:00 para 4 personas. Código NOI-8842.\n\n→ 4 iteraciones, 5 llamadas a tools, 1 fallo recuperado. Todo con un solo encargo del usuario.' }
  ];

  const icons = { user: '💬', think: '🧠', act: '🔧', observe: '👁', done: '✅' };
  const labels = { user: 'Usuario', think: 'Pensar', act: 'Actuar', observe: 'Observar', done: 'Resultado final' };
  const cls = { user: 'tf-user', think: 'tf-think', act: 'tf-call', observe: 'tf-result', done: 'tf-answer' };

  async function run() {
    const flow = document.getElementById('agentFlow');
    const progress = document.getElementById('agentProgress');
    flow.innerHTML = '';
    progress.innerHTML = '';
    let lastIter = 0;

    for (const step of steps) {
      if (step.iter > lastIter && step.iter > 0) {
        lastIter = step.iter;
        progress.innerHTML = `<div class="agent-iter">🔁 Iteración ${lastIter}</div>`;
      }
      if (step.phase === 'done') {
        progress.innerHTML = `<div class="agent-iter agent-done">✅ Agente terminado — ${lastIter} iteraciones</div>`;
      }

      const div = document.createElement('div');
      div.className = 'tf-step';
      div.innerHTML = `<div class="tf-label">${icons[step.phase]} ${labels[step.phase]}</div><div class="tf-box ${cls[step.phase]}"><pre>${step.text}</pre></div>`;
      flow.appendChild(div);
      flow.scrollTop = flow.scrollHeight;
      await new Promise(r => setTimeout(r, step.phase === 'think' ? 1500 : 1000));
    }
  }

  document.getElementById('agentGo').addEventListener('click', run);
  document.getElementById('agentReset').addEventListener('click', () => {
    document.getElementById('agentFlow').innerHTML = '<div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver el bucle pensar → actuar → observar</div></div>';
    document.getElementById('agentProgress').innerHTML = '';
  });
};


// ========== MINI: AGENT 2 (bug) — visual timeline ==========
ANIMATIONS._agent2 = function(mount) {
  const steps = [
    { type: 'user',   icon: '🐛', head: 'Encargo', body: '"Error 500 en /api/users — investígalo y corrígelo"' },
    { type: 'think',  icon: '🧠', head: 'Iter 1 · Pensar', body: 'Miro los logs del servicio api' },
    { type: 'act',    icon: '🔧', head: 'Iter 1 · read_logs()', body: 'service: api, level: error, last: 1h' },
    { type: 'result', icon: '👁', head: 'Iter 1 · Hallazgo', body: 'NullPointerException en <code>UserService.java:142</code>' },
    { type: 'think',  icon: '🧠', head: 'Iter 2 · Pensar', body: 'Leo el archivo para ver el contexto' },
    { type: 'act',    icon: '🔧', head: 'Iter 2 · read_file()', body: '<code>user.getEmail().toLowerCase()</code> → sin null check' },
    { type: 'think',  icon: '🧠', head: 'Iter 3 · Pensar', body: 'Aplico el fix y ejecuto tests' },
    { type: 'act',    icon: '✏️', head: 'Iter 3 · edit_file() + run_tests()', body: 'Añade null check → ejecuta UserServiceTest' },
    { type: 'result', icon: '✅', head: 'Iter 3 · Tests', body: '24/24 passing' },
    { type: 'done',   icon: '🎉', head: 'Agente terminado · 3 iteraciones', body: 'Bug corregido: faltaba null check en UserService.java:142' }
  ];
  mount.innerHTML = '<div class="mini-controls"><button class="primary" id="agent2Go">▶ Reproducir</button></div><div class="vtl" id="agent2Vtl"></div>';
  function build() {
    document.getElementById('agent2Vtl').innerHTML = steps.map((s, i) => `
      <div class="vtl-step s-${s.type}" id="agent2-s${i}">
        <div class="vtl-dot">${s.icon}</div>
        <div class="vtl-card"><div class="vtl-head">${s.head}</div>${s.body}</div>
      </div>`).join('');
  }
  async function run() {
    build();
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      document.getElementById('agent2-s' + i).classList.add('show');
    }
  }
  document.getElementById('agent2Go').addEventListener('click', run);
  build();
};

