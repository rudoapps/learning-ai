const filtersEl = document.getElementById('filters');
const cardsEl = document.getElementById('cards');

let activeFilter = 'all';

function renderFilters() {
  const btns = [['all', 'Todos']];
  for (const [k, v] of Object.entries(CATEGORIES)) btns.push([k, v.label]);
  filtersEl.innerHTML = btns.map(([k, label]) =>
    `<button class="filter-btn ${k === activeFilter ? 'active' : ''}" data-cat="${k}">${label}</button>`
  ).join('');
  filtersEl.querySelectorAll('.filter-btn').forEach(b => {
    b.addEventListener('click', () => {
      activeFilter = b.dataset.cat;
      renderFilters();
      renderCards();
    });
  });
}

function renderCards() {
  const items = activeFilter === 'all'
    ? CONCEPTS
    : CONCEPTS.filter(c => c.category === activeFilter);

  cardsEl.innerHTML = items.map(c => {
    const cat = CATEGORIES[c.category];
    const hasAnimation = ['llm','tokens','temperature','tools','skills','agent','orchestrator','subagents','mcp','context_window','memory','compaction','rag','embeddings','fine_tuning','system_prompt','prompt','streaming','cot','function_calling','multimodal','hallucination','guardrails','prompt_injection','alignment','vector_db'].includes(c.id);
    return `
      <article class="card ${hasAnimation ? 'has-anim' : ''}" ${hasAnimation ? `onclick="location.href='../concepts/${c.id}/index.html'"` : ''}>
        ${hasAnimation ? '<span class="play-badge">▶ Ver animación</span>' : ''}
        <div class="card-head">
          <div class="card-icon">${c.icon}</div>
          <div class="card-title">
            <h2>${c.title}</h2>
            <div class="tag">${c.tag}</div>
          </div>
          <span class="category-badge ${cat.cls}">${cat.label}</span>
        </div>
        <div class="analogy">${c.analogy}</div>
        <div class="definition">${c.definition}</div>
        <div class="compare">
          <div class="without"><span class="label">Sin esto</span>${c.without}</div>
          <div class="with"><span class="label">Con esto</span>${c.with}</div>
        </div>
        <div class="example"><b>Ejemplo:</b> ${c.example}</div>
      </article>
    `;
  }).join('');
}

renderFilters();
renderCards();
