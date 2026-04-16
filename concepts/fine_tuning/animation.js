const ANIMATIONS = {};

ANIMATIONS.fine_tuning = function(stage) {
  stage.innerHTML = `
    <div class="stage-controls">
      <button id="ftGo" class="primary">▶ Reproducir</button>
      <button id="ftReset">Reiniciar</button>
      <span style="font-size:12px;color:var(--muted);">Ejemplo: bufete de abogados quiere tono legal formal</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;" id="ftGrid">
      <div>
        <div style="font-size:13px;font-weight:700;color:var(--muted);margin-bottom:8px;">🧠 Modelo base (sin fine-tune)</div>
        <div class="tool-flow" id="ftBase" style="min-height:160px;"></div>
      </div>
      <div>
        <div style="font-size:13px;font-weight:700;color:var(--green);margin-bottom:8px;">🎓 Modelo fine-tuneado</div>
        <div class="tool-flow" id="ftTuned" style="min-height:160px;"></div>
      </div>
    </div>
    <div class="tool-flow" id="ftProcess" style="margin-top:16px;"></div>
  `;

  async function run() {
    const base = document.getElementById('ftBase');
    const tuned = document.getElementById('ftTuned');
    const proc = document.getElementById('ftProcess');
    base.innerHTML = '';
    tuned.innerHTML = '';
    proc.innerHTML = '';

    // Show base model response
    const q = { cls: 'tf-user', label: '💬 Consulta', text: '"¿Qué pasa si mi inquilino no paga?"' };
    let d = document.createElement('div'); d.className = 'tf-step';
    d.innerHTML = `<div class="tf-label">${q.label}</div><div class="tf-box ${q.cls}"><pre>${q.text}</pre></div>`;
    base.appendChild(d);
    tuned.appendChild(d.cloneNode(true));
    await new Promise(r => setTimeout(r, 1000));

    // Base answer - generic
    d = document.createElement('div'); d.className = 'tf-step';
    d.innerHTML = `<div class="tf-label">🤖 Respuesta genérica</div><div class="tf-box tf-exec"><pre>Si tu inquilino no paga el alquiler, puedes intentar hablar con él primero. Si no funciona, podrías considerar opciones legales. Te recomiendo consultar a un abogado.</pre></div>`;
    base.appendChild(d);
    await new Promise(r => setTimeout(r, 1200));

    // Show training process
    const procSteps = [
      { label: '📊 Dataset de entrenamiento (5.000 pares)', cls: 'tf-call', text: '{ "input": "Impago de alquiler",\n  "output": "Estimado cliente, conforme al art. 1.124 CC,\n  procede resolver el contrato..." }\n\n... 4.999 ejemplos más en el mismo estilo formal ...' },
      { label: '⚙️ Entrenamiento (~4 horas, ~200$)', cls: 'tf-exec', text: 'El modelo base ve miles de pares pregunta→respuesta ideal.\nAjusta sus pesos para reproducir el TONO y ESTILO.\nNo memoriza hechos — interioriza patrones.' },
      { label: '✅ Modelo fine-tuneado listo', cls: 'tf-result', text: 'Nuevo modelo: gpt-4o-mini-bufete-martinez-v2\nMismo modelo base, pesos ajustados al estilo legal.' },
    ];
    for (const s of procSteps) {
      d = document.createElement('div'); d.className = 'tf-step';
      d.innerHTML = `<div class="tf-label">${s.label}</div><div class="tf-box ${s.cls}"><pre>${s.text}</pre></div>`;
      proc.appendChild(d);
      proc.scrollTop = 99999;
      await new Promise(r => setTimeout(r, 1400));
    }

    // Tuned answer
    d = document.createElement('div'); d.className = 'tf-step';
    d.innerHTML = `<div class="tf-label">🎓 Respuesta con estilo interiorizado</div><div class="tf-box tf-answer"><pre>Estimado cliente, en relación con su consulta sobre el impago de rentas, conforme al artículo 1.124 del Código Civil, procede la resolución del contrato de arrendamiento.\n\nLe recomendamos iniciar un procedimiento de desahucio por falta de pago (art. 250.1.1 LEC), requiriendo previamente al arrendatario...</pre></div>`;
    tuned.appendChild(d);
    await new Promise(r => setTimeout(r, 1000));

    d = document.createElement('div'); d.className = 'tf-step';
    d.innerHTML = `<div class="tf-label">💡 Observa</div><div class="tf-box tf-think"><pre>Mismo prompt corto. Sin instrucciones de estilo.\nEl modelo fine-tuneado ya "habla" como un abogado español\nporque ajustó sus pesos con miles de ejemplos.</pre></div>`;
    proc.appendChild(d);
  }

  document.getElementById('ftGo').addEventListener('click', run);
  document.getElementById('ftReset').addEventListener('click', () => {
    document.getElementById('ftBase').innerHTML = '';
    document.getElementById('ftTuned').innerHTML = '';
    document.getElementById('ftProcess').innerHTML = '';
  });
};

// Mini: when to use what
ANIMATIONS._ft2 = function(mount) {
  const steps = [
    { type: 'user',   icon: '🎯', head: 'Quieres enseñarle un TONO o FORMATO', body: 'Fine-tuning → lo interioriza, prompt más corto para siempre' },
    { type: 'result', icon: '📚', head: 'Quieres que SEPA de tus datos', body: 'RAG → busca en tiempo real, actualizable al instante' },
    { type: 'act',    icon: '📋', head: 'Es algo pequeño y fijo', body: 'Prompting → ponlo en el system prompt y ya' },
    { type: 'done',   icon: '🏆', head: 'En producción real', body: 'RAG + prompting bien afinados. El fine-tuning es la herramienta menos usada y más sobrevalorada.' },
    { type: 'fail',   icon: '⚠️', head: 'Trampas del fine-tuning', body: 'Caro ($200+), lento (horas), difícil de iterar. Si cambias un dato = re-entrenar. No recomendado para hechos.' },
  ];
  mount.innerHTML = '<div class="mini-controls"><button class="primary" id="ft2Go">▶ ¿Cuál uso?</button></div><div class="vtl" id="ft2Vtl"></div>';
  function build() {
    document.getElementById('ft2Vtl').innerHTML = steps.map((s, i) => `
      <div class="vtl-step s-${s.type}" id="ft2-s${i}">
        <div class="vtl-dot">${s.icon}</div>
        <div class="vtl-card"><div class="vtl-head">${s.head}</div>${s.body}</div>
      </div>`).join('');
  }
  async function run() {
    build();
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      document.getElementById('ft2-s' + i).classList.add('show');
    }
  }
  document.getElementById('ft2Go').addEventListener('click', run);
  build();
};
