const id = typeof CONCEPT_ID !== 'undefined' ? CONCEPT_ID : new URLSearchParams(location.search).get('id');
const concept = CONCEPTS.find(c => c.id === id);

if (!concept) {
  document.getElementById('title').textContent = 'Concepto no encontrado';
} else {
  document.title = concept.title + ' — IA';
  document.getElementById('title').textContent = concept.title;
  document.getElementById('subtitle').textContent = concept.tag;

  const hero = document.getElementById('hero');
  hero.innerHTML = `
    <div class="big-icon">${concept.icon}</div>
    <div class="hero-text">
      <h2>La analogía</h2>
      <div class="analogy">${concept.analogy}</div>
    </div>
  `;

  const explain = document.getElementById('explain');
  explain.innerHTML = `
    <div class="block">
      <h3>📖 Definición</h3>
      <p>${concept.definition}</p>
    </div>
    <div class="block">
      <h3>🚫 Sin esto</h3>
      <p>${concept.without}</p>
    </div>
    <div class="block">
      <h3>✅ Con esto</h3>
      <p>${concept.with}</p>
    </div>
    <div class="block">
      <h3>💡 Ejemplo</h3>
      <p>${concept.example}</p>
    </div>
  `;

  // Deep dive
  const dd = document.getElementById('deepDive');
  if (concept.deepDive) {
    dd.innerHTML = concept.deepDive;
    // Mount any mini-animations declared inside deep-dive
    dd.querySelectorAll('[data-mini]').forEach(el => {
      const name = el.dataset.mini;
      const mount = el.querySelector(`#${name}-mount`);
      const fn = ANIMATIONS['_' + name];
      if (mount && fn) fn(mount);
    });
  } else {
    dd.innerHTML = '';
  }

  // Animation
  const stage = document.getElementById('stage');
  if (ANIMATIONS[id]) {
    ANIMATIONS[id](stage);
  } else {
    stage.innerHTML = '<div style="text-align:center;padding:60px;color:var(--muted);"><p style="font-size:40px;margin-bottom:16px;">🔜</p><p>Animación en preparación para este concepto.</p></div>';
  }

  // Nav prev / next
  const animIds = ['llm','tokens','prompt','system_prompt','temperature','streaming','context_window','cot','multimodal','tools','function_calling','skills','embeddings','vector_db','rag','memory','compaction','fine_tuning','agent','orchestrator','subagents','mcp','hallucination','guardrails','prompt_injection','alignment'];
  const withAnim = animIds.map(aid => CONCEPTS.find(c => c.id === aid)).filter(Boolean);
  const idx = withAnim.findIndex(c => c.id === id);
  const prev = idx > 0 ? withAnim[idx - 1] : null;
  const next = idx >= 0 && idx < withAnim.length - 1 ? withAnim[idx + 1] : null;
  const nav = document.getElementById('nav');
  nav.innerHTML = `
    <a href="${prev ? '../' + prev.id + '/index.html' : '#'}" class="${prev ? '' : 'disabled'}">
      <span class="dir">← Anterior</span>
      ${prev ? prev.icon + ' ' + prev.title : 'Primero'}
    </a>
    <a href="${next ? '../' + next.id + '/index.html' : '#'}" class="next ${next ? '' : 'disabled'}">
      <span class="dir">Siguiente →</span>
      ${next ? next.icon + ' ' + next.title : 'Último'}
    </a>
  `;
}
