const ANIMATIONS = {};

ANIMATIONS.multimodal = function(stage) {
  stage.innerHTML = `
    <div class="stage-controls">
      <button id="mmGo" class="primary">▶ Reproducir</button>
      <button id="mmReset">Reiniciar</button>
      <span style="font-size:12px;color:var(--muted);">3 modalidades: texto, imagen, audio</span>
    </div>
    <div id="mmFlow" class="tool-flow">
      <div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver cómo un modelo multimodal procesa distintos inputs</div></div>
    </div>
  `;

  const steps = [
    { label: '👁 Modalidad 1: Imagen → Texto', cls: 'tf-user', text: '📸 [El usuario envía una foto de un ticket de compra borroso]' },
    { label: '🧠 El modelo "ve" la imagen', cls: 'tf-think', text: 'Detecto un ticket de Mercadona. Fecha: 14/04/2026.\nArtículos: leche 1.29€, pan 0.89€, aguacates 2.50€, cerveza 4.20€.\nTotal: 8.88€. Pago con tarjeta ****4821.' },
    { label: '💬 Respuesta', cls: 'tf-answer', text: 'Tu ticket de Mercadona del 14/04: 4 artículos por 8.88€.\n¿Quieres que lo añada al control de gastos?' },

    { label: '🎤 Modalidad 2: Audio → Texto', cls: 'tf-user', text: '🎙 [El usuario envía una nota de voz de 15 segundos]' },
    { label: '🧠 El modelo "escucha" el audio', cls: 'tf-think', text: 'Transcripción: "Oye, recuérdame que tengo que llamar al dentista\nmañana a las 10 y confirmar la cita del viernes."\n\nDetecto: 2 tareas, referencias temporales relativas.' },
    { label: '💬 Respuesta', cls: 'tf-answer', text: 'Anotado:\n• Mañana 10:00 — llamar al dentista\n• Confirmar cita del viernes\n\n¿Quieres que cree recordatorios?' },

    { label: '📄 Modalidad 3: Documento → Análisis', cls: 'tf-user', text: '📊 [El usuario sube un gráfico de barras en PNG con ventas por trimestre]' },
    { label: '🧠 El modelo "lee" el gráfico', cls: 'tf-think', text: 'Es un gráfico de barras. Eje X: Q1-Q4 2025.\nQ1: 84k, Q2: 91k, Q3: 78k, Q4: 112k.\nTendencia: caída en Q3, fuerte recuperación en Q4.' },
    { label: '💬 Respuesta', cls: 'tf-answer', text: 'Ventas 2025: crecimiento del 33% entre Q1 y Q4.\nHubo una caída del 14% en Q3, pero Q4 se recuperó\ncon el mejor trimestre del año (112k).\n\n→ 3 tipos de input (foto, audio, gráfico),\n   el mismo modelo los entiende todos.' },
  ];

  async function run() {
    const flow = document.getElementById('mmFlow');
    flow.innerHTML = '';
    for (const s of steps) {
      const d = document.createElement('div');
      d.className = 'tf-step';
      d.innerHTML = `<div class="tf-label">${s.label}</div><div class="tf-box ${s.cls}"><pre>${s.text}</pre></div>`;
      flow.appendChild(d);
      flow.scrollTop = 99999;
      await new Promise(r => setTimeout(r, 1300));
    }
  }

  document.getElementById('mmGo').addEventListener('click', run);
  document.getElementById('mmReset').addEventListener('click', () => {
    document.getElementById('mmFlow').innerHTML = '<div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver cómo un modelo multimodal procesa distintos inputs</div></div>';
  });
};

// Mini: what models support what
ANIMATIONS._mm2 = function(mount) {
  const steps = [
    { type: 'result', icon: '📝', head: 'Texto → Texto', body: 'Todos los LLMs. La modalidad base.' },
    { type: 'result', icon: '👁', head: 'Imagen → Texto', body: 'GPT-4o, Claude Sonnet/Opus, Gemini. Analizan fotos, capturas, gráficos, diagramas.' },
    { type: 'result', icon: '🎤', head: 'Audio → Texto', body: 'GPT-4o (nativo), Gemini. Otros usan Whisper como paso previo (no nativo).' },
    { type: 'act',    icon: '🎬', head: 'Vídeo → Texto', body: 'Gemini 1.5 Pro (hasta 2h de vídeo). GPT-4o: frame a frame. Aún incipiente.' },
    { type: 'act',    icon: '🖼', head: 'Texto → Imagen', body: 'DALL-E 3, Midjourney, Stable Diffusion. Modelos especializados, no LLMs generalistas.' },
    { type: 'done',   icon: '🔮', head: 'Tendencia', body: 'Los modelos convergen hacia "todo-en-uno": texto + imagen + audio + vídeo en un solo modelo.' },
  ];
  mount.innerHTML = '<div class="mini-controls"><button class="primary" id="mm2Go">▶ Modalidades por modelo</button></div><div class="vtl" id="mm2Vtl"></div>';
  function build() {
    document.getElementById('mm2Vtl').innerHTML = steps.map((s, i) => `
      <div class="vtl-step s-${s.type}" id="mm2-s${i}">
        <div class="vtl-dot">${s.icon}</div>
        <div class="vtl-card"><div class="vtl-head">${s.head}</div>${s.body}</div>
      </div>`).join('');
  }
  async function run() {
    build();
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      document.getElementById('mm2-s' + i).classList.add('show');
    }
  }
  document.getElementById('mm2Go').addEventListener('click', run);
  build();
};
