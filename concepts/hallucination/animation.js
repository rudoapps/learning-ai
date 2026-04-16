const ANIMATIONS = {};

ANIMATIONS.hallucination = function(stage) {
  stage.innerHTML = `
    <div class="stage-controls">
      <button id="halGo" class="primary">▶ Reproducir</button>
      <button id="halReset">Reiniciar</button>
      <span style="font-size:12px;color:var(--muted);">3 tipos de alucinación con ejemplo real</span>
    </div>
    <div id="halFlow" class="tool-flow">
      <div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver 3 alucinaciones comunes</div></div>
    </div>
  `;

  const steps = [
    { label: '💬 Pregunta 1: cita académica', cls: 'tf-user', text: '"Cita 3 estudios sobre el impacto del teletrabajo en la productividad."' },
    { label: '🌀 Alucinación: citas inventadas', cls: 'tf-call', text: '1. Smith & Johnson (2021). "Remote Work Productivity Meta-Analysis." \n   Journal of Organizational Behavior, 42(3), 112-128.\n2. García et al. (2022). "Telework and Output Quality."\n   Harvard Business Review Press.\n3. Chen, W. (2020). "Digital Nomads and Efficiency."\n   Nature Human Behaviour, 4, 891-899.' },
    { label: '❌ Realidad', cls: 'tf-exec', text: 'NINGUNA de estas citas existe. Los autores, revistas, volúmenes\ny DOIs son inventados. Pero suenan perfectamente creíbles.\n\nEl modelo no "busca" papers — predice qué texto de cita\nparecería más probable dado el contexto.' },

    { label: '💬 Pregunta 2: dato factual', cls: 'tf-user', text: '"¿Cuántos habitantes tiene Soria?"' },
    { label: '🌀 Alucinación: dato incorrecto', cls: 'tf-call', text: '"Soria tiene aproximadamente 94.000 habitantes."' },
    { label: '❌ Realidad', cls: 'tf-exec', text: 'Soria tiene ~39.000 habitantes (INE 2023).\nEl modelo confundió con la provincia (~88.000) y redondeó.\nLo dijo con total seguridad, sin matices ni "creo que".' },

    { label: '💬 Pregunta 3: URL', cls: 'tf-user', text: '"Dame el enlace a la documentación de la API de Stripe para webhooks."' },
    { label: '🌀 Alucinación: URL falsa', cls: 'tf-call', text: '"Aquí tienes: https://stripe.com/docs/api/webhooks/endpoints"' },
    { label: '❌ Realidad', cls: 'tf-exec', text: 'Esa URL no existe (404). La URL real es otra.\nEl modelo "predijo" una URL que parece razonable\npero nunca la verificó — no puede navegar.' },

    { label: '💡 Por qué pasa', cls: 'tf-answer', text: 'El LLM NO consulta fuentes. Predice la siguiente palabra\nmás probable. Si el patrón "Smith & Johnson (2021)" es\nestadísticamente plausible, lo genera con confianza.\n\nNo es mentir: es confabular. Como un humano que rellena\nhuecos de memoria con invenciones que suenan bien.' },
  ];

  async function run() {
    const flow = document.getElementById('halFlow');
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

  document.getElementById('halGo').addEventListener('click', run);
  document.getElementById('halReset').addEventListener('click', () => {
    document.getElementById('halFlow').innerHTML = '<div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver 3 alucinaciones comunes</div></div>';
  });
};

ANIMATIONS._hal2 = function(mount) {
  const steps = [
    { type: 'result', icon: '📚', head: 'RAG con fuentes', body: 'Ancla respuestas en documentos reales. Si no encuentra nada, dice "no sé".' },
    { type: 'act',    icon: '🔍', head: 'Pedir citas verificables', body: '"Cita la fuente exacta. Si no puedes, indícalo." → reduce invenciones.' },
    { type: 'think',  icon: '🌡', head: 'Temperatura baja', body: 'T=0 reduce variación. Menos creativo = menos inventivo (pero no lo elimina).' },
    { type: 'act',    icon: '🔗', head: 'Chain of Thought', body: 'Razonar paso a paso expone fallos lógicos antes de la conclusión.' },
    { type: 'result', icon: '🛡', head: 'Segundo modelo verificador', body: 'Un LLM barato revisa la respuesta del principal buscando claims sin evidencia.' },
    { type: 'done',   icon: '⚠️', head: 'Ninguna es perfecta', body: 'Las alucinaciones son inherentes al mecanismo de predicción. Se mitigan, no se eliminan.' },
  ];
  mount.innerHTML = '<div class="mini-controls"><button class="primary" id="hal2Go">▶ Cómo mitigar</button></div><div class="vtl" id="hal2Vtl"></div>';
  function build() {
    document.getElementById('hal2Vtl').innerHTML = steps.map((s, i) => `
      <div class="vtl-step s-${s.type}" id="hal2-s${i}">
        <div class="vtl-dot">${s.icon}</div>
        <div class="vtl-card"><div class="vtl-head">${s.head}</div>${s.body}</div>
      </div>`).join('');
  }
  async function run() {
    build();
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      document.getElementById('hal2-s' + i).classList.add('show');
    }
  }
  document.getElementById('hal2Go').addEventListener('click', run);
  build();
};
