// Global nav — inject into any page
(function() {
  const path = location.pathname;
  const depth = (path.match(/concepts\/[^/]+\//) ? '../../' :
                 path.match(/(demo-cli|demo-rag|demo-agents|demo-tokens|demo|cheatsheet|map|comparisons|quiz-advanced|quiz|workshop|paths|tokenizer|cca-trainer)\//) ? '../' : '');

  // Links grouped: orientation | learn | demos | practice | test
  // 'sep' entries render as a visual divider
  const links = [
    { href: 'paths/index.html',              label: 'Rutas',       match: /paths\// },
    { href: 'map/index.html',                label: 'Mapa',        match: /map\// },
    'sep',
    { href: 'concepts/llm/index.html',       label: 'Conceptos',   match: /concepts\// },
    { href: 'cheatsheet/cheatsheet.html',    label: 'Cheat Sheet', match: /cheatsheet\// },
    { href: 'comparisons/index.html',        label: 'Comparativas', match: /comparisons\// },
    'sep',
    { href: 'demo/index.html',              label: 'Demo',         match: /\/demo\// },
    { href: 'demo-cli/index.html',          label: 'CLI',          match: /demo-cli\// },
    { href: 'demo-rag/index.html',          label: 'RAG',          match: /demo-rag\// },
    { href: 'demo-agents/index.html',       label: 'Agentes',      match: /demo-agents\// },
    { href: 'demo-tokens/index.html',      label: 'Tokens',       match: /demo-tokens\// },
    'sep',
    { href: 'tokenizer/index.html',         label: 'Tokenizer',    match: /tokenizer\// },
    { href: 'workshop/index.html',          label: 'Workshop',     match: /workshop\// },
    { href: 'quiz/index.html',              label: 'Quiz',         match: /\/quiz\// },
    { href: 'quiz-advanced/index.html',     label: 'Quiz Pro',     match: /quiz-advanced\// },
    { href: 'cca-trainer/index.html',       label: 'CCAR-F',       match: /cca-trainer\// },
  ];

  const nav = document.createElement('nav');
  nav.className = 'gnav';
  nav.innerHTML = `<a href="${depth}index.html" class="gnav-brand">🧠 IA</a>` +
    links.map(l => {
      if (l === 'sep') return '<span class="gnav-sep"></span>';
      const active = l.match.test(path) ? ' active' : '';
      return `<a href="${depth}${l.href}" class="${active}">${l.label}</a>`;
    }).join('');

  // Hamburger toggle (visible only on mobile via CSS)
  const toggle = document.createElement('button');
  toggle.className = 'gnav-toggle';
  toggle.setAttribute('aria-label', 'Abrir menú');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '☰';
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('gnav-open');
    toggle.innerHTML = isOpen ? '✕' : '☰';
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });
  nav.appendChild(toggle);

  // Close menu when a link inside is tapped
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && nav.classList.contains('gnav-open')) {
      nav.classList.remove('gnav-open');
      toggle.innerHTML = '☰';
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.body.insertBefore(nav, document.body.firstChild);

  // Load search + progress
  const s = document.createElement('script');
  s.src = depth + 'search.js';
  document.head.appendChild(s);
  const p = document.createElement('script');
  p.src = depth + 'progress.js';
  document.head.appendChild(p);
})();
