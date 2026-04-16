const ANIMATIONS = {};

ANIMATIONS.function_calling = function(stage) {
  stage.innerHTML = `
    <div class="stage-controls">
      <button id="fcGo" class="primary">▶ Reproducir</button>
      <button id="fcReset">Reiniciar</button>
      <span style="font-size:12px;color:var(--muted);">Ejemplo: extraer datos de un email como JSON estructurado</span>
    </div>
    <div id="fcFlow" class="tool-flow">
      <div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver texto libre → JSON estructurado</div></div>
    </div>
  `;

  const steps = [
    { label: '📨 Texto libre de entrada', cls: 'tf-user', text: '"Hola, soy María García. Me interesa el plan Business para 15 usuarios.\nMi email es m.garcia@acme.es y necesitaríamos facturación anual.\nPresupuesto aproximado: 8.000€. Contactar antes del viernes."' },
    { label: '📐 Schema que le pasamos al LLM', cls: 'tf-exec', text: '{\n  "name": "extract_lead",\n  "parameters": {\n    "name":     { "type": "string" },\n    "email":    { "type": "string", "format": "email" },\n    "plan":     { "type": "string", "enum": ["Starter","Business","Enterprise"] },\n    "seats":    { "type": "integer" },\n    "billing":  { "type": "string", "enum": ["monthly","annual"] },\n    "budget":   { "type": "number" },\n    "deadline": { "type": "string" }\n  }\n}' },
    { label: '🧠 El LLM entiende el texto y rellena el formulario', cls: 'tf-think', text: 'Analizo el email y mapeo cada dato al campo del schema.\nMaría García → name. m.garcia@acme.es → email.\nPlan Business, 15 usuarios, facturación anual, 8000€, viernes.' },
    { label: '📤 Output: JSON válido garantizado', cls: 'tf-answer', text: '{\n  "name": "María García",\n  "email": "m.garcia@acme.es",\n  "plan": "Business",\n  "seats": 15,\n  "billing": "annual",\n  "budget": 8000,\n  "deadline": "viernes"\n}' },
    { label: '✅ Tu código lo usa directamente', cls: 'tf-result', text: 'const lead = JSON.parse(response);\nawait crm.createLead(lead);\nawait notify("Nuevo lead: " + lead.name);\n\n→ Sin regex, sin parseo artesanal. JSON limpio listo para tu sistema.' },
  ];

  async function run() {
    const flow = document.getElementById('fcFlow');
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

  document.getElementById('fcGo').addEventListener('click', run);
  document.getElementById('fcReset').addEventListener('click', () => {
    document.getElementById('fcFlow').innerHTML = '<div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver texto libre → JSON estructurado</div></div>';
  });
};

// Mini: function calling vs text parsing
ANIMATIONS._fc2 = function(mount) {
  const steps = [
    { type: 'fail',   icon: '❌', head: 'Sin function calling', body: 'Le pides "extrae los datos" → responde en texto libre. Parseas con regex → se rompe con cada formato nuevo.' },
    { type: 'result', icon: '✅', head: 'Con function calling', body: 'Le pasas un JSON Schema → el modelo genera JSON válido que cumple ese schema. Parseable al 100%.' },
    { type: 'act',    icon: '🔧', head: 'También sirve para invocar tools', body: 'Function calling = la IA decide QUÉ función llamar y CON QUÉ argumentos, en formato estructurado.' },
    { type: 'think',  icon: '🌡', head: 'Tip: temperatura 0', body: 'Para function calling, usa T=0. Quieres consistencia en el JSON, no creatividad.' },
    { type: 'fail',   icon: '⚠️', head: 'Aún así, valida', body: 'El modelo puede generar tipos incorrectos o campos inesperados. Valida contra el schema antes de usar.' },
    { type: 'done',   icon: '💡', head: 'Caso de uso estrella', body: 'Extraer datos de texto libre (emails, CVs, facturas, tickets) → JSON → pipeline automático.' },
  ];
  mount.innerHTML = '<div class="mini-controls"><button class="primary" id="fc2Go">▶ Comparar enfoques</button></div><div class="vtl" id="fc2Vtl"></div>';
  function build() {
    document.getElementById('fc2Vtl').innerHTML = steps.map((s, i) => `
      <div class="vtl-step s-${s.type}" id="fc2-s${i}">
        <div class="vtl-dot">${s.icon}</div>
        <div class="vtl-card"><div class="vtl-head">${s.head}</div>${s.body}</div>
      </div>`).join('');
  }
  async function run() {
    build();
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      document.getElementById('fc2-s' + i).classList.add('show');
    }
  }
  document.getElementById('fc2Go').addEventListener('click', run);
  build();
};
