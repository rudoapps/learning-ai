const ANIMATIONS = {};

ANIMATIONS.embeddings = function(stage) {
  // Interactive 2D map of words
  const words = [
    { text: 'perro', x: 25, y: 30, group: 'animal' },
    { text: 'gato', x: 30, y: 25, group: 'animal' },
    { text: 'cachorro', x: 22, y: 35, group: 'animal' },
    { text: 'mascota', x: 28, y: 38, group: 'animal' },
    { text: 'lobo', x: 18, y: 28, group: 'animal' },
    { text: 'rey', x: 72, y: 25, group: 'royalty' },
    { text: 'reina', x: 76, y: 22, group: 'royalty' },
    { text: 'príncipe', x: 78, y: 30, group: 'royalty' },
    { text: 'corona', x: 70, y: 18, group: 'royalty' },
    { text: 'trono', x: 74, y: 32, group: 'royalty' },
    { text: 'manzana', x: 45, y: 72, group: 'food' },
    { text: 'naranja', x: 50, y: 68, group: 'food' },
    { text: 'plátano', x: 42, y: 78, group: 'food' },
    { text: 'cocinar', x: 55, y: 75, group: 'food' },
    { text: 'receta', x: 52, y: 80, group: 'food' },
    { text: 'coche', x: 75, y: 70, group: 'vehicle' },
    { text: 'avión', x: 80, y: 65, group: 'vehicle' },
    { text: 'tren', x: 72, y: 75, group: 'vehicle' },
    { text: 'viajar', x: 78, y: 78, group: 'vehicle' },
  ];

  const groupColors = {
    animal: 'var(--accent)',
    royalty: 'var(--purple)',
    food: 'var(--green)',
    vehicle: 'var(--orange)'
  };

  stage.innerHTML = `
    <div class="stage-controls">
      <button id="embGo" class="primary">▶ Animar agrupación</button>
      <span style="font-size:12px;color:var(--muted);">Haz clic en una palabra para ver sus vecinos más cercanos</span>
    </div>
    <div id="embMap" style="position:relative;height:400px;background:var(--bg);border:1px solid var(--border);border-radius:10px;overflow:hidden;"></div>
    <div id="embInfo" style="margin-top:10px;font-size:13px;color:var(--muted);min-height:24px;"></div>
    <div style="display:flex;gap:16px;margin-top:8px;font-size:12px;flex-wrap:wrap;">
      <span style="color:var(--accent)">● Animales</span>
      <span style="color:var(--purple)">● Realeza</span>
      <span style="color:var(--green)">● Comida</span>
      <span style="color:var(--orange)">● Vehículos</span>
    </div>
  `;

  const map = document.getElementById('embMap');

  function dist(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  function render(highlight) {
    map.innerHTML = '';
    // Draw connection lines for highlighted
    if (highlight) {
      const neighbors = words.filter(w => w !== highlight).sort((a, b) => dist(highlight, a) - dist(highlight, b)).slice(0, 3);
      for (const n of neighbors) {
        const line = document.createElement('div');
        const x1 = highlight.x, y1 = highlight.y, x2 = n.x, y2 = n.y;
        const len = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
        const ang = Math.atan2(y2-y1, x2-x1) * 180 / Math.PI;
        line.style.cssText = `position:absolute;left:${x1}%;top:${y1}%;width:${len}%;height:2px;background:rgba(255,255,255,0.15);transform-origin:0 50%;transform:rotate(${ang}deg);z-index:0;`;
        map.appendChild(line);
      }
    }

    for (const w of words) {
      const el = document.createElement('div');
      const isHighlighted = highlight && w === highlight;
      const isNeighbor = highlight && words.filter(ww => ww !== highlight).sort((a, b) => dist(highlight, a) - dist(highlight, b)).slice(0, 3).includes(w);
      const opacity = highlight ? (isHighlighted || isNeighbor ? 1 : 0.2) : 0.9;
      const scale = isHighlighted ? 1.3 : (isNeighbor ? 1.1 : 1);
      el.style.cssText = `position:absolute;left:${w.x}%;top:${w.y}%;transform:translate(-50%,-50%) scale(${scale});padding:4px 10px;border-radius:14px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.4s;opacity:${opacity};background:${groupColors[w.group]};color:white;white-space:nowrap;z-index:${isHighlighted ? 3 : 1};`;
      if (isHighlighted) el.style.boxShadow = `0 0 20px ${groupColors[w.group]}`;
      el.textContent = w.text;
      el.addEventListener('click', () => {
        render(w);
        const neighbors = words.filter(ww => ww !== w).sort((a, b) => dist(w, a) - dist(w, b)).slice(0, 3);
        document.getElementById('embInfo').innerHTML = `<strong style="color:${groupColors[w.group]}">"${w.text}"</strong> → vecinos más cercanos: ${neighbors.map(n => `<strong style="color:${groupColors[n.group]}">${n.text}</strong>`).join(', ')}`;
      });
      map.appendChild(el);
    }
  }

  // Animate: start scattered, then cluster
  document.getElementById('embGo').addEventListener('click', () => {
    // scatter randomly
    const saved = words.map(w => ({ x: w.x, y: w.y }));
    words.forEach(w => { w.x = 15 + Math.random() * 70; w.y = 10 + Math.random() * 80; });
    render(null);
    document.getElementById('embInfo').textContent = 'Posiciones aleatorias... el modelo de embeddings las agrupa por significado →';

    setTimeout(() => {
      words.forEach((w, i) => { w.x = saved[i].x; w.y = saved[i].y; });
      render(null);
      document.getElementById('embInfo').textContent = 'Agrupados por significado. Cosas parecidas caen cerca. Haz clic en cualquiera.';
    }, 1500);
  });

  render(null);
};

// Mini: how similarity search works
ANIMATIONS._emb2 = function(mount) {
  const steps = [
    { type: 'user',   icon: '💬', head: 'Pregunta del usuario', body: '"¿Cuánto cobro si llego tarde?"' },
    { type: 'act',    icon: '🔢', head: 'Se convierte en vector', body: '[0.012, -0.087, 0.034, 0.111, ...] (1536 números)' },
    { type: 'act',    icon: '🔍', head: 'Búsqueda por similitud coseno', body: 'Se compara con miles de vectores guardados en la BBDD' },
    { type: 'result', icon: '🎯', head: 'Match semántico', body: 'Encuentra: "penalización por demora en la entrega"<br>Score: 0.91 — ¡aunque no comparten ni una palabra!' },
    { type: 'fail',   icon: '🔤', head: 'Búsqueda por texto (Ctrl+F)', body: '"cobro" → 0 resultados. "tarde" → resultados irrelevantes.<br>La búsqueda exacta falla aquí.' },
    { type: 'done',   icon: '✅', head: 'Ventaja de embeddings', body: 'Buscan por SIGNIFICADO, no por palabras exactas' },
  ];
  mount.innerHTML = '<div class="mini-controls"><button class="primary" id="emb2Go">▶ Comparar búsquedas</button></div><div class="vtl" id="emb2Vtl"></div>';
  function build() {
    document.getElementById('emb2Vtl').innerHTML = steps.map((s, i) => `
      <div class="vtl-step s-${s.type}" id="emb2-s${i}">
        <div class="vtl-dot">${s.icon}</div>
        <div class="vtl-card"><div class="vtl-head">${s.head}</div>${s.body}</div>
      </div>`).join('');
  }
  async function run() {
    build();
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      document.getElementById('emb2-s' + i).classList.add('show');
    }
  }
  document.getElementById('emb2Go').addEventListener('click', run);
  build();
};
