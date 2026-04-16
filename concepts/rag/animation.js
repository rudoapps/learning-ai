const ANIMATIONS = {};

ANIMATIONS.rag = function(stage) {
  stage.innerHTML = `
    <div class="stage-controls">
      <button id="ragGo" class="primary">▶ Reproducir</button>
      <button id="ragReset">Reiniciar</button>
      <span style="font-size:12px;color:var(--muted);">Ejemplo: "¿Cuántos días de teletrabajo puedo pedir?"</span>
    </div>
    <div class="tool-flow" id="ragFlow">
      <div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver el pipeline RAG completo</div></div>
    </div>
  `;

  const steps = [
    { label: '🗄️ Fase previa (se hace UNA vez)', cls: 'tf-exec', text: '847 documentos (políticas, manuales, contratos...)\n→ troceados en 12.394 chunks de ~500 tokens\n→ cada chunk convertido en vector (embedding)\n→ guardados en base vectorial' },
    { label: '💬 El usuario pregunta', cls: 'tf-user', text: '¿Cuántos días de teletrabajo puedo pedir al mes?' },
    { label: '🔢 Paso 1 — Embeber la pregunta', cls: 'tf-call', text: 'La pregunta se convierte en un vector con un modelo de embeddings\n(barato y rápido, distinto del LLM principal)' },
    { label: '🔍 Paso 2 — Búsqueda por similitud', cls: 'tf-call', text: 'Se compara el vector de la pregunta contra los 12.394 guardados.\nSe devuelven los 3 más parecidos (similitud coseno).\nEsto NO usa IA — es álgebra pura, instantáneo.' },
    { label: '📄 Top-3 chunks recuperados', cls: 'tf-result', text: '1. politica-teletrabajo-2025.pdf §3.2 (score: 0.89)\n   "...hasta 8 días al mes, con 48h de antelación..."\n\n2. faq-rrhh.md (score: 0.82)\n   "El tope mensual es de 8 días. Excepciones por RRHH."\n\n3. convenio-colectivo-2024.pdf (score: 0.78)\n   "La empresa facilitará el trabajo remoto..."' },
    { label: '🧩 Paso 3 — Prompt aumentado', cls: 'tf-think', text: 'Se construye el prompt final:\n  [system prompt: 58 tokens]\n  + [3 chunks recuperados: ~250 tokens]\n  + [pregunta del usuario: 14 tokens]\n\nLa IA ahora tiene evidencia específica que NO tenía en su entrenamiento.' },
    { label: '💬 Respuesta con cita', cls: 'tf-answer', text: 'Puedes solicitar hasta 8 días de teletrabajo al mes,\ncomunicándoselo a tu manager con 48h de antelación.\n\nFuente: Política de Teletrabajo 2025, §3.2.' },
  ];

  async function run() {
    const flow = document.getElementById('ragFlow');
    flow.innerHTML = '';
    for (const s of steps) {
      const d = document.createElement('div');
      d.className = 'tf-step';
      d.innerHTML = `<div class="tf-label">${s.label}</div><div class="tf-box ${s.cls}"><pre>${s.text}</pre></div>`;
      flow.appendChild(d);
      flow.scrollTop = 99999;
      await new Promise(r => setTimeout(r, 1400));
    }
  }

  document.getElementById('ragGo').addEventListener('click', run);
  document.getElementById('ragReset').addEventListener('click', () => {
    document.getElementById('ragFlow').innerHTML = '<div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver el pipeline RAG completo</div></div>';
  });
};

// Mini: RAG vs meter todo en el prompt
ANIMATIONS._rag2 = function(mount) {
  const steps = [
    { type: 'fail',   icon: '❌', head: 'Opción A: meter TODO en el prompt', body: '6.2M tokens de docs → no cabe en ningún modelo. Imposible.' },
    { type: 'fail',   icon: '❌', head: 'Opción B: fine-tunear con tus docs', body: 'Caro, lento, y cada vez que cambias un PDF hay que re-entrenar.' },
    { type: 'result', icon: '✅', head: 'Opción C: RAG', body: 'Baratísimo, actualizable al instante. Cambias un PDF y listo.' },
    { type: 'done',   icon: '🎯', head: 'Ventaja extra', body: 'La IA cita fuentes verificables. El usuario puede comprobar.' },
    { type: 'fail',   icon: '⚠️', head: 'Pero cuidado', body: 'Si la búsqueda recupera chunks malos, la IA responde mal. La calidad depende del chunking, el modelo de embeddings, y el top-K.' },
  ];
  mount.innerHTML = '<div class="mini-controls"><button class="primary" id="rag2Go">▶ Comparar alternativas</button></div><div class="vtl" id="rag2Vtl"></div>';
  function build() {
    document.getElementById('rag2Vtl').innerHTML = steps.map((s, i) => `
      <div class="vtl-step s-${s.type}" id="rag2-s${i}">
        <div class="vtl-dot">${s.icon}</div>
        <div class="vtl-card"><div class="vtl-head">${s.head}</div>${s.body}</div>
      </div>`).join('');
  }
  async function run() {
    build();
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      document.getElementById('rag2-s' + i).classList.add('show');
    }
  }
  document.getElementById('rag2Go').addEventListener('click', run);
  build();
};
