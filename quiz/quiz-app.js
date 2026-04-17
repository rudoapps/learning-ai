const container = document.getElementById('quizContainer');
const finalEl = document.getElementById('quizFinal');
const fillEl = document.getElementById('qpbFill');
const textEl = document.getElementById('qpbText');
const catFilter = document.getElementById('catFilter');

let currentQuestions = [];
let answered = 0;
let correct = 0;
let mode = 'all';
let selectedCat = null;

const catLabels = { foundations: 'Fundamentos', action: 'Acción', memory: 'Memoria y datos', scaling: 'Arquitectura', safety: 'Seguridad' };
const catCls = { foundations: 'cat-foundations', action: 'cat-action', memory: 'cat-memory', scaling: 'cat-scaling', safety: 'cat-safety' };

function buildQuestions(filter) {
  const questions = [];
  for (const [conceptId, qs] of Object.entries(QUIZZES)) {
    const concept = CONCEPTS.find(c => c.id === conceptId);
    if (!concept) continue;
    if (filter && concept.category !== filter) continue;
    qs.forEach((q, qi) => {
      // Shuffle options, tracking the correct answer
      const indices = q.opts.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      const shuffledOpts = indices.map(i => q.opts[i]);
      const shuffledAns = indices.indexOf(q.ans);
      questions.push({ q: q.q, opts: shuffledOpts, ans: shuffledAns, conceptId, conceptTitle: concept.title, conceptIcon: concept.icon, category: concept.category, idx: qi });
    });
  }
  return questions;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startQuiz() {
  answered = 0;
  correct = 0;
  finalEl.style.display = 'none';
  container.innerHTML = '';

  if (mode === 'all') {
    currentQuestions = buildQuestions();
  } else if (mode === 'category') {
    currentQuestions = buildQuestions(selectedCat);
  } else if (mode === 'random') {
    currentQuestions = shuffle(buildQuestions()).slice(0, 10);
  }

  if (currentQuestions.length === 0) {
    container.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px;">Selecciona una categoría para empezar.</p>';
    return;
  }

  updateProgress();
  renderQuestions();
}

function updateProgress() {
  const total = currentQuestions.length;
  fillEl.style.width = (total > 0 ? (answered / total) * 100 : 0) + '%';
  textEl.textContent = `${answered} / ${total} respondidas`;
  if (answered > 0 && answered < total) {
    textEl.textContent += ` · ${correct} correctas`;
  }
}

function renderQuestions() {
  container.innerHTML = currentQuestions.map((q, i) => `
    <div class="qq-card" data-qi="${i}" id="qc-${i}">
      <div class="qq-card-head">
        <div class="qq-card-num">${i + 1}</div>
        <div class="qq-card-question">${q.q}</div>
        <div class="qq-card-concept">
          ${q.conceptIcon} <a href="../concepts/${q.conceptId}/index.html">${q.conceptTitle}</a>
        </div>
      </div>
      <div class="qq-card-opts">
        ${q.opts.map((o, oi) => `<button class="qq-card-opt" data-qi="${i}" data-oi="${oi}">${o}</button>`).join('')}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.qq-card-opt').forEach(btn => {
    btn.addEventListener('click', () => handleAnswer(btn));
  });
}

function handleAnswer(btn) {
  const qi = parseInt(btn.dataset.qi);
  const oi = parseInt(btn.dataset.oi);
  const card = document.getElementById('qc-' + qi);
  if (card.classList.contains('answered')) return;

  card.classList.add('answered');
  answered++;

  const q = currentQuestions[qi];
  const isCorrect = oi === q.ans;
  if (isCorrect) correct++;

  btn.classList.add(isCorrect ? 'correct' : 'wrong');
  const numEl = card.querySelector('.qq-card-num');
  numEl.classList.add(isCorrect ? 'correct-num' : 'wrong-num');

  if (!isCorrect) {
    card.querySelector(`.qq-card-opt[data-oi="${q.ans}"]`).classList.add('correct');
  }

  const fb = document.createElement('div');
  fb.className = 'qq-card-fb ' + (isCorrect ? 'fb-ok' : 'fb-wrong');
  fb.innerHTML = isCorrect
    ? '✅ ¡Correcto!'
    : `❌ Incorrecto. <a href="../concepts/${q.conceptId}/index.html" style="color:var(--accent);">Repasa ${q.conceptTitle} →</a>`;
  card.querySelector('.qq-card-opts').after(fb);

  updateProgress();

  if (answered === currentQuestions.length) {
    showFinal();
  }
}

function showFinal() {
  const total = currentQuestions.length;
  const pct = Math.round((correct / total) * 100);
  const emoji = pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 60 ? '👏' : pct >= 40 ? '📚' : '💪';
  const msg = pct === 100 ? '¡Perfecto! Dominas estos conceptos.'
    : pct >= 80 ? '¡Excelente! Muy buen dominio.'
    : pct >= 60 ? 'Bien, pero hay margen de mejora.'
    : pct >= 40 ? 'Revisa los conceptos donde fallaste.'
    : 'Te recomiendo repasar los deep dives antes de reintentar.';

  // Find weak concepts
  const conceptErrors = {};
  currentQuestions.forEach((q, i) => {
    const card = document.getElementById('qc-' + i);
    if (card.querySelector('.qq-card-opt.wrong')) {
      conceptErrors[q.conceptId] = (conceptErrors[q.conceptId] || 0) + 1;
    }
  });
  const weakConcepts = Object.entries(conceptErrors).sort((a, b) => b[1] - a[1]).slice(0, 3);

  finalEl.style.display = 'block';
  finalEl.innerHTML = `
    <div class="qf-emoji">${emoji}</div>
    <div class="qf-score">${correct} / ${total}</div>
    <div class="qf-pct">${pct}% — ${msg}</div>
    <div class="qf-breakdown">
      <div class="qf-stat green"><div class="qf-stat-num">${correct}</div><div class="qf-stat-label">Correctas</div></div>
      <div class="qf-stat red"><div class="qf-stat-num">${total - correct}</div><div class="qf-stat-label">Incorrectas</div></div>
    </div>
    ${weakConcepts.length > 0 ? `
      <p style="color:var(--muted);font-size:13px;margin-bottom:12px;">Conceptos a repasar:</p>
      <div class="qf-actions" style="margin-bottom:20px;">
        ${weakConcepts.map(([cid]) => {
          const c = CONCEPTS.find(x => x.id === cid);
          return `<a href="../concepts/${cid}/index.html" class="qf-btn secondary">${c.icon} ${c.title}</a>`;
        }).join('')}
      </div>
    ` : ''}
    <div class="qf-actions">
      <button class="qf-btn primary" onclick="startQuiz()">🔄 Reintentar</button>
      <a href="../cheatsheet/cheatsheet.html" class="qf-btn secondary">📖 Cheat Sheet</a>
    </div>
  `;
  finalEl.scrollIntoView({ behavior: 'smooth' });
}

// Mode buttons
document.querySelectorAll('.qm-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.qm-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;

    if (mode === 'category') {
      catFilter.style.display = 'flex';
      catFilter.innerHTML = Object.entries(catLabels).map(([k, v]) =>
        `<button class="qcf-btn ${catCls[k]} ${selectedCat === k ? 'active' : ''}" data-cat="${k}">${v}</button>`
      ).join('');
      catFilter.querySelectorAll('.qcf-btn').forEach(cb => {
        cb.addEventListener('click', () => {
          catFilter.querySelectorAll('.qcf-btn').forEach(b => b.classList.remove('active'));
          cb.classList.add('active');
          selectedCat = cb.dataset.cat;
          startQuiz();
        });
      });
      if (!selectedCat) {
        container.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px;">Selecciona una categoría arriba.</p>';
        return;
      }
    } else {
      catFilter.style.display = 'none';
      selectedCat = null;
    }
    startQuiz();
  });
});

// Init
startQuiz();
