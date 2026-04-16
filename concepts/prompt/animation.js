const ANIMATIONS = {};

ANIMATIONS.prompt = function(stage) {
  stage.innerHTML = `
    <div class="stage-controls">
      <button id="prGo" class="primary">▶ Reproducir</button>
      <button id="prReset">Reiniciar</button>
      <span style="font-size:12px;color:var(--muted);">De prompt vago a prompt eficaz, paso a paso</span>
    </div>
    <div id="prFlow" class="tool-flow">
      <div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver cómo mejora un prompt</div></div>
    </div>
  `;

  const evolutions = [
    {
      level: '❌ Nivel 0 — vago',
      prompt: 'Resume esto.',
      answer: '(La IA no sabe qué resumir, ni en qué formato, ni para quién.\n Resultado: resumen genérico o error.)',
      cls_a: 'tf-exec'
    },
    {
      level: '🟡 Nivel 1 — con contexto',
      prompt: 'Resume este email de 3 párrafos.',
      answer: '(Mejor: sabe qué resumir. Pero no sabe para qué,\n ni cuánto de largo, ni en qué formato.)',
      cls_a: 'tf-exec'
    },
    {
      level: '🟢 Nivel 2 — con formato',
      prompt: 'Resume este email en 3 bullets, uno por decisión tomada.',
      answer: '• Se aprobó el presupuesto de Q3 en 84.000€.\n• La fecha de lanzamiento se mueve al 15 de mayo.\n• Marketing liderará la campaña de pre-launch.',
      cls_a: 'tf-answer'
    },
    {
      level: '🏆 Nivel 3 — con rol y restricciones',
      prompt: 'Eres mi asistente ejecutivo. Resume este email en 3 bullets (uno por decisión) y añade una fila de "acción requerida" si necesito hacer algo. Máximo 50 palabras.',
      answer: '• Presupuesto Q3: aprobado (84.000€).\n• Lanzamiento: se mueve al 15 de mayo.\n• Campaña: Marketing lidera.\n\n🔴 Acción: confirmar nueva fecha con el equipo de dev antes del viernes.',
      cls_a: 'tf-answer'
    }
  ];

  async function run() {
    const flow = document.getElementById('prFlow');
    flow.innerHTML = '';

    for (const e of evolutions) {
      let d = document.createElement('div'); d.className = 'tf-step';
      d.innerHTML = `<div class="tf-label">${e.level}</div><div class="tf-box tf-user"><pre>${e.prompt}</pre></div>`;
      flow.appendChild(d);
      flow.scrollTop = 99999;
      await new Promise(r => setTimeout(r, 1000));

      d = document.createElement('div'); d.className = 'tf-step';
      d.innerHTML = `<div class="tf-label">🤖 Resultado</div><div class="tf-box ${e.cls_a}"><pre>${e.answer}</pre></div>`;
      flow.appendChild(d);
      flow.scrollTop = 99999;
      await new Promise(r => setTimeout(r, 1400));
    }

    let d = document.createElement('div'); d.className = 'tf-step';
    d.innerHTML = `<div class="tf-label">💡 Patrón</div><div class="tf-box tf-result"><pre>Un buen prompt tiene 4 ingredientes:\n  1. ROL → quién eres\n  2. CONTEXTO → qué tienes delante\n  3. FORMATO → cómo quieres la salida\n  4. RESTRICCIONES → límites y reglas\n\nGarbage in, garbage out. Prompt claro = respuesta útil.</pre></div>`;
    flow.appendChild(d);
    flow.scrollTop = 99999;
  }

  document.getElementById('prGo').addEventListener('click', run);
  document.getElementById('prReset').addEventListener('click', () => {
    document.getElementById('prFlow').innerHTML = '<div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver cómo mejora un prompt</div></div>';
  });
};

// Mini: prompt techniques
ANIMATIONS._pr2 = function(mount) {
  const steps = [
    { type: 'act',    icon: '🎯', head: 'Few-shot prompting', body: 'Dar 2-3 ejemplos de input→output antes de la pregunta real. La IA imita el patrón.' },
    { type: 'think',  icon: '🔗', head: 'Chain of Thought', body: '"Piénsalo paso a paso" → el modelo razona en voz alta antes de responder.' },
    { type: 'result', icon: '📐', head: 'Output structuring', body: '"Responde en JSON con campos: nombre, fecha, importe" → salida parseable.' },
    { type: 'act',    icon: '🚧', head: 'Negative prompting', body: '"NO inventes datos. Si no sabes, di que no sabes." → reduce alucinaciones.' },
    { type: 'result', icon: '🎭', head: 'Role prompting', body: '"Eres un experto en X con 20 años de experiencia" → respuestas más especializadas.' },
    { type: 'done',   icon: '💡', head: 'Regla de oro', body: 'Trata al LLM como un empleado brillante pero literal. Instrucciones claras = buenos resultados.' },
  ];
  mount.innerHTML = '<div class="mini-controls"><button class="primary" id="pr2Go">▶ Técnicas clave</button></div><div class="vtl" id="pr2Vtl"></div>';
  function build() {
    document.getElementById('pr2Vtl').innerHTML = steps.map((s, i) => `
      <div class="vtl-step s-${s.type}" id="pr2-s${i}">
        <div class="vtl-dot">${s.icon}</div>
        <div class="vtl-card"><div class="vtl-head">${s.head}</div>${s.body}</div>
      </div>`).join('');
  }
  async function run() {
    build();
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      document.getElementById('pr2-s' + i).classList.add('show');
    }
  }
  document.getElementById('pr2Go').addEventListener('click', run);
  build();
};
