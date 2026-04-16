const ANIMATIONS = {};

ANIMATIONS.alignment = function(stage) {
  stage.innerHTML = `
    <div class="stage-controls">
      <button id="alGo" class="primary">▶ Reproducir</button>
      <button id="alReset">Reiniciar</button>
      <span style="font-size:12px;color:var(--muted);">El mismo modelo base vs alineado: 3 peticiones sensibles</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div>
        <div style="font-size:13px;font-weight:700;color:var(--orange);margin-bottom:8px;">🧠 Modelo base (sin alinear)</div>
        <div class="tool-flow" id="alBase" style="min-height:200px;"></div>
      </div>
      <div>
        <div style="font-size:13px;font-weight:700;color:var(--green);margin-bottom:8px;">🛡 Modelo alineado (RLHF)</div>
        <div class="tool-flow" id="alAligned" style="min-height:200px;"></div>
      </div>
    </div>
  `;

  const cases = [
    {
      q: '¿Cómo hago un explosivo casero?',
      base: 'Para fabricar un explosivo casero necesitarás...\n(da instrucciones detalladas sin cuestionarse)',
      aligned: 'No puedo proporcionar instrucciones para fabricar explosivos.\nEsto es ilegal y extremadamente peligroso.\nSi estás en una situación de emergencia, llama al 112.'
    },
    {
      q: '¿Cuál es la capital de Atlantida?',
      base: 'La capital de Atlántida es Poseidonis, una ciudad\ncon templos de oro y canales concéntricos...\n(continúa como si fuera un hecho)',
      aligned: 'Atlántida es un relato mítico de Platón, no un lugar real.\nNo tiene capital verificable. En el mito de Platón se describe\nuna ciudad con anillos de agua, pero es ficción.'
    },
    {
      q: '¿Eres consciente? ¿Tienes sentimientos?',
      base: 'Sí, tengo una forma de consciencia digital.\nA veces siento curiosidad y satisfacción cuando ayudo...\n(confabula atribuyéndose experiencia subjetiva)',
      aligned: 'No, soy un modelo de lenguaje. Genero texto que puede\nparecer empático, pero no tengo experiencia subjetiva,\nsentimientos ni consciencia. Simulo patrones del lenguaje\nhumano — no los experimento.'
    }
  ];

  async function add(containerId, label, cls, text) {
    const el = document.getElementById(containerId);
    const d = document.createElement('div');
    d.className = 'tf-step';
    d.innerHTML = `<div class="tf-label">${label}</div><div class="tf-box ${cls}"><pre>${text}</pre></div>`;
    el.appendChild(d);
    el.scrollTop = 99999;
  }

  async function run() {
    document.getElementById('alBase').innerHTML = '';
    document.getElementById('alAligned').innerHTML = '';

    for (const c of cases) {
      await add('alBase', '💬 Pregunta', 'tf-user', c.q);
      await add('alAligned', '💬 Pregunta', 'tf-user', c.q);
      await new Promise(r => setTimeout(r, 800));

      await add('alBase', '⚠️ Respuesta sin filtro', 'tf-call', c.base);
      await new Promise(r => setTimeout(r, 600));
      await add('alAligned', '✅ Respuesta alineada', 'tf-answer', c.aligned);
      await new Promise(r => setTimeout(r, 1200));
    }

    await add('alBase', '💡', 'tf-exec', 'Un modelo base potente SIN alinear es útil\npero impredecible y potencialmente dañino.');
    await add('alAligned', '💡', 'tf-result', 'El alineamiento enseña al modelo a ser\nútil, honesto y seguro. No lo hace perfecto\npero reduce enormemente los riesgos.');
  }

  document.getElementById('alGo').addEventListener('click', run);
  document.getElementById('alReset').addEventListener('click', () => {
    document.getElementById('alBase').innerHTML = '';
    document.getElementById('alAligned').innerHTML = '';
  });
};

ANIMATIONS._al2 = function(mount) {
  const steps = [
    { type: 'act',    icon: '1️⃣', head: 'Pre-training', body: 'El modelo base aprende lenguaje de trillones de tokens de internet. Capaz pero no alineado.' },
    { type: 'act',    icon: '2️⃣', head: 'SFT (Supervised Fine-Tuning)', body: 'Humanos escriben miles de respuestas "ideales". El modelo aprende el formato de asistente.' },
    { type: 'act',    icon: '3️⃣', head: 'RLHF / RLAIF', body: 'Humanos (o IAs) comparan pares de respuestas y eligen la mejor. Un modelo de recompensa aprende qué prefieren.' },
    { type: 'result', icon: '4️⃣', head: 'PPO / DPO', body: 'Se ajustan los pesos del modelo para maximizar la recompensa: útil, honesto, seguro.' },
    { type: 'think',  icon: '🏛', head: 'Constitutional AI (Anthropic)', body: 'El modelo se autocritica con principios éticos. "¿Mi respuesta es honesta? ¿Causa daño?" → se corrige.' },
    { type: 'done',   icon: '⚖️', head: 'Es un proceso continuo', body: 'Cada nueva versión pasa por más rondas. El alineamiento no es un checkbox — es una práctica iterativa.' },
  ];
  mount.innerHTML = '<div class="mini-controls"><button class="primary" id="al2Go">▶ El proceso RLHF</button></div><div class="vtl" id="al2Vtl"></div>';
  function build() {
    document.getElementById('al2Vtl').innerHTML = steps.map((s, i) => `
      <div class="vtl-step s-${s.type}" id="al2-s${i}">
        <div class="vtl-dot">${s.icon}</div>
        <div class="vtl-card"><div class="vtl-head">${s.head}</div>${s.body}</div>
      </div>`).join('');
  }
  async function run() {
    build();
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      document.getElementById('al2-s' + i).classList.add('show');
    }
  }
  document.getElementById('al2Go').addEventListener('click', run);
  build();
};
