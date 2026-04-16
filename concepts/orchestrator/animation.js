const ANIMATIONS = {};

// ========== ORCHESTRATOR ==========
ANIMATIONS.orchestrator = function(stage) {
  stage.innerHTML = `
    <div class="stage-controls">
      <button id="orchGo" class="primary">▶ Reproducir</button>
      <button id="orchReset">Reiniciar</button>
      <span style="font-size:12px;color:var(--muted);">Ejemplo: "Planifícame un finde en Lisboa"</span>
    </div>
    <div class="tool-flow" id="orchFlow">
      <div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver cómo un orquestador delega a subagentes</div></div>
    </div>
  `;

  const steps = [
    { label: '💬 Usuario', cls: 'tf-user', text: 'Planifícame un finde en Lisboa el próximo mes: vuelo, hotel y 3 planes.' },
    { label: '🧠 Orquestador — planifica', cls: 'tf-think', text: 'Son 3 tareas independientes: vuelos, hotel, actividades.\nPuedo lanzar 3 subagentes en paralelo. Cuando vuelvan, fusiono.' },
    { label: '🚀 Lanza 3 subagentes (en paralelo)', cls: 'tf-call', text: 'spawn_agent("Busca vuelo Madrid→Lisboa para el finde")\nspawn_agent("Busca hotel céntrico en Lisboa, 2 noches")\nspawn_agent("Sugiere 3 planes típicos en Lisboa")' },
    { label: '⏳ Los 3 trabajan a la vez...', cls: 'tf-exec', text: 'Cada subagente tiene su propio contexto aislado.\nEl orquestador NO ve sus búsquedas intermedias.\nSolo espera los informes finales.' },
    { label: '✈️ Subagente A devuelve informe', cls: 'tf-result', text: 'TAP TP1023, viernes 18:40 → Lisboa 19:10.\nVuelta domingo 20:15. 118€ ida y vuelta.' },
    { label: '🏨 Subagente B devuelve informe', cls: 'tf-result', text: 'Prata Boutique Hotel (Baixa).\n2 noches, 165€ total. Valoración 8.9.' },
    { label: '🗺 Subagente C devuelve informe', cls: 'tf-result', text: '1. Tranvía 28 + miradores de Alfama.\n2. Pastéis de Belém + Monasterio de los Jerónimos.\n3. Cena con fado en el Barrio Alto.' },
    { label: '🧠 Orquestador — fusiona', cls: 'tf-think', text: 'Los 3 informes son coherentes. Los compongo en una respuesta unificada para el usuario.' },
    { label: '💬 Respuesta final', cls: 'tf-answer', text: 'Plan de finde en Lisboa:\n\n✈️ TAP TP1023: vie 18:40 → 19:10. Vuelta dom 20:15. 118€.\n🏨 Prata Boutique Hotel, Baixa. 2 noches, 165€.\n🗺 Planes: Tranvía 28, Belém + Jerónimos, Cena con fado.\n\n→ El orquestador solo recibió 3 resúmenes cortos.\n   Los subagentes hicieron el trabajo pesado en paralelo.' }
  ];

  async function run() {
    const flow = document.getElementById('orchFlow');
    flow.innerHTML = '';
    for (const s of steps) {
      const d = document.createElement('div');
      d.className = 'tf-step';
      d.innerHTML = `<div class="tf-label">${s.label}</div><div class="tf-box ${s.cls}"><pre>${s.text}</pre></div>`;
      flow.appendChild(d);
      flow.scrollTop = flow.scrollHeight;
      await new Promise(r => setTimeout(r, 1300));
    }
  }

  document.getElementById('orchGo').addEventListener('click', run);
  document.getElementById('orchReset').addEventListener('click', () => {
    document.getElementById('orchFlow').innerHTML = '<div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver cómo un orquestador delega a subagentes</div></div>';
  });
};


// ========== MINI: ORCHESTRATOR 2 (code review) — visual timeline ==========
ANIMATIONS._orch2 = function(mount) {
  const steps = [
    { type: 'think',  icon: '🧠', head: 'Orquestador recibe PR #247', body: 'PR con 12 archivos. Lanzo 3 revisores especializados.' },
    { type: 'act',    icon: '🚀', head: 'Delega en paralelo', body: 'Seguridad · Rendimiento · Estilo' },
    { type: 'fail',   icon: '🛡', head: 'Revisor Seguridad', body: '⚠️ Token en plaintext en <code>auth.py:84</code>' },
    { type: 'result', icon: '⚡', head: 'Revisor Rendimiento', body: '⚠️ Query N+1 en <code>users_controller.py:23</code>' },
    { type: 'result', icon: '✨', head: 'Revisor Estilo', body: '⚠️ Nombre vago <code>do_stuff</code> · falta test para <code>/api/export</code>' },
    { type: 'think',  icon: '🧠', head: 'Fusiona los 3 informes', body: 'Prioriza por severidad en un review unificado' },
    { type: 'done',   icon: '📝', head: 'Review final', body: '🔴 token plaintext · 🟡 query N+1 · 🟡 falta test · 🔵 renombrar' }
  ];
  mount.innerHTML = '<div class="mini-controls"><button class="primary" id="orch2Go">▶ Reproducir</button></div><div class="vtl" id="orch2Vtl"></div>';
  function build() {
    document.getElementById('orch2Vtl').innerHTML = steps.map((s, i) => `
      <div class="vtl-step s-${s.type}" id="orch2-s${i}">
        <div class="vtl-dot">${s.icon}</div>
        <div class="vtl-card"><div class="vtl-head">${s.head}</div>${s.body}</div>
      </div>`).join('');
  }
  async function run() {
    build();
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      document.getElementById('orch2-s' + i).classList.add('show');
    }
  }
  document.getElementById('orch2Go').addEventListener('click', run);
  build();
};

