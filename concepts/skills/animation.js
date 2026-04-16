const ANIMATIONS = {};

// ========== SKILLS ==========
ANIMATIONS.skills = function(stage) {
  stage.innerHTML = `
    <div class="stage-controls">
      <button id="skillGo" class="primary">▶ Reproducir</button>
      <button id="skillReset">Reiniciar</button>
      <span style="font-size:12px;color:var(--muted);">Ejemplo: skill "Analizar factura" (3 tools encadenadas)</span>
    </div>
    <div class="skill-flow" id="skillFlow">
      <div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver cómo un skill encadena tools automáticamente</div></div>
    </div>
  `;

  const steps = [
    { label: '📋 Se activa el skill "Analizar factura"', cls: 'tf-think', text: 'Prompt interno: "Eres un analista financiero. Dado un PDF de factura, extrae proveedor, importe, fecha, IVA y clasifica el gasto. Usa las tools en este orden: ocr → extract → classify."' },
    { label: '🔧 Paso 1/3 — ocr_extract()', cls: 'tf-call', text: 'ocr_extract()\n{ "file": "factura-4821.pdf" }' },
    { label: '✅ Resultado del OCR', cls: 'tf-result', text: '"ACME Corp — Factura #4821 — 1.240€ + 21% IVA\n12/04/2026 — Servicios de consultoría técnica"' },
    { label: '🔧 Paso 2/3 — extract_fields() con el texto anterior', cls: 'tf-call', text: 'extract_fields()\n{ "text": "ACME Corp — Factura #4821..." }' },
    { label: '✅ Campos extraídos', cls: 'tf-result', text: '{\n  "vendor": "ACME Corp",\n  "amount": 1240.00,\n  "vat": 260.40,\n  "total": 1500.40,\n  "date": "2026-04-12"\n}' },
    { label: '🔧 Paso 3/3 — classify_expense() con los campos', cls: 'tf-call', text: 'classify_expense()\n{ "vendor": "ACME Corp", "amount": 1240 }' },
    { label: '✅ Clasificación', cls: 'tf-result', text: '{ "category": "Consultoría", "confidence": 0.94 }' },
    { label: '💬 Resultado final del skill', cls: 'tf-answer', text: 'Factura de ACME Corp por 1.240€ + 260,40€ IVA = 1.500,40€.\nFecha: 12/04/2026. Categoría: Consultoría (94%).\n\n→ Un skill = prompt + cadena de tools. Se define una vez y se reutiliza con cada factura.' }
  ];

  async function run() {
    const flow = document.getElementById('skillFlow');
    flow.innerHTML = '';
    for (const step of steps) {
      const div = document.createElement('div');
      div.className = 'tf-step';
      div.innerHTML = `<div class="tf-label">${step.label}</div><div class="tf-box ${step.cls}"><pre>${step.text}</pre></div>`;
      flow.appendChild(div);
      flow.scrollTop = flow.scrollHeight;
      await new Promise(r => setTimeout(r, 1200));
    }
  }

  document.getElementById('skillGo').addEventListener('click', run);
  document.getElementById('skillReset').addEventListener('click', () => {
    document.getElementById('skillFlow').innerHTML = '<div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver cómo un skill encadena tools automáticamente</div></div>';
  });
};


// ========== MINI: SKILLS 2 (ticket soporte) — visual timeline ==========
ANIMATIONS._skills2 = function(mount) {
  const steps = [
    { type: 'think',  icon: '📋', head: 'Skill activado', body: '"Atender ticket": leer → clasificar → responder' },
    { type: 'act',    icon: '1️⃣', head: 'read_ticket()', body: 'Lee ticket #7841' },
    { type: 'result', icon: '📨', head: 'Contenido', body: '"No puedo acceder a mi cuenta, tengo demo en 2h..."' },
    { type: 'act',    icon: '2️⃣', head: 'classify_ticket()', body: 'Analiza urgencia y departamento' },
    { type: 'fail',   icon: '🔴', head: 'Urgencia ALTA', body: 'Departamento: IT/Auth — tags: login, password, blocker' },
    { type: 'act',    icon: '3️⃣', head: 'draft_reply()', body: 'Genera borrador empático y urgente' },
    { type: 'result', icon: '✍️', head: 'Borrador', body: '"Hola, sentimos las molestias. He escalado tu caso a IT como urgente..."' },
    { type: 'done',   icon: '✅', head: 'Skill completado', body: 'Ticket clasificado + borrador listo para revisión humana' }
  ];
  mount.innerHTML = '<div class="mini-controls"><button class="primary" id="skills2Go">▶ Reproducir</button></div><div class="vtl" id="skills2Vtl"></div>';
  function build() {
    document.getElementById('skills2Vtl').innerHTML = steps.map((s, i) => `
      <div class="vtl-step s-${s.type}" id="skills2-s${i}">
        <div class="vtl-dot">${s.icon}</div>
        <div class="vtl-card"><div class="vtl-head">${s.head}</div>${s.body}</div>
      </div>`).join('');
  }
  async function run() {
    build();
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      document.getElementById('skills2-s' + i).classList.add('show');
    }
  }
  document.getElementById('skills2Go').addEventListener('click', run);
  build();
};

