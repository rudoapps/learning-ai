const ANIMATIONS = {};

// ========== COMPACTION ==========
ANIMATIONS.compaction = function(stage) {
  stage.innerHTML = `
    <div class="stage-controls">
      <button id="compGo" class="primary">▶ Simular compactación</button>
      <button id="compReset">Reiniciar</button>
    </div>
    <div style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:4px;">
        <span>Contexto usado</span>
        <span id="compCount">0 / 200.000 tokens</span>
      </div>
      <div style="height:28px;background:var(--surface-2);border-radius:8px;overflow:hidden;border:1px solid var(--border);">
        <div id="compBar" style="height:100%;width:0%;border-radius:8px;transition:width 0.8s,background 0.5s;"></div>
      </div>
    </div>
    <div class="tool-flow" id="compFlow" style="max-height:380px;"></div>
  `;

  function setBar(tokens, max) {
    const pct = (tokens / max) * 100;
    const bar = document.getElementById('compBar');
    bar.style.width = pct + '%';
    if (pct > 85) bar.style.background = 'linear-gradient(90deg, #f85149, #f78166)';
    else if (pct > 50) bar.style.background = 'linear-gradient(90deg, var(--yellow), var(--orange))';
    else bar.style.background = 'linear-gradient(90deg, var(--accent), var(--purple))';
    document.getElementById('compCount').textContent = tokens.toLocaleString('es') + ' / 200.000 tokens (' + pct.toFixed(0) + '%)';
  }

  const steps = [
    { cls: 'tf-exec', label: '📋 Inicio de conversación', text: 'System prompt + primer mensaje del usuario', bar: 8200, delay: 800 },
    { cls: 'tf-answer', label: '🤖 15 mensajes después...', text: 'Discutiendo esquema de BBDD, índices, migraciones...', bar: 45000, delay: 1000 },
    { cls: 'tf-answer', label: '🤖 35 mensajes después...', text: 'Código SQL, triggers, tests, seeding, edge cases...', bar: 112000, delay: 1000 },
    { cls: 'tf-answer', label: '🤖 50 mensajes después...', text: 'Políticas de retención, datos legacy, CSV importado...', bar: 178000, delay: 1000 },
    { cls: 'tf-call', label: '🚨 Umbral alcanzado (89%)', text: '¡El siguiente mensaje podría desbordar!\nEl sistema dispara compactación automática.', bar: 178000, delay: 1500 },
    { cls: 'tf-think', label: '🧠 La IA resume la conversación', text: 'Condensar 50 mensajes en un resumen que preserve:\n• Decisiones tomadas\n• Esquemas acordados\n• Convenciones de nombres\n• Problemas resueltos\n\nDescartar: charla, reformulaciones, ejemplos intermedios.', bar: 178000, delay: 2000 },
    { cls: 'tf-result', label: '✅ Resumen generado (6.800 tokens output)', text: 'RESUMEN:\n• Proyecto: tienda online con PostgreSQL 15\n• Esquema: users, products, categories, orders, order_items, payments\n• Convención: snake_case, UUIDs, timestamps con zona\n• Decisiones: índice GIN en products.tags, soft-delete, partición por fecha\n• Pendiente: política de retención + migrar CSV legacy', bar: 178000, delay: 1800 },
    { cls: 'tf-exec', label: '🔄 Reemplazo del contexto', text: 'Se eliminan los 50 mensajes originales.\nSe inyecta el resumen + los 4 últimos mensajes literales.', bar: 11200, delay: 1500 },
    { cls: 'tf-answer', label: '✨ Contexto compactado', text: 'De 178.000 → 11.200 tokens (6% del límite).\nLa conversación puede continuar con espacio de sobra.\n\n⚖️ Tradeoff: si el resumen omitió algo, la IA lo ha "olvidado".\nPor eso un buen resumen es crítico.', bar: 11200, delay: 1500 },
  ];

  function reset() {
    setBar(0, 200000);
    document.getElementById('compFlow').innerHTML = '<div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver cómo el contexto se llena y se compacta</div></div>';
  }

  async function run() {
    const flow = document.getElementById('compFlow');
    flow.innerHTML = '';
    for (const s of steps) {
      setBar(s.bar, 200000);
      const d = document.createElement('div');
      d.className = 'tf-step';
      d.innerHTML = `<div class="tf-label">${s.label}</div><div class="tf-box ${s.cls}"><pre>${s.text}</pre></div>`;
      flow.appendChild(d);
      flow.scrollTop = 99999;
      await new Promise(r => setTimeout(r, s.delay));
    }
  }

  document.getElementById('compGo').addEventListener('click', run);
  document.getElementById('compReset').addEventListener('click', reset);
  reset();
};

// ========== MINI: COMPACTION 2 — what survives ==========
ANIMATIONS._comp2 = function(mount) {
  const before = [
    { icon: '💬', text: 'Msg 1: "Ayúdame con una BBDD para tienda online"', keep: true },
    { icon: '🤖', text: 'Msg 2: "Claro, propongo tablas users, products..."', keep: false },
    { icon: '💬', text: 'Msg 3: "¿Y si usamos UUIDs?"', keep: false },
    { icon: '🤖', text: 'Msg 4: "Buena idea, UUIDs como PK, ventajas..."', keep: false },
    { icon: '💬', text: 'Msg 5: "¿Índice GIN para tags?"', keep: false },
    { icon: '🤖', text: 'Msg 6: "Sí, GIN para búsquedas multi-tag..."', keep: false },
    { icon: '💬', text: 'Msg 7: "¿Soft delete en users?"', keep: false },
    { icon: '🤖', text: 'Msg 8: "Sí, con campo deleted_at..."', keep: false },
  ];
  const summary = '📦 RESUMEN: tienda online, PostgreSQL, UUIDs como PK, GIN en tags, soft-delete con deleted_at';

  mount.innerHTML = `
    <div class="mini-controls"><button class="primary" id="comp2Go">▶ Simular</button></div>
    <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:14px;align-items:start;margin-top:10px;">
      <div>
        <div style="font-size:11px;text-transform:uppercase;color:var(--muted);letter-spacing:0.5px;margin-bottom:6px;">Antes (8 mensajes)</div>
        <div id="comp2Before" style="display:flex;flex-direction:column;gap:4px;"></div>
      </div>
      <div style="font-size:28px;padding-top:80px;color:var(--muted);" id="comp2Arrow">→</div>
      <div>
        <div style="font-size:11px;text-transform:uppercase;color:var(--muted);letter-spacing:0.5px;margin-bottom:6px;">Después (1 resumen)</div>
        <div id="comp2After"></div>
      </div>
    </div>
  `;

  async function run() {
    const bef = document.getElementById('comp2Before');
    const aft = document.getElementById('comp2After');
    bef.innerHTML = '';
    aft.innerHTML = '';
    document.getElementById('comp2Arrow').style.color = 'var(--muted)';

    // show messages appearing
    for (let i = 0; i < before.length; i++) {
      const m = before[i];
      const d = document.createElement('div');
      d.id = 'comp2-m' + i;
      d.style.cssText = 'padding:6px 10px;border-radius:6px;font-size:12px;background:var(--surface-2);border:1px solid var(--border);transition:all 0.5s;';
      d.textContent = m.icon + ' ' + m.text;
      bef.appendChild(d);
      await new Promise(r => setTimeout(r, 300));
    }

    await new Promise(r => setTimeout(r, 800));

    // fade out non-kept
    for (let i = 0; i < before.length; i++) {
      if (!before[i].keep) {
        const el = document.getElementById('comp2-m' + i);
        el.style.opacity = '0.2';
        el.style.textDecoration = 'line-through';
      }
    }

    document.getElementById('comp2Arrow').style.color = 'var(--green)';
    await new Promise(r => setTimeout(r, 600));

    // show summary
    aft.innerHTML = `<div style="padding:12px 14px;border-radius:8px;background:rgba(63,185,80,0.1);border:1px solid var(--green);font-size:13px;line-height:1.6;animation:slideIn 0.4s;">${summary}<br><br><span style="font-size:11px;color:var(--muted);">8 mensajes → 1 párrafo<br>~2.000 tokens → ~120 tokens<br>La info se conserva, el detalle se pierde</span></div>`;
  }

  document.getElementById('comp2Go').addEventListener('click', run);
};
