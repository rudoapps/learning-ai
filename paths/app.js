// Learning Paths — app.js
(function () {
  'use strict';

  // ─── Path data ──────────────────────────────────────────────
  const PATHS = {
    fundamentos: {
      title: '🟢 Fundamentos',
      subtitle: 'De cero a entender qué es la IA',
      color: 'green',
      time: '~45 min',
      steps: [
        { icon: '🧠', title: 'LLM', desc: 'Qué es un modelo de lenguaje', href: '../concepts/llm/index.html', type: 'concepto' },
        { icon: '🔤', title: 'Tokens', desc: 'Cómo lee la IA', href: '../concepts/tokens/index.html', type: 'concepto' },
        { icon: '📏', title: 'Ventana de contexto', desc: 'Cuánto recuerda', href: '../concepts/context_window/index.html', type: 'concepto' },
        { icon: '💬', title: 'Prompt', desc: 'Cómo hablarle', href: '../concepts/prompt/index.html', type: 'concepto' },
        { icon: '🌡', title: 'Temperature', desc: 'Creatividad vs precisión', href: '../concepts/temperature/index.html', type: 'concepto' },
        { icon: '🎬', title: 'Demo interactiva', desc: 'Míralo en acción', href: '../demo/index.html', type: 'demo' },
        { icon: '👻', title: 'Alucinación', desc: 'Cuando la IA se inventa cosas', href: '../concepts/hallucination/index.html', type: 'concepto' },
        { icon: '📖', title: 'Cheat Sheet', desc: 'Repasa los conceptos', href: '../cheatsheet/cheatsheet.html', type: 'recurso' },
        { icon: '🧪', title: 'Quiz: Fundamentos', desc: 'Comprueba lo aprendido', href: '../quiz/index.html', type: 'quiz' },
      ]
    },
    intermedio: {
      title: '🟡 Construyendo con IA',
      subtitle: 'Herramientas, RAG y cómo extender la IA',
      color: 'yellow',
      time: '~60 min',
      steps: [
        { icon: '📋', title: 'System prompt', desc: 'Define el comportamiento', href: '../concepts/system_prompt/index.html', type: 'concepto' },
        { icon: '🔗', title: 'Chain of Thought', desc: 'Razonamiento paso a paso', href: '../concepts/cot/index.html', type: 'concepto' },
        { icon: '🛠', title: 'Taller de prompts', desc: 'Construye tu prompt', href: '../workshop/index.html', type: 'taller' },
        { icon: '🔧', title: 'Tools', desc: 'Dale manos a la IA', href: '../concepts/tools/index.html', type: 'concepto' },
        { icon: '📞', title: 'Function calling', desc: 'Cómo llama funciones', href: '../concepts/function_calling/index.html', type: 'concepto' },
        { icon: '🔌', title: 'MCP', desc: 'Protocolo de conexión', href: '../concepts/mcp/index.html', type: 'concepto' },
        { icon: '⌨️', title: 'Demo CLI', desc: 'IA en la terminal', href: '../demo-cli/index.html', type: 'demo' },
        { icon: '📐', title: 'Embeddings', desc: 'Números que representan significado', href: '../concepts/embeddings/index.html', type: 'concepto' },
        { icon: '🗄', title: 'Vector DB', desc: 'Buscar por significado', href: '../concepts/vector_db/index.html', type: 'concepto' },
        { icon: '📚', title: 'RAG', desc: 'IA + tus documentos', href: '../concepts/rag/index.html', type: 'concepto' },
        { icon: '📚', title: 'Demo RAG', desc: 'Ve RAG en acción', href: '../demo-rag/index.html', type: 'demo' },
        { icon: '⚖️', title: 'Comparativas', desc: 'RAG vs Fine-tuning y más', href: '../comparisons/index.html', type: 'recurso' },
        { icon: '🧪', title: 'Quiz', desc: 'Pon a prueba todo', href: '../quiz/index.html', type: 'quiz' },
      ]
    },
    avanzado: {
      title: '🔴 Agentes y producción',
      subtitle: 'Agentes autónomos, seguridad y sistemas complejos',
      color: 'red',
      time: '~50 min',
      steps: [
        { icon: '🤖', title: 'Agente', desc: 'IA que actúa sola', href: '../concepts/agent/index.html', type: 'concepto' },
        { icon: '🎼', title: 'Orquestador', desc: 'Quién dirige a quién', href: '../concepts/orchestrator/index.html', type: 'concepto' },
        { icon: '👥', title: 'Subagentes', desc: 'Divide y vencerás', href: '../concepts/subagents/index.html', type: 'concepto' },
        { icon: '⚡', title: 'Skills', desc: 'Capacidades modulares', href: '../concepts/skills/index.html', type: 'concepto' },
        { icon: '🤖', title: 'Demo Multi-agente', desc: 'Agentes en acción', href: '../demo-agents/index.html', type: 'demo' },
        { icon: '💾', title: 'Memoria', desc: 'Persistencia entre sesiones', href: '../concepts/memory/index.html', type: 'concepto' },
        { icon: '🗜', title: 'Compactación', desc: 'Gestionar contexto largo', href: '../concepts/compaction/index.html', type: 'concepto' },
        { icon: '🌊', title: 'Streaming', desc: 'Respuestas en tiempo real', href: '../concepts/streaming/index.html', type: 'concepto' },
        { icon: '🖼', title: 'Multimodal', desc: 'Más allá del texto', href: '../concepts/multimodal/index.html', type: 'concepto' },
        { icon: '🎯', title: 'Fine-tuning', desc: 'Entrenar tu propio modelo', href: '../concepts/fine_tuning/index.html', type: 'concepto' },
        { icon: '🛡', title: 'Guardrails', desc: 'Poner límites', href: '../concepts/guardrails/index.html', type: 'concepto' },
        { icon: '⚖', title: 'Alignment', desc: 'Alinear con valores humanos', href: '../concepts/alignment/index.html', type: 'concepto' },
        { icon: '💉', title: 'Prompt injection', desc: 'Ataques y defensas', href: '../concepts/prompt_injection/index.html', type: 'concepto' },
        { icon: '🗺', title: 'Mapa de conceptos', desc: 'Ve el panorama completo', href: '../map/index.html', type: 'recurso' },
        { icon: '🔥', title: 'Quiz Avanzado', desc: 'Escenarios y decisiones', href: '../quiz-advanced/index.html', type: 'quiz' },
      ]
    }
  };

  var STORAGE_KEY = 'learning-paths-progress';

  // ─── State ──────────────────────────────────────────────────
  var progress = loadProgress();
  var activePath = null;

  // ─── Persistence ────────────────────────────────────────────
  function loadProgress() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        // Validate structure
        var result = {};
        Object.keys(PATHS).forEach(function (key) {
          var len = PATHS[key].steps.length;
          if (parsed[key] && Array.isArray(parsed[key]) && parsed[key].length === len) {
            result[key] = parsed[key];
          } else {
            result[key] = new Array(len).fill(false);
          }
        });
        return result;
      }
    } catch (e) { /* ignore */ }

    var fresh = {};
    Object.keys(PATHS).forEach(function (key) {
      fresh[key] = new Array(PATHS[key].steps.length).fill(false);
    });
    return fresh;
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) { /* ignore */ }
  }

  // ─── Helpers ────────────────────────────────────────────────
  function countCompleted(pathKey) {
    return progress[pathKey].filter(Boolean).length;
  }

  function totalSteps() {
    var t = 0;
    Object.keys(PATHS).forEach(function (k) { t += PATHS[k].steps.length; });
    return t;
  }

  function totalCompleted() {
    var t = 0;
    Object.keys(PATHS).forEach(function (k) { t += countCompleted(k); });
    return t;
  }

  function typeLabel(type) {
    var map = { concepto: 'Concepto', demo: 'Demo', quiz: 'Quiz', taller: 'Taller', recurso: 'Recurso' };
    return map[type] || type;
  }

  // ─── UI Updates ─────────────────────────────────────────────
  function updateOverallProgress() {
    var pct = totalSteps() > 0 ? Math.round((totalCompleted() / totalSteps()) * 100) : 0;
    var pctEl = document.querySelector('.overall-pct');
    var fillEl = document.querySelector('.overall-fill');
    if (pctEl) pctEl.textContent = pct + '%';
    if (fillEl) fillEl.style.width = pct + '%';
  }

  function updateCardProgress() {
    Object.keys(PATHS).forEach(function (key) {
      var el = document.querySelector('.pc-progress-text[data-path="' + key + '"]');
      if (el) {
        el.textContent = countCompleted(key) + '/' + PATHS[key].steps.length;
      }
    });
  }

  function updatePathProgress(pathKey) {
    var count = countCompleted(pathKey);
    var total = PATHS[pathKey].steps.length;
    var pct = total > 0 ? Math.round((count / total) * 100) : 0;

    var countEl = document.querySelector('.pd-progress-count');
    var fillEl = document.querySelector('.pd-progress-fill');
    if (countEl) countEl.textContent = count + '/' + total + ' completados (' + pct + '%)';
    if (fillEl) fillEl.style.width = pct + '%';
  }

  // ─── Render path detail ─────────────────────────────────────
  function renderPath(pathKey) {
    activePath = pathKey;
    var path = PATHS[pathKey];
    var detail = document.getElementById('path-detail');

    // Mark active card
    document.querySelectorAll('.path-card').forEach(function (c) {
      c.classList.toggle('active', c.dataset.path === pathKey);
    });

    var colorClass = { green: 'fill-green', yellow: 'fill-yellow', red: 'fill-red' }[path.color];
    var nodeCurrentClass = 'current-' + path.color;

    var count = countCompleted(pathKey);
    var total = path.steps.length;
    var pct = total > 0 ? Math.round((count / total) * 100) : 0;

    var html = '';
    html += '<div class="pd-header">';
    html += '  <h2 class="pd-title">' + path.title + '</h2>';
    html += '  <p class="pd-subtitle-text">' + path.subtitle + ' &middot; ' + path.time + '</p>';
    html += '  <div class="pd-progress">';
    html += '    <div class="pd-progress-label">';
    html += '      <span>Progreso</span>';
    html += '      <span class="pd-progress-count">' + count + '/' + total + ' completados (' + pct + '%)</span>';
    html += '    </div>';
    html += '    <div class="pd-progress-bar"><div class="pd-progress-fill ' + colorClass + '" style="width:' + pct + '%"></div></div>';
    html += '  </div>';
    html += '</div>';

    html += '<div class="timeline">';

    path.steps.forEach(function (step, i) {
      var done = progress[pathKey][i];
      var isNext = !done && (i === 0 || progress[pathKey][i - 1]);

      var nodeClass = 'step-node';
      if (done) nodeClass += ' completed';
      else if (isNext) nodeClass += ' ' + nodeCurrentClass;

      var cardClass = 'step-card type-' + step.type;
      if (done) cardClass += ' completed-step';

      html += '<div class="step">';
      html += '  <div class="' + nodeClass + '"></div>';
      html += '  <div class="' + cardClass + '">';
      html += '    <button class="step-check' + (done ? ' checked' : '') + '" data-path="' + pathKey + '" data-index="' + i + '" title="Marcar como completado">' + (done ? '✓' : '') + '</button>';
      html += '    <div class="step-icon">' + step.icon + '</div>';
      html += '    <div class="step-content">';
      html += '      <div class="step-title">';
      html += '        <span class="step-num">' + (i + 1) + '</span> ' + step.title;
      html += '        <span class="step-tag tag-' + step.type + '">' + typeLabel(step.type) + '</span>';
      html += '      </div>';
      html += '      <div class="step-desc">' + step.desc + '</div>';
      html += '    </div>';
      html += '    <a class="step-link" href="' + step.href + '">Abrir →</a>';
      html += '  </div>';
      html += '</div>';
    });

    html += '</div>';

    html += '<button class="pd-reset" data-path="' + pathKey + '">↺ Reiniciar progreso de esta ruta</button>';

    detail.innerHTML = html;

    // Attach checkbox events via delegation
    detail.querySelectorAll('.step-check').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var pk = this.dataset.path;
        var idx = parseInt(this.dataset.index, 10);
        progress[pk][idx] = !progress[pk][idx];
        saveProgress();
        renderPath(pk);
        updateOverallProgress();
        updateCardProgress();
      });
    });

    // Reset button
    var resetBtn = detail.querySelector('.pd-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        var pk = this.dataset.path;
        progress[pk] = new Array(PATHS[pk].steps.length).fill(false);
        saveProgress();
        renderPath(pk);
        updateOverallProgress();
        updateCardProgress();
      });
    }

    // Update hash
    if (location.hash !== '#' + pathKey) {
      history.replaceState(null, '', '#' + pathKey);
    }
  }

  // ─── Card click handlers ────────────────────────────────────
  function setupCards() {
    document.querySelectorAll('.path-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var pathKey = this.dataset.path;
        renderPath(pathKey);
        // Smooth scroll to detail
        setTimeout(function () {
          var detail = document.getElementById('path-detail');
          if (detail) {
            detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 50);
      });
    });
  }

  // ─── Hash routing ───────────────────────────────────────────
  function handleHash() {
    var hash = location.hash.replace('#', '');
    if (PATHS[hash]) {
      renderPath(hash);
    }
  }

  // ─── Init ───────────────────────────────────────────────────
  function init() {
    updateOverallProgress();
    updateCardProgress();
    setupCards();

    // Check hash on load
    handleHash();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHash);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
