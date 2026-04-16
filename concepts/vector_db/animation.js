const ANIMATIONS = {};

ANIMATIONS.vector_db = function(stage) {
  stage.innerHTML = `
    <div class="stage-controls">
      <button id="vdbGo" class="primary">▶ Reproducir</button>
      <button id="vdbReset">Reiniciar</button>
      <span style="font-size:12px;color:var(--muted);">Búsqueda por palabras vs búsqueda vectorial</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div>
        <div style="font-size:13px;font-weight:700;color:var(--orange);margin-bottom:8px;">🔤 BBDD tradicional (SQL LIKE)</div>
        <div class="tool-flow" id="vdbSql" style="min-height:200px;"></div>
      </div>
      <div>
        <div style="font-size:13px;font-weight:700;color:var(--green);margin-bottom:8px;">🧠 Base vectorial (semántica)</div>
        <div class="tool-flow" id="vdbVec" style="min-height:200px;"></div>
      </div>
    </div>
  `;

  async function add(containerId, label, cls, text) {
    const el = document.getElementById(containerId);
    const d = document.createElement('div');
    d.className = 'tf-step';
    d.innerHTML = `<div class="tf-label">${label}</div><div class="tf-box ${cls}"><pre>${text}</pre></div>`;
    el.appendChild(d);
    el.scrollTop = 99999;
  }

  async function run() {
    document.getElementById('vdbSql').innerHTML = '';
    document.getElementById('vdbVec').innerHTML = '';

    await add('vdbSql', '💬 Búsqueda', 'tf-user', '"¿Cuánto cobro si llego tarde?"');
    await add('vdbVec', '💬 Búsqueda', 'tf-user', '"¿Cuánto cobro si llego tarde?"');
    await new Promise(r => setTimeout(r, 800));

    await add('vdbSql', '🔍 SQL LIKE', 'tf-call', "SELECT * FROM docs\nWHERE text LIKE '%cobro%'\n  AND text LIKE '%tarde%'");
    await add('vdbVec', '🔢 Embed + búsqueda coseno', 'tf-call', 'query_vector = embed("¿Cuánto cobro si llego tarde?")\nSELECT * FROM docs\nORDER BY cosine_sim(vector, query_vector)\nLIMIT 3');
    await new Promise(r => setTimeout(r, 1200));

    await add('vdbSql', '❌ 0 resultados', 'tf-exec', 'Ningún documento contiene literalmente\n"cobro" Y "tarde" juntos.\n\nLa cláusula real usa "penalización" y "demora".\nCtrl+F no puede encontrar sinónimos.');
    await new Promise(r => setTimeout(r, 800));

    await add('vdbVec', '✅ 3 resultados relevantes', 'tf-answer', '1. "Penalización por demora en la entrega" (0.91)\n2. "Cláusula de retraso y compensación"  (0.87)\n3. "Multas por incumplimiento de plazos"  (0.82)\n\n¡Encontró lo que buscabas aunque no comparten\nninguna palabra con tu pregunta!');
    await new Promise(r => setTimeout(r, 1200));

    await add('vdbSql', '💡 Limitación', 'tf-exec', 'Busca por texto exacto.\nSolo encuentra si las palabras coinciden literalmente.');
    await add('vdbVec', '💡 Superpoder', 'tf-result', 'Busca por significado.\nEncuentra conceptos relacionados aunque\nusen vocabulario completamente distinto.');
  }

  document.getElementById('vdbGo').addEventListener('click', run);
  document.getElementById('vdbReset').addEventListener('click', () => {
    document.getElementById('vdbSql').innerHTML = '';
    document.getElementById('vdbVec').innerHTML = '';
  });
};

ANIMATIONS._vdb2 = function(mount) {
  const steps = [
    { type: 'result', icon: '🌲', head: 'Pinecone', body: 'Cloud, serverless, el más popular. Fácil de empezar. Plan gratis disponible.' },
    { type: 'result', icon: '🔷', head: 'Qdrant', body: 'Open source, Rust, muy rápido. Auto-hosteable o cloud. Filtros avanzados.' },
    { type: 'result', icon: '🔶', head: 'Weaviate', body: 'Open source, hybrid search (vectorial + keyword). Módulos de ML integrados.' },
    { type: 'result', icon: '🐘', head: 'pgvector', body: 'Extensión de PostgreSQL. Si ya usas Postgres, no necesitas BBDD extra.' },
    { type: 'act',    icon: '📊', head: 'Chromadb', body: 'Para prototipos y desarrollo local. Muy fácil de usar. No para producción pesada.' },
    { type: 'done',   icon: '💡', head: '¿Cuál elegir?', body: '¿Ya tienes Postgres? → pgvector. ¿Prototipo? → Chroma. ¿Producción seria? → Pinecone o Qdrant.' },
  ];
  mount.innerHTML = '<div class="mini-controls"><button class="primary" id="vdb2Go">▶ Comparar opciones</button></div><div class="vtl" id="vdb2Vtl"></div>';
  function build() {
    document.getElementById('vdb2Vtl').innerHTML = steps.map((s, i) => `
      <div class="vtl-step s-${s.type}" id="vdb2-s${i}">
        <div class="vtl-dot">${s.icon}</div>
        <div class="vtl-card"><div class="vtl-head">${s.head}</div>${s.body}</div>
      </div>`).join('');
  }
  async function run() {
    build();
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      document.getElementById('vdb2-s' + i).classList.add('show');
    }
  }
  document.getElementById('vdb2Go').addEventListener('click', run);
  build();
};
