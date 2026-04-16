const ANIMATIONS = {};

ANIMATIONS.system_prompt = function(stage) {
  stage.innerHTML = `
    <div class="stage-controls">
      <button id="spGo" class="primary">▶ Reproducir</button>
      <button id="spReset">Reiniciar</button>
      <span style="font-size:12px;color:var(--muted);">Misma pregunta, 3 system prompts distintos</span>
    </div>
    <div id="spFlow" class="tool-flow">
      <div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver cómo el system prompt cambia la personalidad</div></div>
    </div>
  `;

  const question = '¿Cómo puedo mejorar mi productividad?';
  const personas = [
    {
      sp: 'Eres un coach motivacional. Habla con energía, usa emojis y sé entusiasta.',
      answer: '¡OYE! 🔥 La clave está en los HÁBITOS. Empieza con la regla 2-2-2: 2 prioridades al día, 2 horas de deep work, 2 minutos de planificación nocturna. ¡Tú puedes! 💪🚀',
      label: '🏋️ Coach motivacional'
    },
    {
      sp: 'Eres un consultor McKinsey. Responde con frameworks, bullets y datos. Tono corporativo.',
      answer: 'Recomiendo un enfoque en tres pilares:\n• Priorización: matriz Eisenhower para clasificar tareas\n• Eliminación: auditar reuniones (40% suelen ser prescindibles)\n• Automatización: identificar tareas repetitivas con ROI > 2h/semana\n\nSiguiente paso: time-tracking durante 1 semana para baseline.',
      label: '👔 Consultor corporativo'
    },
    {
      sp: 'Eres un monje budista. Responde con calma, brevedad y sabiduría. Sin prisas.',
      answer: 'Hacer menos, con más presencia.\n\nLa productividad verdadera no es llenar el día, sino vaciarlo de lo innecesario.',
      label: '🧘 Monje budista'
    }
  ];

  async function run() {
    const flow = document.getElementById('spFlow');
    flow.innerHTML = '';

    // Show the question
    let d = document.createElement('div'); d.className = 'tf-step';
    d.innerHTML = `<div class="tf-label">💬 Misma pregunta para los 3</div><div class="tf-box tf-user"><pre>${question}</pre></div>`;
    flow.appendChild(d);
    await new Promise(r => setTimeout(r, 1000));

    for (const p of personas) {
      // System prompt
      d = document.createElement('div'); d.className = 'tf-step';
      d.innerHTML = `<div class="tf-label">📋 System prompt → ${p.label}</div><div class="tf-box tf-think"><pre>${p.sp}</pre></div>`;
      flow.appendChild(d);
      flow.scrollTop = 99999;
      await new Promise(r => setTimeout(r, 1200));

      // Answer
      d = document.createElement('div'); d.className = 'tf-step';
      d.innerHTML = `<div class="tf-label">${p.label} responde</div><div class="tf-box tf-answer"><pre>${p.answer}</pre></div>`;
      flow.appendChild(d);
      flow.scrollTop = 99999;
      await new Promise(r => setTimeout(r, 1400));
    }

    d = document.createElement('div'); d.className = 'tf-step';
    d.innerHTML = `<div class="tf-label">💡 Conclusión</div><div class="tf-box tf-result"><pre>Mismo modelo, misma pregunta, respuestas radicalmente distintas.\nEl system prompt es el "manual de instrucciones" que define\nQUIÉN es la IA antes de que el usuario diga nada.</pre></div>`;
    flow.appendChild(d);
    flow.scrollTop = 99999;
  }

  document.getElementById('spGo').addEventListener('click', run);
  document.getElementById('spReset').addEventListener('click', () => {
    document.getElementById('spFlow').innerHTML = '<div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver cómo el system prompt cambia la personalidad</div></div>';
  });
};

// Mini: anatomy of a good system prompt
ANIMATIONS._sp2 = function(mount) {
  const steps = [
    { type: 'think',  icon: '🎭', head: 'Rol', body: '"Eres un analista financiero senior de Acme Corp"' },
    { type: 'act',    icon: '📏', head: 'Restricciones', body: '"Solo responde sobre finanzas. No des consejos médicos ni legales."' },
    { type: 'result', icon: '📐', head: 'Formato', body: '"Estructura: 1) Resumen, 2) Análisis, 3) Recomendación. Máx 200 palabras."' },
    { type: 'act',    icon: '🔧', head: 'Tools disponibles', body: '"Tienes acceso a: query_db, generate_chart, send_report"' },
    { type: 'result', icon: '💾', head: 'Hechos de memoria', body: '"El usuario es CFO, prefiere métricas en euros, dashboard favorito: /d/revenue"' },
    { type: 'done',   icon: '💡', head: 'Resultado', body: 'Todo esto se envía ANTES del primer mensaje del usuario. En CADA turno. Cuesta tokens.' },
  ];
  mount.innerHTML = '<div class="mini-controls"><button class="primary" id="sp2Go">▶ Anatomía</button></div><div class="vtl" id="sp2Vtl"></div>';
  function build() {
    document.getElementById('sp2Vtl').innerHTML = steps.map((s, i) => `
      <div class="vtl-step s-${s.type}" id="sp2-s${i}">
        <div class="vtl-dot">${s.icon}</div>
        <div class="vtl-card"><div class="vtl-head">${s.head}</div>${s.body}</div>
      </div>`).join('');
  }
  async function run() {
    build();
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      document.getElementById('sp2-s' + i).classList.add('show');
    }
  }
  document.getElementById('sp2Go').addEventListener('click', run);
  build();
};
