const ANIMATIONS = {};

// ========== TEMPERATURE ==========
ANIMATIONS.temperature = function(stage) {
  stage.innerHTML = `
    <div class="stage-controls">
      <label style="flex:1;min-width:300px;">
        Temperatura:
        <input type="range" id="tempSlider" min="0" max="20" value="7" style="flex:1;min-width:200px">
        <span class="temp-value" id="tempVal">0.7</span>
      </label>
      <button id="tempGen" class="primary">Generar muestras ▶</button>
    </div>

    <div>
      <div class="label" style="font-size:11px;text-transform:uppercase;color:var(--muted);letter-spacing:0.5px;margin:0 0 8px;">Distribución de probabilidad — "El dragón ___"</div>
      <div class="temp-rows" id="tempBars"></div>
      <div class="stage-status" style="margin-top:12px;" id="tempStatus"></div>
    </div>

    <div style="margin-top:20px;">
      <div class="label" style="font-size:11px;text-transform:uppercase;color:var(--muted);letter-spacing:0.5px;margin:0 0 8px;">10 respuestas generadas para: "El dragón..."</div>
      <div class="temp-samples" id="tempSamples"></div>
    </div>
  `;

  const words = ['dormía', 'volaba', 'rugió', 'desapareció', 'cantó', 'sonrió', 'bailaba', 'soñaba', 'lloraba', 'exhaló'];
  // probabilidades base (softmax-ish)
  const baseLogits = [5.2, 4.8, 4.5, 3.5, 2.8, 2.5, 2.2, 2.0, 1.8, 1.5];

  function softmax(logits, T) {
    const scaled = logits.map(l => l / Math.max(T, 0.01));
    const max = Math.max(...scaled);
    const exps = scaled.map(x => Math.exp(x - max));
    const sum = exps.reduce((a,b) => a+b, 0);
    return exps.map(e => e / sum);
  }

  function renderBars(T) {
    const probs = softmax(baseLogits, T);
    const maxP = Math.max(...probs);
    const container = document.getElementById('tempBars');
    container.innerHTML = words.map((w, i) => `
      <div class="temp-row ${i === 0 ? 'top' : ''}">
        <span class="tw">${w}</span>
        <div class="tbar-wrap"><div class="tbar" style="width:${(probs[i]/maxP)*100}%"></div></div>
        <span class="tpct">${(probs[i]*100).toFixed(1)}%</span>
      </div>
    `).join('');
    const status = document.getElementById('tempStatus');
    if (T < 0.3) status.textContent = '🧊 T baja: la opción más probable domina. Respuestas predecibles y repetitivas.';
    else if (T < 1.1) status.textContent = '🌤  T media: hay variedad pero con preferencia clara. Tono natural.';
    else status.textContent = '🔥 T alta: curva aplanada. Opciones raras casi igualan a las probables. Creativo o caótico.';
  }

  function sample(T) {
    const probs = softmax(baseLogits, T);
    const r = Math.random();
    let acc = 0;
    for (let i = 0; i < probs.length; i++) {
      acc += probs[i];
      if (r < acc) return words[i];
    }
    return words[0];
  }

  async function generate() {
    const T = parseFloat(document.getElementById('tempSlider').value) / 10;
    const samples = document.getElementById('tempSamples');
    samples.innerHTML = '';
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 150));
      const div = document.createElement('div');
      div.className = 'temp-sample';
      const w = sample(T);
      div.innerHTML = `<span style="color:var(--muted)">El dragón</span> <strong style="color:var(--accent)">${w}</strong>.`;
      samples.appendChild(div);
    }
  }

  const slider = document.getElementById('tempSlider');
  const val = document.getElementById('tempVal');
  slider.addEventListener('input', () => {
    const T = parseFloat(slider.value) / 10;
    val.textContent = T.toFixed(1);
    renderBars(T);
  });
  document.getElementById('tempGen').addEventListener('click', generate);

  renderBars(0.7);
  generate();
};


ANIMATIONS._topkp = function(mount) {
  // Probabilidades descendentes de ejemplo (ya como %)
  const candidates = [
    { w: 'dormía', p: 28 }, { w: 'volaba', p: 19 }, { w: 'rugió', p: 14 },
    { w: 'desapareció', p: 9 }, { w: 'cantó', p: 7 }, { w: 'sonrió', p: 6 },
    { w: 'bailaba', p: 5 }, { w: 'soñaba', p: 5 }, { w: 'lloraba', p: 4 },
    { w: 'exhaló', p: 3 }
  ];

  mount.innerHTML = `
    <div class="mini-controls">
      <label>top-k: <input type="range" id="topk" min="1" max="10" value="10" style="width:140px"> <span id="topkVal">10</span></label>
      <label>top-p: <input type="range" id="topp" min="10" max="100" value="100" style="width:140px"> <span id="toppVal">1.00</span></label>
    </div>
    <div class="temp-rows" id="topkpViz"></div>
    <div style="margin-top:12px;font-size:12.5px;color:var(--muted);line-height:1.5" id="topkpStatus"></div>
  `;

  function render() {
    const k = parseInt(document.getElementById('topk').value);
    const p = parseInt(document.getElementById('topp').value) / 100;
    document.getElementById('topkVal').textContent = k;
    document.getElementById('toppVal').textContent = p.toFixed(2);

    let cum = 0;
    const keptByP = new Set();
    for (let i = 0; i < candidates.length; i++) {
      if (cum < p * 100) { keptByP.add(i); cum += candidates[i].p; }
    }

    const maxP = candidates[0].p;
    const viz = document.getElementById('topkpViz');
    viz.innerHTML = candidates.map((c, i) => {
      const kept = i < k && keptByP.has(i);
      return `
        <div class="temp-row ${kept ? 'top' : ''}" style="${kept ? '' : 'opacity:0.25'}">
          <span class="tw">${c.w}</span>
          <div class="tbar-wrap"><div class="tbar" style="width:${(c.p/maxP)*100}%;${kept ? '' : 'background:var(--border)'}"></div></div>
          <span class="tpct">${c.p}%</span>
        </div>`;
    }).join('');

    const kept = candidates.filter((c, i) => i < k && keptByP.has(i));
    const keptNames = kept.map(c => `<strong style="color:var(--green)">${c.w}</strong>`).join(', ');
    const excluded = candidates.length - kept.length;
    document.getElementById('topkpStatus').innerHTML = `
      ✅ <b>Supervivientes:</b> ${keptNames || '<span style="color:var(--orange)">ninguno</span>'} (${kept.length} de ${candidates.length})<br>
      ❌ <b>Descartados:</b> ${excluded}. El modelo no puede elegirlos aunque tuvieran probabilidad.
    `;
  }

  document.getElementById('topk').addEventListener('input', render);
  document.getElementById('topp').addEventListener('input', render);
  render();
};

