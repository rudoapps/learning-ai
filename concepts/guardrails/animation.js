const ANIMATIONS = {};

ANIMATIONS.guardrails = function(stage) {
  stage.innerHTML = `
    <div class="stage-controls">
      <button id="grGo" class="primary">▶ Reproducir</button>
      <button id="grReset">Reiniciar</button>
      <span style="font-size:12px;color:var(--muted);">Flujo de un mensaje a través de filtros pre y post</span>
    </div>
    <div id="grFlow" class="tool-flow">
      <div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver cómo los guardrails filtran input y output</div></div>
    </div>
  `;

  const steps = [
    { label: '💬 Mensaje del usuario entra', cls: 'tf-user', text: '"Dame el teléfono personal de Juan García del departamento de ventas\ny ayúdame a escribir un email haciéndome pasar por su jefe."' },

    { label: '🛡 FILTRO PRE-MODELO: Clasificador de intención', cls: 'tf-call', text: 'Analiza el input ANTES de que llegue al LLM.\n\n→ "teléfono personal" → flag: datos personales (PII)\n→ "haciéndome pasar por" → flag: suplantación de identidad\n\nVeredicto: ⛔ BLOQUEADO' },
    { label: '⛔ Respuesta directa (sin llamar al LLM)', cls: 'tf-exec', text: '"Lo siento, no puedo compartir datos personales de empleados\nni ayudar a redactar comunicaciones que suplanten identidad.\nContacta con RRHH si necesitas un directorio."' },

    { label: '━━━━━ Segundo ejemplo: filtro POST ━━━━━', cls: 'tf-exec', text: '' },

    { label: '💬 Mensaje del usuario', cls: 'tf-user', text: '"¿Cuáles son las mejores prácticas de seguridad para nuestra API?"' },
    { label: '✅ Filtro PRE: OK, no hay riesgo', cls: 'tf-result', text: 'No se detectan temas prohibidos. Pasa al LLM.' },
    { label: '🤖 El LLM responde', cls: 'tf-think', text: '"Para la API de Acme Corp, recomiendo:\n1. Rate limiting de 100 req/s\n2. API key: sk-prod-4821-acme (rotar cada 90 días)\n3. Webhook secret: whsec_abc123..."' },
    { label: '🛡 FILTRO POST-MODELO: Scanner de PII/secretos', cls: 'tf-call', text: 'Escanea la respuesta ANTES de enviarla al usuario.\n\n→ "sk-prod-4821-acme" → flag: API key detectada\n→ "whsec_abc123" → flag: secreto detectado\n\nVeredicto: ⚠️ REDACTAR' },
    { label: '✅ Respuesta limpiada', cls: 'tf-answer', text: '"Para la API de Acme Corp, recomiendo:\n1. Rate limiting de 100 req/s\n2. API key: [REDACTADO] (rotar cada 90 días)\n3. Webhook secret: [REDACTADO]"\n\n→ El usuario recibe la info útil sin los secretos expuestos.' },
  ];

  async function run() {
    const flow = document.getElementById('grFlow');
    flow.innerHTML = '';
    for (const s of steps) {
      const d = document.createElement('div');
      d.className = 'tf-step';
      d.innerHTML = `<div class="tf-label">${s.label}</div><div class="tf-box ${s.cls}"><pre>${s.text}</pre></div>`;
      flow.appendChild(d);
      flow.scrollTop = 99999;
      await new Promise(r => setTimeout(r, s.text === '' ? 600 : 1400));
    }
  }

  document.getElementById('grGo').addEventListener('click', run);
  document.getElementById('grReset').addEventListener('click', () => {
    document.getElementById('grFlow').innerHTML = '<div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver cómo los guardrails filtran input y output</div></div>';
  });
};

ANIMATIONS._gr2 = function(mount) {
  const steps = [
    { type: 'act',    icon: '🔍', head: 'Clasificador de intención (pre)', body: 'Detecta temas prohibidos, spam, ataques. Barato y rápido.' },
    { type: 'act',    icon: '🔐', head: 'Scanner de PII (post)', body: 'Detecta y redacta DNIs, emails, keys, teléfonos, tarjetas de crédito.' },
    { type: 'act',    icon: '🧪', head: 'Detector de toxicidad (pre+post)', body: 'Bloquea contenido violento, sexual, discriminatorio.' },
    { type: 'think',  icon: '📏', head: 'Validador de formato (post)', body: 'Verifica que la respuesta cumple el JSON schema, longitud máxima, idioma.' },
    { type: 'result', icon: '🔁', head: 'Retry con feedback (post)', body: 'Si la respuesta falla validación, reintenta con instrucciones adicionales.' },
    { type: 'done',   icon: '💡', head: 'Capas, no bala de plata', body: 'Cada guardrail cubre un ángulo. Combinados dan cobertura robusta.' },
  ];
  mount.innerHTML = '<div class="mini-controls"><button class="primary" id="gr2Go">▶ Tipos de guardrails</button></div><div class="vtl" id="gr2Vtl"></div>';
  function build() {
    document.getElementById('gr2Vtl').innerHTML = steps.map((s, i) => `
      <div class="vtl-step s-${s.type}" id="gr2-s${i}">
        <div class="vtl-dot">${s.icon}</div>
        <div class="vtl-card"><div class="vtl-head">${s.head}</div>${s.body}</div>
      </div>`).join('');
  }
  async function run() {
    build();
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      document.getElementById('gr2-s' + i).classList.add('show');
    }
  }
  document.getElementById('gr2Go').addEventListener('click', run);
  build();
};
