const ANIMATIONS = {};

// ========== TOOLS ==========
ANIMATIONS.tools = function(stage) {
  stage.innerHTML = `
    <div class="stage-controls">
      <button id="toolGo" class="primary">▶ Reproducir</button>
      <button id="toolReset">Reiniciar</button>
      <span style="font-size:12px;color:var(--muted);">Ejemplo: "¿Qué tiempo hace en Madrid?"</span>
    </div>
    <div class="tool-flow" id="toolFlow">
      <div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver el flujo completo</div></div>
    </div>
  `;

  const steps = [
    { label: '💬 El usuario pregunta', cls: 'tf-user', text: '¿Qué tiempo hace en Madrid?' },
    { label: '🧠 El LLM razona (esto NO lo ve el usuario)', cls: 'tf-think', text: 'El usuario pregunta por el clima actual. Yo no tengo datos en tiempo real — mi conocimiento tiene fecha de corte. Necesito usar la herramienta get_weather.' },
    { label: '🔧 El LLM genera una llamada a herramienta (JSON)', cls: 'tf-call', text: 'get_weather()\n{\n  "city": "Madrid",\n  "units": "celsius"\n}' },
    { label: '⚙️ El SISTEMA ejecuta la llamada (no la IA)', cls: 'tf-exec', text: 'Tu backend recibe el JSON, llama a api.weather.com,\ny devuelve el resultado. La IA no tiene acceso\ndirecto — solo tu código.' },
    { label: '✅ El resultado vuelve al contexto del LLM', cls: 'tf-result', text: '{\n  "temp": 22,\n  "condition": "Soleado",\n  "humidity": 45,\n  "wind_kmh": 8\n}' },
    { label: '💬 El LLM genera la respuesta para el usuario', cls: 'tf-answer', text: 'En Madrid hace 22°C y está soleado, con un 45% de humedad y brisa suave de 8 km/h. ¡Buen día para pasear!' }
  ];

  async function run() {
    const flow = document.getElementById('toolFlow');
    flow.innerHTML = '';
    for (const step of steps) {
      const div = document.createElement('div');
      div.className = 'tf-step';
      div.innerHTML = `<div class="tf-label">${step.label}</div><div class="tf-box ${step.cls}"><pre>${step.text}</pre></div>`;
      flow.appendChild(div);
      flow.scrollTop = flow.scrollHeight;
      await new Promise(r => setTimeout(r, 1400));
    }
  }

  document.getElementById('toolGo').addEventListener('click', run);
  document.getElementById('toolReset').addEventListener('click', () => {
    document.getElementById('toolFlow').innerHTML = '<div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver el flujo completo</div></div>';
  });
};


// ========== MINI: TOOLS 2 (email) — visual timeline ==========
ANIMATIONS._tools2 = function(mount) {
  const steps = [
    { type: 'user',   icon: '💬', head: 'Usuario', body: '"Avisa a Ana de que la reunión se mueve al jueves"' },
    { type: 'think',  icon: '🧠', head: 'La IA razona', body: 'Necesito enviar un email → uso <code>send_email</code>' },
    { type: 'act',    icon: '🔧', head: 'Tool call', body: '<code>send_email</code> → ana@empresa.com, "Cambio de reunión"' },
    { type: 'result', icon: '⚙️', head: 'Tu backend ejecuta', body: 'SMTP → enviado ✓' },
    { type: 'done',   icon: '✅', head: 'Respuesta al usuario', body: '"Hecho, le he enviado el email a Ana."' }
  ];
  mount.innerHTML = '<div class="mini-controls"><button class="primary" id="tools2Go">▶ Reproducir</button></div><div class="vtl" id="tools2Vtl"></div>';
  function build() {
    const vtl = document.getElementById('tools2Vtl');
    vtl.innerHTML = steps.map((s, i) => `
      <div class="vtl-step s-${s.type}" id="tools2-s${i}">
        <div class="vtl-dot">${s.icon}</div>
        <div class="vtl-card"><div class="vtl-head">${s.head}</div>${s.body}</div>
      </div>`).join('');
  }
  async function run() {
    build();
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      document.getElementById('tools2-s' + i).classList.add('show');
    }
  }
  document.getElementById('tools2Go').addEventListener('click', run);
  build();
};

