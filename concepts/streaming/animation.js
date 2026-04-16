const ANIMATIONS = {};

ANIMATIONS.streaming = function(stage) {
  const text = 'El cielo es azul porque la atmósfera terrestre dispersa la luz solar de longitud de onda corta (azul y violeta) más que las de longitud de onda larga, un fenómeno conocido como dispersión de Rayleigh.';
  const words = text.split(/(\s+)/);

  stage.innerHTML = `
    <div class="stage-controls">
      <button id="strGo" class="primary">▶ Comparar lado a lado</button>
      <button id="strReset">Reiniciar</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div>
        <div style="font-size:13px;font-weight:700;color:var(--orange);margin-bottom:8px;">❌ Sin streaming</div>
        <div id="strNoStream" style="background:var(--bg);border:1px solid var(--border);padding:16px;border-radius:10px;min-height:140px;font-size:14px;line-height:1.7;"></div>
        <div id="strNoTime" style="font-size:12px;color:var(--muted);margin-top:6px;min-height:18px;"></div>
      </div>
      <div>
        <div style="font-size:13px;font-weight:700;color:var(--green);margin-bottom:8px;">✅ Con streaming</div>
        <div id="strStream" style="background:var(--bg);border:1px solid var(--border);padding:16px;border-radius:10px;min-height:140px;font-size:14px;line-height:1.7;"></div>
        <div id="strTime" style="font-size:12px;color:var(--muted);margin-top:6px;min-height:18px;"></div>
      </div>
    </div>
    <div style="margin-top:16px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div id="strNoEvents" style="background:var(--surface);border:1px solid var(--border);padding:14px;border-radius:8px;font-family:'SF Mono',Menlo,monospace;font-size:11px;color:var(--muted);min-height:80px;"></div>
        <div id="strEvents" style="background:var(--surface);border:1px solid var(--border);padding:14px;border-radius:8px;font-family:'SF Mono',Menlo,monospace;font-size:11px;color:var(--muted);min-height:80px;overflow-y:auto;max-height:150px;"></div>
      </div>
    </div>
  `;

  async function run() {
    const noStream = document.getElementById('strNoStream');
    const stream = document.getElementById('strStream');
    const noTime = document.getElementById('strNoTime');
    const sTime = document.getElementById('strTime');
    const noEvents = document.getElementById('strNoEvents');
    const sEvents = document.getElementById('strEvents');

    noStream.innerHTML = '';
    stream.innerHTML = '';
    noEvents.innerHTML = '';
    sEvents.innerHTML = '';
    noTime.textContent = '';
    sTime.textContent = '';

    // Simulate: streaming starts immediately, no-stream waits
    const totalTime = words.length * 60; // ~60ms per word
    const ttft = 280;

    // Left side: blank, waiting
    noStream.innerHTML = '<span style="color:var(--muted);">Esperando...</span>';
    noEvents.textContent = 'Esperando respuesta completa del servidor...';

    // Right side: start streaming
    sTime.textContent = `TTFT: ${ttft}ms ← primera palabra visible`;
    sEvents.innerHTML = '<span style="color:var(--green)">data: {"token": "El"}</span>\n';

    stream.innerHTML = '';
    let streamText = '';
    const cursor = '<span style="display:inline-block;width:8px;height:16px;background:var(--accent);vertical-align:middle;animation:blink 1s infinite;margin-left:2px;"></span>';

    for (let i = 0; i < words.length; i++) {
      streamText += words[i];
      stream.innerHTML = streamText + cursor;

      if (i < 8 || i % 4 === 0) {
        const clean = words[i].trim();
        if (clean) sEvents.innerHTML += `<span style="color:var(--green)">data: {"token": "${clean}"}</span>\n`;
        sEvents.scrollTop = 99999;
      }

      await new Promise(r => setTimeout(r, 60));
    }
    stream.innerHTML = streamText;
    sTime.textContent = `TTFT: ${ttft}ms · Total: ${(totalTime/1000).toFixed(1)}s`;
    sEvents.innerHTML += '<span style="color:var(--accent)">data: [DONE]</span>';

    // Now show no-stream result (appears all at once after same total time)
    await new Promise(r => setTimeout(r, 200));
    noStream.innerHTML = text;
    noTime.textContent = `TTFT: ${(totalTime/1000).toFixed(1)}s ← el usuario esperó todo ese tiempo en blanco`;
    noEvents.innerHTML = '<span style="color:var(--orange)">HTTP 200 → body completo de golpe</span>';
  }

  document.getElementById('strGo').addEventListener('click', run);
  document.getElementById('strReset').addEventListener('click', () => {
    ['strNoStream','strStream','strNoEvents','strEvents'].forEach(id => document.getElementById(id).innerHTML = '');
    ['strNoTime','strTime'].forEach(id => document.getElementById(id).textContent = '');
  });
};

// Mini: why streaming matters for UX
ANIMATIONS._str2 = function(mount) {
  const steps = [
    { type: 'result', icon: '⚡', head: 'TTFT (Time To First Token)', body: 'Con streaming: ~200-500ms. Sin streaming: segundos. La métrica de UX más importante.' },
    { type: 'result', icon: '⏹', head: 'Cancelable', body: 'Si ves que va mal, paras a mitad y ahorras tokens de output.' },
    { type: 'act',    icon: '🔄', head: 'UI viva', body: 'El usuario ve actividad inmediata. La percepción de velocidad es radicalmente mejor.' },
    { type: 'fail',   icon: '🔧', head: 'Limitación: tool calls', body: 'Las tool calls NO se streamean: la IA tiene que generar el JSON completo antes de ejecutar.' },
    { type: 'fail',   icon: '💰', head: 'No ahorra dinero', body: 'El coste total es el mismo (mismos tokens). Solo cambia cuándo los ves.' },
    { type: 'done',   icon: '💡', head: 'Implementación', body: 'Server-Sent Events (SSE). Cada token llega como un evento <code>data:</code> por HTTP.' },
  ];
  mount.innerHTML = '<div class="mini-controls"><button class="primary" id="str2Go">▶ Detalles clave</button></div><div class="vtl" id="str2Vtl"></div>';
  function build() {
    document.getElementById('str2Vtl').innerHTML = steps.map((s, i) => `
      <div class="vtl-step s-${s.type}" id="str2-s${i}">
        <div class="vtl-dot">${s.icon}</div>
        <div class="vtl-card"><div class="vtl-head">${s.head}</div>${s.body}</div>
      </div>`).join('');
  }
  async function run() {
    build();
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      document.getElementById('str2-s' + i).classList.add('show');
    }
  }
  document.getElementById('str2Go').addEventListener('click', run);
  build();
};
