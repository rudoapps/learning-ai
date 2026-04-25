// Global search — Ctrl+K or click search button
(function() {
  const path = location.pathname;
  const depth = path.match(/concepts\/[^/]+\//) ? '../../' :
                path.match(/(demo-cli|demo-rag|demo-agents|demo-tokens|demo|cheatsheet|map|comparisons|quiz-advanced|quiz|workshop|paths)\//) ? '../' : '';

  // Inject search button in nav
  const nav = document.querySelector('.gnav');
  if (nav) {
    const btn = document.createElement('button');
    btn.className = 'gnav-search';
    btn.innerHTML = '<span>🔍</span> <span class="gnav-search-hint">Ctrl+K</span>';
    btn.addEventListener('click', openSearch);
    nav.appendChild(btn);
  }

  // Build modal
  const overlay = document.createElement('div');
  overlay.className = 'search-overlay';
  overlay.innerHTML = `
    <div class="search-modal">
      <input type="text" class="search-input" placeholder="Buscar concepto..." autofocus>
      <div class="search-results"></div>
      <div class="search-hint-bar">↑↓ navegar · Enter abrir · Esc cerrar</div>
    </div>
  `;
  overlay.style.display = 'none';
  document.body.appendChild(overlay);

  const input = overlay.querySelector('.search-input');
  const results = overlay.querySelector('.search-results');
  let selected = -1;
  let items = [];

  function openSearch() {
    overlay.style.display = 'flex';
    input.value = '';
    input.focus();
    renderResults('');
  }

  function closeSearch() {
    overlay.style.display = 'none';
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSearch();
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      overlay.style.display === 'none' ? openSearch() : closeSearch();
    }
    if (overlay.style.display === 'none') return;
    if (e.key === 'Escape') closeSearch();
    if (e.key === 'ArrowDown') { e.preventDefault(); selected = Math.min(selected + 1, items.length - 1); highlight(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); selected = Math.max(selected - 1, 0); highlight(); }
    if (e.key === 'Enter' && items[selected]) {
      location.href = items[selected].href;
    }
  });

  function highlight() {
    results.querySelectorAll('.search-item').forEach((el, i) => {
      el.classList.toggle('selected', i === selected);
    });
  }

  function renderResults(query) {
    if (typeof CONCEPTS === 'undefined') {
      results.innerHTML = '<div class="search-empty">Datos no disponibles en esta página</div>';
      return;
    }
    const q = query.toLowerCase().trim();
    items = [];
    const matches = q === '' ? CONCEPTS.slice(0, 8) : CONCEPTS.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.tag.toLowerCase().includes(q) ||
      c.definition.toLowerCase().includes(q) ||
      (c.analogy && c.analogy.replace(/<[^>]*>/g, '').toLowerCase().includes(q))
    );

    items = matches.slice(0, 10).map(c => ({
      concept: c,
      href: depth + 'concepts/' + c.id + '/index.html'
    }));

    if (items.length === 0) {
      results.innerHTML = '<div class="search-empty">Sin resultados</div>';
    } else {
      results.innerHTML = items.map((it, i) => `
        <a href="${it.href}" class="search-item ${i === 0 ? 'selected' : ''}">
          <span class="si-icon">${it.concept.icon}</span>
          <div class="si-text">
            <div class="si-title">${it.concept.title}</div>
            <div class="si-tag">${it.concept.tag}</div>
          </div>
          <span class="si-cat">${it.concept.category}</span>
        </a>
      `).join('');
      selected = 0;
    }
  }

  input.addEventListener('input', () => renderResults(input.value));

  // Load CONCEPTS data if not already present
  if (typeof CONCEPTS === 'undefined') {
    const script = document.createElement('script');
    script.src = depth + 'cheatsheet/cheatsheet-data.js';
    script.onload = () => renderResults('');
    document.head.appendChild(script);
  }
})();
