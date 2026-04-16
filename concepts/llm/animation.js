const ANIMATIONS = {};

// ========== LLM ==========
ANIMATIONS.llm = function(stage) {
  const prompt = 'El gato se sentó en';
  const chain = [
    { context: 'El gato se sentó en', probs: [
      { word: 'la', pct: 42 }, { word: 'el', pct: 28 }, { word: 'una', pct: 12 },
      { word: 'su', pct: 10 }, { word: 'mi', pct: 5 }, { word: 'aquel', pct: 3 }
    ]},
    { context: 'El gato se sentó en la', probs: [
      { word: 'alfombra', pct: 35 }, { word: 'mesa', pct: 22 }, { word: 'ventana', pct: 18 },
      { word: 'silla', pct: 12 }, { word: 'cama', pct: 8 }, { word: 'puerta', pct: 5 }
    ]},
    { context: 'El gato se sentó en la alfombra', probs: [
      { word: 'y', pct: 38 }, { word: '.', pct: 34 }, { word: ',', pct: 14 },
      { word: 'roja', pct: 6 }, { word: 'del', pct: 5 }, { word: 'junto', pct: 3 }
    ]},
    { context: 'El gato se sentó en la alfombra y', probs: [
      { word: 'se', pct: 40 }, { word: 'empezó', pct: 22 }, { word: 'cerró', pct: 15 },
      { word: 'miró', pct: 10 }, { word: 'bostezó', pct: 8 }, { word: 'ronroneó', pct: 5 }
    ]},
    { context: 'El gato se sentó en la alfombra y se', probs: [
      { word: 'durmió', pct: 38 }, { word: 'quedó', pct: 28 }, { word: 'lamió', pct: 14 },
      { word: 'acurrucó', pct: 10 }, { word: 'estiró', pct: 7 }, { word: 'fue', pct: 3 }
    ]},
    { context: 'El gato se sentó en la alfombra y se durmió', probs: [
      { word: '.', pct: 68 }, { word: 'al', pct: 12 }, { word: 'tranquil', pct: 8 },
      { word: 'enseguida', pct: 5 }, { word: 'profund', pct: 4 }, { word: 'feliz', pct: 3 }
    ]},
  ];

  stage.innerHTML = `
    <div class="stage-controls">
      <button id="llmGo" class="primary">▶ Reproducir paso a paso</button>
      <button id="llmReset">Reiniciar</button>
      <span id="llmStep" style="font-size:12px;color:var(--muted);margin-left:8px;"></span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
      <div>
        <div class="label" style="font-size:11px;text-transform:uppercase;color:var(--muted);letter-spacing:0.5px;margin-bottom:8px;">Contexto (lo que el modelo lee)</div>
        <div id="llmContext" style="background:var(--bg);border:1px solid var(--border);padding:14px;border-radius:8px;font-family:'SF Mono',Menlo,monospace;font-size:14px;min-height:80px;line-height:1.8;"></div>
      </div>
      <div>
        <div class="label" style="font-size:11px;text-transform:uppercase;color:var(--muted);letter-spacing:0.5px;margin-bottom:8px;">Probabilidades para la siguiente palabra</div>
        <div class="temp-rows" id="llmProbs" style="min-height:80px;"><div style="color:var(--muted);font-size:12px;padding:14px;">Pulsa ▶ para iniciar...</div></div>
      </div>
    </div>
    <div style="margin-top:18px;">
      <div class="label" style="font-size:11px;text-transform:uppercase;color:var(--muted);letter-spacing:0.5px;margin-bottom:6px;">Frase generada</div>
      <div class="output-stream" id="llmOutput"></div>
    </div>
  `;

  let stepIdx = 0;
  let running = false;

  function renderContext(text) {
    document.getElementById('llmContext').innerHTML = `"<span style="color:var(--muted)">${prompt}</span><span style="color:var(--accent);font-weight:600">${text.slice(prompt.length)}</span>"`;
  }
  function renderProbs(probs, pickedIdx) {
    const maxP = Math.max(...probs.map(p => p.pct));
    document.getElementById('llmProbs').innerHTML = probs.map((p, i) => `
      <div class="temp-row ${i === pickedIdx ? 'top' : ''}">
        <span class="tw">${p.word}</span>
        <div class="tbar-wrap"><div class="tbar" style="width:${(p.pct/maxP)*100}%"></div></div>
        <span class="tpct">${p.pct}%</span>
      </div>
    `).join('');
  }
  function renderOutput(text) {
    document.getElementById('llmOutput').innerHTML = `<span style="color:var(--muted)">${prompt}</span><span style="color:var(--accent);font-weight:600">${text.slice(prompt.length)}</span><span class="cursor"></span>`;
  }

  function reset() {
    stepIdx = 0;
    running = false;
    renderContext(prompt);
    document.getElementById('llmProbs').innerHTML = '<div style="color:var(--muted);font-size:12px;padding:14px;">Pulsa ▶ para iniciar...</div>';
    renderOutput(prompt);
    document.getElementById('llmStep').textContent = '';
  }

  async function play() {
    if (running) return;
    if (stepIdx >= chain.length) reset();
    running = true;

    while (stepIdx < chain.length && running) {
      const s = chain[stepIdx];
      document.getElementById('llmStep').textContent = `Paso ${stepIdx + 1} de ${chain.length}`;
      renderContext(s.context);

      // show probs without highlight
      renderProbs(s.probs, -1);
      await new Promise(r => setTimeout(r, 1000));
      if (!running) return;

      // highlight picked
      renderProbs(s.probs, 0);
      await new Promise(r => setTimeout(r, 600));
      if (!running) return;

      // add to output
      const picked = s.probs[0].word;
      let newCtx = s.context;
      if (/^[.,;!?]/.test(picked)) newCtx += picked;
      else newCtx += ' ' + picked;
      renderOutput(newCtx);
      renderContext(newCtx);

      stepIdx++;
      await new Promise(r => setTimeout(r, 400));
    }

    if (running) {
      document.getElementById('llmStep').textContent = '✅ Frase completa';
      document.getElementById('llmOutput').innerHTML += ' <span style="color:var(--green);font-size:12px;font-weight:600">[FIN]</span>';
    }
    running = false;
  }

  document.getElementById('llmGo').addEventListener('click', play);
  document.getElementById('llmReset').addEventListener('click', () => { running = false; reset(); });
  reset();
};

ANIMATIONS._strawberry = function(mount) {
  mount.innerHTML = `
    <div class="mini-controls">
      <button id="sbLetter" class="primary">Cómo lo ve un humano (letras)</button>
      <button id="sbToken">Cómo lo ve un LLM (tokens)</button>
    </div>
    <div class="strawberry-word" id="sbWord"></div>
    <div class="strawberry-verdict" id="sbVerdict"></div>
  `;
  const letters = ['s','t','r','a','w','b','e','r','r','y'];
  const tokens = ['st', 'raw', 'berry']; // tokenización ilustrativa

  async function showLetters() {
    const word = document.getElementById('sbWord');
    word.innerHTML = letters.map(l => `<span>${l}</span>`).join('');
    const verdict = document.getElementById('sbVerdict');
    verdict.className = 'strawberry-verdict';
    verdict.textContent = 'Un humano cuenta letra por letra...';
    await new Promise(r => setTimeout(r, 700));
    let rCount = 0;
    for (let i = 0; i < letters.length; i++) {
      const spans = word.querySelectorAll('span');
      spans.forEach(s => s.classList.remove('highlight'));
      spans[i].classList.add('highlight');
      if (letters[i] === 'r') {
        rCount++;
        verdict.textContent = `Va ${rCount} R${rCount > 1 ? 's' : ''} encontrada${rCount > 1 ? 's' : ''}...`;
      }
      await new Promise(r => setTimeout(r, 350));
    }
    verdict.className = 'strawberry-verdict right';
    verdict.innerHTML = `✅ <b>3 Rs</b>. Respuesta correcta.`;
  }

  function showTokens() {
    const word = document.getElementById('sbWord');
    word.innerHTML = tokens.map((t, i) => `<span class="tk tk-${i}" style="letter-spacing:1px">${t}</span>`).join('');
    const verdict = document.getElementById('sbVerdict');
    verdict.className = 'strawberry-verdict wrong';
    verdict.innerHTML = `❌ Al LLM "strawberry" le llega como 3 tokens opacos: <b>"st" + "raw" + "berry"</b>. No ve las letras individuales. Por eso si le preguntas "cuántas Rs hay", <b>tiene que adivinar</b> sin poder contarlas — y falla con frecuencia (suele decir 2 en vez de 3).`;
  }

  document.getElementById('sbLetter').addEventListener('click', showLetters);
  document.getElementById('sbToken').addEventListener('click', showTokens);
  showLetters();
};

