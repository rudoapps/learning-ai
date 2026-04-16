const ANIMATIONS = {};

ANIMATIONS.cot = function(stage) {
  stage.innerHTML = `
    <div class="stage-controls">
      <button id="cotGo" class="primary">▶ Comparar con y sin CoT</button>
      <button id="cotReset">Reiniciar</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div>
        <div style="font-size:13px;font-weight:700;color:var(--orange);margin-bottom:8px;">❌ Sin Chain of Thought</div>
        <div class="tool-flow" id="cotNo" style="min-height:200px;"></div>
      </div>
      <div>
        <div style="font-size:13px;font-weight:700;color:var(--green);margin-bottom:8px;">✅ Con Chain of Thought</div>
        <div class="tool-flow" id="cotYes" style="min-height:200px;"></div>
      </div>
    </div>
  `;

  const question = 'Si tengo 3 camisas y 4 pantalones, ¿cuántos outfits distintos puedo hacer? Si además tengo 2 pares de zapatos, ¿cuántos outfits completos?';

  async function addStep(containerId, label, cls, text, delay) {
    const el = document.getElementById(containerId);
    const d = document.createElement('div');
    d.className = 'tf-step';
    d.innerHTML = `<div class="tf-label">${label}</div><div class="tf-box ${cls}"><pre>${text}</pre></div>`;
    el.appendChild(d);
    el.scrollTop = 99999;
    await new Promise(r => setTimeout(r, delay));
  }

  async function run() {
    document.getElementById('cotNo').innerHTML = '';
    document.getElementById('cotYes').innerHTML = '';

    // Same question
    await addStep('cotNo', '💬 Pregunta', 'tf-user', question, 400);
    await addStep('cotYes', '💬 Pregunta + "piénsalo paso a paso"', 'tf-user', question + '\n\nPiénsalo paso a paso.', 800);

    // Without CoT — wrong answer
    await addStep('cotNo', '🤖 Respuesta directa', 'tf-exec', 'Puedes hacer 9 outfits.\nCon zapatos, 18 outfits completos.', 1200);
    await addStep('cotNo', '❌ Incorrecto', 'tf-call', 'Camisas × pantalones = 3 × 4 = 12, no 9.\nCon zapatos: 12 × 2 = 24, no 18.\n\nEl modelo "adivinó" sin razonar y falló.', 1200);

    // With CoT — correct
    await addStep('cotYes', '🧠 Paso 1', 'tf-think', 'Primero, combino camisas con pantalones.\nCada camisa se puede combinar con cada pantalón.\n3 camisas × 4 pantalones = 12 combinaciones.', 1400);
    await addStep('cotYes', '🧠 Paso 2', 'tf-think', 'Ahora añado los zapatos.\nCada uno de los 12 outfits se puede combinar\ncon cada par de zapatos.\n12 × 2 = 24 outfits completos.', 1400);
    await addStep('cotYes', '✅ Respuesta', 'tf-answer', 'Sin zapatos: 12 outfits.\nCon zapatos: 24 outfits completos.', 1000);
    await addStep('cotYes', '✅ Correcto', 'tf-result', 'Al razonar paso a paso, el modelo\ndescompone el problema y no se salta operaciones.', 800);
  }

  document.getElementById('cotGo').addEventListener('click', run);
  document.getElementById('cotReset').addEventListener('click', () => {
    document.getElementById('cotNo').innerHTML = '';
    document.getElementById('cotYes').innerHTML = '';
  });
};

// Mini: extended thinking
ANIMATIONS._cot2 = function(mount) {
  const steps = [
    { type: 'think',  icon: '🧠', head: 'CoT clásico (en el prompt)', body: '"Piénsalo paso a paso" → el modelo escribe sus pasos en la respuesta visible.' },
    { type: 'think',  icon: '💭', head: 'Extended thinking (moderno)', body: 'Claude/GPT generan razonamiento en un bloque invisible antes de responder. Tú solo ves el resultado.' },
    { type: 'result', icon: '💰', head: 'Coste', body: 'Los tokens de pensamiento también se facturan como output. Pensar más = más caro.' },
    { type: 'act',    icon: '📊', head: 'Cuándo usar CoT', body: 'Matemáticas, lógica, planificación, debugging. NO para preguntas simples ("¿cuál es la capital de Francia?").' },
    { type: 'fail',   icon: '⚠️', head: 'No es infalible', body: 'El modelo puede "razonar" bien y llegar a conclusión errónea. O razonar mal con confianza.' },
    { type: 'done',   icon: '💡', head: 'Regla práctica', body: 'Si un humano necesitaría papel y boli para resolver algo, el LLM necesita CoT.' },
  ];
  mount.innerHTML = '<div class="mini-controls"><button class="primary" id="cot2Go">▶ Extended thinking</button></div><div class="vtl" id="cot2Vtl"></div>';
  function build() {
    document.getElementById('cot2Vtl').innerHTML = steps.map((s, i) => `
      <div class="vtl-step s-${s.type}" id="cot2-s${i}">
        <div class="vtl-dot">${s.icon}</div>
        <div class="vtl-card"><div class="vtl-head">${s.head}</div>${s.body}</div>
      </div>`).join('');
  }
  async function run() {
    build();
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      document.getElementById('cot2-s' + i).classList.add('show');
    }
  }
  document.getElementById('cot2Go').addEventListener('click', run);
  build();
};
