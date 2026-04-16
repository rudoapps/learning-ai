const ANIMATIONS = {};

// ========== MEMORY ==========
ANIMATIONS.memory = function(stage) {
  stage.innerHTML = `
    <div class="stage-controls">
      <button id="memGo" class="primary">▶ Reproducir las 2 conversaciones</button>
      <button id="memReset">Reiniciar</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;" id="memGrid">
      <div>
        <div style="font-size:13px;font-weight:700;color:var(--accent);margin-bottom:8px;">🟢 Conversación 1 — Lunes</div>
        <div class="tool-flow" id="memConv1" style="min-height:200px;"></div>
      </div>
      <div>
        <div style="font-size:13px;font-weight:700;color:var(--orange);margin-bottom:8px;" id="memConv2Title">🔴 Conversación 2 — Lunes siguiente</div>
        <div class="tool-flow" id="memConv2" style="min-height:200px;"></div>
      </div>
    </div>
  `;

  const conv1 = [
    { cls: 'tf-user', label: '💬 Usuario', text: 'Hola, me llamo Fernando y soy alérgico a los frutos secos.' },
    { cls: 'tf-answer', label: '🤖 IA', text: '¡Encantado, Fernando! Lo tendré en cuenta.' },
    { cls: 'tf-user', label: '💬 Usuario', text: 'Recomiéndame un postre.' },
    { cls: 'tf-answer', label: '🤖 IA', text: 'Un flan casero te va genial: dulce, sin frutos secos.' },
  ];

  const conv2_sin = [
    { cls: 'tf-exec', label: '📋 Contexto', text: '(vacío — nueva conversación, no sabe nada)' },
    { cls: 'tf-user', label: '💬 Usuario', text: 'Recomiéndame una tarta para mi cumple.' },
    { cls: 'tf-answer', label: '🤖 IA', text: 'Una Sacher: chocolate y avellanas tostadas.' },
    { cls: 'tf-call', label: '💥 PROBLEMA', text: '¡Recomendó AVELLANAS! Fernando es alérgico.\nLa IA no lo sabe porque esa info murió con la conversación 1.' },
  ];

  const conv2_con = [
    { cls: 'tf-result', label: '💾 Memoria inyectada', text: 'Hechos guardados:\n• Nombre: Fernando\n• Alergia: frutos secos\n• Gusto: café solo' },
    { cls: 'tf-user', label: '💬 Usuario', text: 'Recomiéndame una tarta para mi cumple.' },
    { cls: 'tf-answer', label: '🤖 IA', text: 'Fernando, una tarta de queso al horno: sin frutos secos, con café solo como te gusta.' },
    { cls: 'tf-result', label: '✅ SEGURO', text: 'La "memoria" son hechos guardados FUERA que se pegan al prompt.\nPara la IA siguen siendo contexto — solo que viene precargado.' },
  ];

  async function addSteps(containerId, steps, delay) {
    const el = document.getElementById(containerId);
    el.innerHTML = '';
    for (const s of steps) {
      const d = document.createElement('div');
      d.className = 'tf-step';
      d.innerHTML = `<div class="tf-label">${s.label}</div><div class="tf-box ${s.cls}"><pre>${s.text}</pre></div>`;
      el.appendChild(d);
      el.scrollTop = 99999;
      await new Promise(r => setTimeout(r, delay));
    }
  }

  async function run() {
    document.getElementById('memConv2Title').textContent = '🔴 Conversación 2 — SIN memoria';
    document.getElementById('memConv2Title').style.color = 'var(--orange)';
    await addSteps('memConv1', conv1, 1000);
    await new Promise(r => setTimeout(r, 800));
    await addSteps('memConv2', conv2_sin, 1200);
    await new Promise(r => setTimeout(r, 1500));

    document.getElementById('memConv2Title').textContent = '🟢 Conversación 2 — CON memoria';
    document.getElementById('memConv2Title').style.color = 'var(--green)';
    await addSteps('memConv2', conv2_con, 1200);
  }

  document.getElementById('memGo').addEventListener('click', run);
  document.getElementById('memReset').addEventListener('click', () => {
    document.getElementById('memConv1').innerHTML = '';
    document.getElementById('memConv2').innerHTML = '';
    document.getElementById('memConv2Title').textContent = '🔴 Conversación 2 — Lunes siguiente';
    document.getElementById('memConv2Title').style.color = 'var(--orange)';
  });
};

// ========== MINI: MEMORY 2 — how it works under the hood ==========
ANIMATIONS._mem2 = function(mount) {
  const steps = [
    { type: 'result', icon: '💬', head: 'Conversación termina', body: 'El usuario cierra el chat' },
    { type: 'act',    icon: '🔍', head: 'Proceso de extracción', body: 'Un sistema aparte analiza la conversación y extrae hechos estables' },
    { type: 'result', icon: '💾', head: 'Almacenamiento externo', body: '"Fernando, alérgico a frutos secos, le gusta café solo" → BBDD de usuario' },
    { type: 'user',   icon: '💬', head: 'Nueva conversación', body: 'El usuario abre un chat nuevo días después' },
    { type: 'act',    icon: '📋', head: 'Inyección en system prompt', body: 'Antes de la primera llamada al LLM, se pegan los hechos guardados' },
    { type: 'done',   icon: '🧠', head: 'Para la IA es "contexto normal"', body: 'No hay magia: son tokens extra al inicio. Cuestan dinero en cada turno.' },
  ];
  mount.innerHTML = '<div class="mini-controls"><button class="primary" id="mem2Go">▶ Reproducir</button></div><div class="vtl" id="mem2Vtl"></div>';
  function build() {
    document.getElementById('mem2Vtl').innerHTML = steps.map((s, i) => `
      <div class="vtl-step s-${s.type}" id="mem2-s${i}">
        <div class="vtl-dot">${s.icon}</div>
        <div class="vtl-card"><div class="vtl-head">${s.head}</div>${s.body}</div>
      </div>`).join('');
  }
  async function run() {
    build();
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      document.getElementById('mem2-s' + i).classList.add('show');
    }
  }
  document.getElementById('mem2Go').addEventListener('click', run);
  build();
};
