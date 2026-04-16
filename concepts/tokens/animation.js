const ANIMATIONS = {};

// ========== TOKENS ==========
ANIMATIONS.tokens = function(stage) {
  stage.innerHTML = `
    <div class="stage-controls">
      <input type="text" id="tkInput" value="La inteligencia artificial está transformando el mundo.">
      <button id="tkGo" class="primary">Tokenizar ▶</button>
      <button id="tkClear">Limpiar</button>
    </div>
    <div class="token-demo">
      <div class="token-canvas" id="tkCanvas"><span style="color:var(--muted)">El texto aparecerá aquí troceado en tokens...</span></div>
      <div class="token-legend">
        <span>🎨 Cada color es un token distinto</span>
        <span>📏 Un token ≈ 3-4 caracteres en español</span>
      </div>
      <div>
        <div class="stage-status">Representación numérica (lo único que el modelo entiende):</div>
        <div class="token-ids" id="tkIds">—</div>
      </div>
      <div class="stage-status" id="tkStatus"></div>
    </div>
  `;

  // Tokenizador muy simplificado: corta por sílabas/palabras cortas para emular
  function fakeTokenize(text) {
    const out = [];
    // Divide por espacios preservándolos, y trocea palabras largas
    const parts = text.match(/(\s+|[^\s]+)/g) || [];
    for (const p of parts) {
      if (/^\s+$/.test(p)) { out.push(p); continue; }
      if (p.length <= 4) { out.push(p); continue; }
      // Trocear palabras largas en chunks de 3-4
      let i = 0;
      while (i < p.length) {
        const size = p.length - i <= 5 ? p.length - i : (3 + Math.round(Math.random()));
        out.push(p.slice(i, i + size));
        i += size;
      }
    }
    return out;
  }

  async function animate() {
    const text = document.getElementById('tkInput').value;
    const canvas = document.getElementById('tkCanvas');
    const idsEl = document.getElementById('tkIds');
    const status = document.getElementById('tkStatus');
    canvas.innerHTML = '';
    idsEl.textContent = '';
    const tokens = fakeTokenize(text);
    const ids = [];
    for (let i = 0; i < tokens.length; i++) {
      const span = document.createElement('span');
      span.className = 'tk tk-' + (i % 5);
      span.textContent = tokens[i];
      canvas.appendChild(span);
      const id = 1000 + Math.floor(Math.random() * 90000);
      ids.push(id);
      idsEl.textContent = '[' + ids.join(', ') + ']';
      status.textContent = `Generando... ${i+1}/${tokens.length} tokens`;
      await new Promise(r => setTimeout(r, 180));
    }
    const chars = text.length;
    status.textContent = `✅ ${tokens.length} tokens desde ${chars} caracteres → ratio ${(chars/tokens.length).toFixed(2)} chars/token`;
  }

  document.getElementById('tkGo').addEventListener('click', animate);
  document.getElementById('tkClear').addEventListener('click', () => {
    document.getElementById('tkCanvas').innerHTML = '<span style="color:var(--muted)">...</span>';
    document.getElementById('tkIds').textContent = '—';
    document.getElementById('tkStatus').textContent = '';
  });
  animate();
};


ANIMATIONS._multilang = function(mount) {
  const samples = [
    { lang: 'Inglés', text: 'Artificial intelligence', tks: ['Art','ificial',' intelligence'] },
    { lang: 'Español', text: 'Inteligencia artificial', tks: ['Int','elig','encia',' art','ific','ial'] },
    { lang: 'Francés', text: 'Intelligence artificielle', tks: ['Int','elligence',' art','ific','ielle'] },
    { lang: 'Alemán', text: 'Künstliche Intelligenz', tks: ['K','ünst','liche',' Int','ell','ig','enz'] },
    { lang: 'Japonés', text: '人工知能', tks: ['人','工','知','能','<s>','<s>','<s>','<s>'] },
    { lang: 'Árabe', text: 'الذكاء الاصطناعي', tks: ['ال','ذ','كا','ء',' ','الا','صط','نا','عي','<e>'] },
    { lang: 'Código', text: 'if (x === null) return;', tks: ['if',' (','x',' ===',' null',')',' return',';','<e>'] }
  ];

  mount.innerHTML = `
    <div class="ml-bars">
      ${samples.map(s => `
        <div class="ml-row" data-lang="${s.lang}">
          <div class="ml-row-head">
            <div class="lang">${s.lang}</div>
            <div class="text-preview">"${s.text}"</div>
            <div class="count">${s.tks.length} tokens</div>
          </div>
          <div class="ml-blocks">
            ${s.tks.map((t, j) => `<span class="ml-block c${j % 5}">${t.replace('<s>','▪').replace('<e>','▪')}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
    <div class="mini-controls" style="margin-top:14px;">
      <button id="mlGo" class="primary">▶ Animar</button>
      <span>💡 Mismo significado, coste muy distinto. Inglés (2 tokens) es ~5x más barato que árabe (10 tokens).</span>
    </div>
  `;

  function animate() {
    const blocks = mount.querySelectorAll('.ml-block');
    blocks.forEach(b => b.classList.remove('show'));
    blocks.forEach((b, i) => {
      setTimeout(() => b.classList.add('show'), 80 * i);
    });
  }
  document.getElementById('mlGo').addEventListener('click', animate);
  setTimeout(animate, 100);
};

