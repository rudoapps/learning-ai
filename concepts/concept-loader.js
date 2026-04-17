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

  // Quiz link
  const quizLink = document.createElement('section');
  quizLink.className = 'quiz-link-section';
  quizLink.innerHTML = `<a href="../../quiz/index.html" class="quiz-link-card">🧪 <strong>Haz el quiz</strong> — comprueba lo que has aprendido sobre ${concept.title} y los demás conceptos</a>`;
  document.getElementById('nav').before(quizLink);

  // Related concepts
  const relatedMap = {
    llm: ['tokens','temperature','context_window','hallucination'],
    tokens: ['llm','context_window','compaction','streaming'],
    prompt: ['system_prompt','cot','temperature','fine_tuning'],
    system_prompt: ['prompt','tools','memory','guardrails'],
    temperature: ['llm','tokens','cot'],
    streaming: ['tokens','llm'],
    context_window: ['tokens','compaction','memory','rag'],
    cot: ['prompt','llm','temperature'],
    multimodal: ['llm','tokens','embeddings'],
    tools: ['function_calling','skills','agent','mcp'],
    function_calling: ['tools','skills','prompt'],
    skills: ['tools','agent','prompt'],
    embeddings: ['vector_db','rag','tokens'],
    vector_db: ['embeddings','rag'],
    rag: ['embeddings','vector_db','context_window','hallucination'],
    memory: ['context_window','compaction','system_prompt'],
    compaction: ['context_window','memory','tokens'],
    fine_tuning: ['rag','prompt','llm'],
    agent: ['tools','skills','orchestrator','subagents'],
    orchestrator: ['agent','subagents','skills'],
    subagents: ['agent','orchestrator'],
    mcp: ['tools','agent'],
    hallucination: ['rag','guardrails','alignment','cot'],
    guardrails: ['prompt_injection','alignment','hallucination'],
    prompt_injection: ['guardrails','alignment','tools'],
    alignment: ['guardrails','hallucination','llm'],
  };
  const related = (relatedMap[id] || []).map(rid => CONCEPTS.find(c => c.id === rid)).filter(Boolean);
  if (related.length) {
    const relEl = document.createElement('section');
    relEl.className = 'related-concepts';
    relEl.innerHTML = '<h3>Conceptos relacionados</h3><div class="related-grid">' +
      related.map(r => `<a href="../${r.id}/index.html" class="related-card"><span class="rc-icon">${r.icon}</span><span class="rc-name">${r.title}</span><span class="rc-tag">${r.tag}</span></a>`).join('') +
      '</div>';
    document.getElementById('nav').before(relEl);
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
