// Global nav — inject into any page
(function() {
  const path = location.pathname;
  const depth = (path.match(/concepts\/[^/]+\//) ? '../../' :
                 path.match(/(demo-cli|demo|cheatsheet|map|comparisons|quiz)\//) ? '../' : '');

  const links = [
    { href: 'index.html', label: 'Inicio', match: /index\.html$|learning-ai\/$/ },
    { href: 'demo/index.html', label: 'Demo', match: /\/demo\// },
    { href: 'demo-cli/index.html', label: 'Demo CLI', match: /demo-cli\// },
    { href: 'cheatsheet/cheatsheet.html', label: 'Cheat Sheet', match: /cheatsheet\// },
    { href: 'map/index.html', label: 'Mapa', match: /map\// },
    { href: 'comparisons/index.html', label: 'Comparativas', match: /comparisons\// },
    { href: 'quiz/index.html', label: 'Quiz', match: /quiz\// },
  ];

  const nav = document.createElement('nav');
  nav.className = 'gnav';
  nav.innerHTML = `<a href="${depth}index.html" class="gnav-brand">🧠 IA</a>` +
    links.map(l => {
      const active = l.match.test(path) ? ' active' : '';
      return `<a href="${depth}${l.href}" class="${active}">${l.label}</a>`;
    }).join('');

  document.body.insertBefore(nav, document.body.firstChild);

  // Load search + progress
  const s = document.createElement('script');
  s.src = depth + 'search.js';
  document.head.appendChild(s);
  const p = document.createElement('script');
  p.src = depth + 'progress.js';
  document.head.appendChild(p);
})();
