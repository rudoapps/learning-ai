(function () {
  'use strict';

  // ── Models ────────────────────────────────────────
  var MODELS = {
    haiku:  { name: 'Haiku',  icon: '⚡', desc: 'Rápido y barato',    inputPer1M: 0.25, outputPer1M: 1.25, tier: 0 },
    sonnet: { name: 'Sonnet', icon: '🎯', desc: 'Equilibrado',        inputPer1M: 3,    outputPer1M: 15,   tier: 1 },
    opus:   { name: 'Opus',   icon: '🧠', desc: 'Máxima capacidad',   inputPer1M: 15,   outputPer1M: 75,   tier: 2 },
  };

  // ── Scenarios ─────────────────────────────────────
  var SCENARIOS = [
    {
      title: 'Clasificar 50 emails',
      desc: 'Tu empresa recibe 50 emails al día. Necesitas clasificarlos automáticamente como spam, consulta, queja o pedido. Es una tarea repetitiva y sencilla.',
      inputTokens: 12000,
      outputTokens: 600,
      unlocks: null,
      meta: { input: '~12K tokens (50 emails)', output: '~600 tokens (etiquetas)', dificultad: 'Baja' },
      evaluate: function (config) {
        var q = 5, fb = '', tip = '';
        if (config.model === 'opus') { q = 3; fb = 'Opus puede clasificar emails, pero es como usar un Ferrari para ir a comprar pan. Has gastado 60x más de lo necesario.'; }
        else if (config.model === 'sonnet') { q = 4; fb = 'Sonnet funciona bien, pero Haiku habría hecho lo mismo por una fracción del precio en una tarea tan simple.'; }
        else { fb = 'Perfecto. Haiku es ideal para clasificación simple: rápido, barato y suficientemente capaz.'; }
        if (config.temp > 0.3) { q -= 1; fb += ' La temperatura alta introduce variabilidad innecesaria en una tarea de clasificación.'; }
        tip = '💡 Para tareas de clasificación repetitivas, el modelo más barato suele bastar. Guarda el presupuesto para tareas que realmente necesiten razonamiento.';
        return { quality: Math.max(1, q), feedback: fb, tip: tip };
      }
    },
    {
      title: 'Extraer datos de facturas',
      desc: 'Recibes facturas en texto y necesitas extraer: número, fecha, importe, proveedor y NIF. Los datos deben ser exactos — un error en el importe es un error contable.',
      inputTokens: 3000,
      outputTokens: 400,
      unlocks: null,
      meta: { input: '~3K tokens (factura)', output: '~400 tokens (JSON)', dificultad: 'Media' },
      evaluate: function (config) {
        var q = 5, fb = '', tip = '';
        if (config.model === 'haiku') { q = 3; fb = 'Haiku puede fallar en extracciones complejas — a veces inventa campos o confunde formatos de fecha. Funciona, pero con errores.'; }
        else if (config.model === 'opus') { q = 4; fb = 'Opus es excelente extrayendo datos, pero Sonnet lo haría igual de bien por una quinta parte del coste.'; }
        else { fb = 'Buena elección. Sonnet tiene la capacidad necesaria para extracción estructurada sin el sobrecoste de Opus.'; }
        if (config.temp > 0) { q -= 1; fb += ' Con temperatura > 0 introduces variabilidad: el mismo importe podría formatearse distinto en cada llamada.'; }
        if (config.temp === 0 && config.model !== 'haiku') { fb = 'Excelente combinación. Modelo capaz + temperatura 0 = máxima consistencia en la extracción.'; q = 5; }
        tip = '💡 La extracción de datos necesita precisión, no creatividad. Temperatura 0 es casi siempre la elección correcta para tareas estructuradas.';
        return { quality: Math.max(1, q), feedback: fb, tip: tip };
      }
    },
    {
      title: 'Escribir un post de blog creativo',
      desc: 'Marketing te pide un post de 800 palabras sobre tendencias tecnológicas. Quieren un tono fresco y original, no un texto genérico que suene a IA.',
      inputTokens: 500,
      outputTokens: 1200,
      unlocks: null,
      meta: { input: '~500 tokens (briefing)', output: '~1.200 tokens (post)', dificultad: 'Media' },
      evaluate: function (config) {
        var q = 3, fb = '', tip = '';
        if (config.model === 'haiku') { q = 2; fb = 'Haiku genera texto correcto pero genérico. Para escritura creativa, le falta matiz y originalidad.'; }
        else if (config.model === 'sonnet') { q = 4; fb = 'Sonnet escribe bien y con buen equilibrio calidad-coste. Un modelo sólido para contenido.'; }
        else { q = 5; fb = 'Opus brilla en escritura creativa: mejor vocabulario, más matices, y estilo más natural.'; }
        if (config.temp === 0) { q -= 1; fb += ' Pero con temperatura 0 el texto es predecible y repetitivo — para creatividad necesitas algo de aleatoriedad.'; }
        else if (config.temp >= 0.7 && config.temp <= 1.0) { q = Math.min(q + 1, 5); fb += ' La temperatura alta ayuda a generar texto más variado y original.'; }
        else if (config.temp > 1.0) { fb += ' Cuidado: temperatura muy alta puede producir texto incoherente.'; }
        tip = '💡 La escritura creativa es uno de los pocos casos donde temperatura alta tiene sentido. Aquí sí merece la pena invertir en un modelo con mejor prosa.';
        return { quality: Math.max(1, Math.min(5, q)), feedback: fb, tip: tip };
      }
    },
    {
      title: 'Chatbot de documentación técnica',
      desc: 'Los desarrolladores preguntan dudas sobre vuestra API interna (500 páginas de docs). El chatbot debe dar respuestas precisas basadas en la documentación real, no inventar endpoints.',
      inputTokens: 800,
      outputTokens: 500,
      unlocks: { type: 'rag', label: '🔓 Nueva opción: RAG', desc: 'Puedes activar RAG para que el modelo busque en documentos reales antes de responder. Inyecta chunks relevantes como contexto (+4.000 tokens de input).' },
      meta: { input: '~800 tokens (pregunta)', output: '~500 tokens (respuesta)', dificultad: 'Alta' },
      evaluate: function (config) {
        var q = 2, fb = '', tip = '';
        if (!config.rag) {
          q = 2;
          fb = 'Sin RAG, el modelo inventa endpoints y parámetros. Suena convincente, pero las respuestas son alucinaciones peligrosas para un dev que confía en ellas.';
          if (config.model === 'opus') { q = 2; fb += ' Ni el mejor modelo del mundo puede responder sobre tu API interna sin acceso a la documentación.'; }
          tip = '💡 Cuando el modelo necesita información que no tiene (docs internos, datos actualizados), RAG es imprescindible. Sin él, hasta Opus alucina.';
        } else {
          q = 4;
          fb = 'RAG activado: el modelo consulta la documentación real antes de responder. ';
          if (config.model === 'haiku') { q = 3; fb += 'Haiku + RAG funciona, pero puede fallar al sintetizar información compleja de varios chunks.'; }
          else if (config.model === 'sonnet') { q = 5; fb += 'Sonnet + RAG es la combinación ideal: buena comprensión de los chunks y coste razonable.'; }
          else { q = 4; fb += 'Opus + RAG es excelente, pero Sonnet habría dado resultados similares por mucho menos.'; }
          if (config.temp > 0.5) { q -= 1; fb += ' Temperatura alta en un chatbot técnico introduce variaciones que pueden confundir al usuario.'; }
          tip = '💡 RAG transforma un modelo que alucina en uno que responde con datos reales. El retrieval importa más que el modelo: "garbage in, garbage out" aplica incluso con Opus.';
        }
        return { quality: Math.max(1, q), feedback: fb, tip: tip };
      }
    },
    {
      title: 'Revisar contrato legal',
      desc: 'Suben un contrato de 20 páginas y necesitas identificar cláusulas de riesgo: penalizaciones ocultas, jurisdicción desfavorable, limitaciones de responsabilidad ambiguas. Un error puede costar millones.',
      inputTokens: 15000,
      outputTokens: 2000,
      unlocks: { type: 'cot', label: '🔓 Nueva opción: Chain of Thought', desc: 'El modelo "piensa en voz alta" antes de responder: analiza paso a paso. Mejora la calidad en tareas complejas pero multiplica ×3 los tokens de output.' },
      meta: { input: '~15K tokens (contrato)', output: '~2K tokens (análisis)', dificultad: 'Muy alta' },
      evaluate: function (config) {
        var q = 2, fb = '', tip = '';
        if (config.model === 'haiku') { q = 1; fb = 'Haiku no tiene la capacidad de razonamiento para análisis legal complejo. Pasa por alto cláusulas de riesgo y genera falsa confianza.'; }
        else if (config.model === 'sonnet') {
          q = 3; fb = 'Sonnet encuentra las cláusulas obvias pero puede perderse matices legales sutiles que Opus captaría.';
          if (config.cot) { q = 4; fb = 'Sonnet + CoT mejora significativamente: el razonamiento paso a paso le ayuda a no saltarse detalles.'; }
        } else {
          q = 4; fb = 'Opus tiene la capacidad de razonamiento para análisis legal profundo.';
          if (config.cot) { q = 5; fb = 'Opus + CoT es la combinación óptima para tareas de alto riesgo: razona cada cláusula metódicamente antes de concluir.'; }
        }
        if (config.temp > 0.3) { q -= 1; fb += ' Temperatura alta en análisis legal introduce inconsistencia — una cláusula podría evaluarse distinto si preguntas dos veces.'; }
        if (!config.cot && config.model !== 'haiku') { fb += ' Sin Chain of Thought, el modelo da conclusiones directas sin mostrar su razonamiento — más difícil de auditar.'; }
        tip = '💡 Tareas de alto riesgo justifican el modelo más caro. El coste de un error (millones en un contrato malo) supera con creces el coste de usar Opus + CoT ($0.05 extra).';
        return { quality: Math.max(1, q), feedback: fb, tip: tip };
      }
    },
    {
      title: 'Organizar evento corporativo',
      desc: 'Un usuario pide: "Organiza un offsite para 80 personas en Barcelona: busca venues, compara catering, propón agenda de 2 días y calcula presupuesto". Son 4 subtareas especializadas que un solo modelo no puede investigar bien.',
      inputTokens: 1500,
      outputTokens: 3000,
      unlocks: { type: 'multiagent', label: '🔓 Nueva opción: Multi-agente', desc: 'Un orquestador reparte subtareas entre subagentes especializados. Cada subagente tiene su propio contexto limpio. Multiplica el coste (orquestador + N subagentes) pero mejora la calidad.' },
      meta: { input: '~1.5K tokens (pedido)', output: '~3K tokens (plan)', dificultad: 'Muy alta' },
      evaluate: function (config) {
        var q = 2, fb = '', tip = '';
        if (!config.multiagent) {
          q = 2;
          fb = 'Un solo agente intenta hacerlo todo y mezcla temas: el presupuesto del catering aparece en la sección de venues, la agenda no cuadra con los horarios del venue elegido.';
          if (config.model === 'opus') { q = 3; fb = 'Opus solo se las arregla mejor, pero pierde coherencia entre subtareas. Un orquestador con subagentes lo haría mejor incluso con Sonnet.'; }
          tip = '💡 Cuando una tarea tiene subtareas independientes y especializadas, un multi-agente produce resultados más coherentes que un solo agente intentando todo a la vez.';
        } else {
          q = 4;
          fb = 'Multi-agente activado: cada subtarea la resuelve un agente especializado con contexto limpio. ';
          if (config.model === 'haiku') { q = 3; fb += 'Haiku como orquestador puede fallar al sintetizar los resultados finales de los subagentes.'; }
          else if (config.model === 'sonnet') { q = 5; fb += 'Sonnet como orquestador dirige bien a los subagentes y sintetiza un plan coherente. Coste razonable.'; }
          else { q = 5; fb += 'Opus como orquestador es excelente pero Sonnet lo haría igual de bien por mucho menos.'; q = 4; }
          if (config.subagentModel === 'opus') { q = Math.max(q - 1, 3); fb += ' Los subagentes con Opus son excesivos — Haiku o Sonnet bastan para subtareas especializadas.'; }
          else if (config.subagentModel === 'haiku') { fb += ' Haiku para los subagentes es eficiente: tareas acotadas con contexto limpio.'; }
          tip = '💡 El patrón ideal de multi-agente: un orquestador capaz (Sonnet/Opus) dirigiendo subagentes baratos (Haiku). Así maximizas calidad sin multiplicar el coste.';
        }
        return { quality: Math.max(1, Math.min(5, q)), feedback: fb, tip: tip };
      }
    },
  ];

  // ── Game state ────────────────────────────────────
  var state = {
    budget: 1.00,
    level: 0,
    results: [],
    unlockedRAG: false,
    unlockedCoT: false,
    unlockedMultiagent: false,
  };

  // ── Cost calculation ──────────────────────────────
  function calcCost(config, scenario) {
    var model = MODELS[config.model];
    var inputTok = scenario.inputTokens;
    var outputTok = scenario.outputTokens;

    if (config.rag) inputTok += 4000;
    if (config.cot) outputTok *= 3;

    var inputCost = (inputTok / 1000000) * model.inputPer1M;
    var outputCost = (outputTok / 1000000) * model.outputPer1M;
    var totalCost = inputCost + outputCost;

    if (config.multiagent) {
      var subModel = MODELS[config.subagentModel || 'haiku'];
      var subInputTok = Math.round(scenario.inputTokens * 0.4);
      var subOutputTok = Math.round(scenario.outputTokens * 0.3);
      var subCostPer = (subInputTok / 1000000) * subModel.inputPer1M + (subOutputTok / 1000000) * subModel.outputPer1M;
      totalCost += subCostPer * 4;
      inputTok += subInputTok * 4;
      outputTok += subOutputTok * 4;
    }

    return { inputTok: inputTok, outputTok: outputTok, inputCost: inputCost, outputCost: outputCost, total: totalCost };
  }

  // ── DOM refs ──────────────────────────────────────
  var intro = document.getElementById('gameIntro');
  var main = document.getElementById('gameMain');
  var final_ = document.getElementById('gameFinal');
  var scenarioEl = document.getElementById('scenario');
  var configEl = document.getElementById('configPanel');
  var resultEl = document.getElementById('resultPanel');
  var btnExec = document.getElementById('btnExecute');

  // ── Current config ────────────────────────────────
  var currentConfig = { model: 'sonnet', temp: 0.3, rag: false, cot: false, multiagent: false, subagentModel: 'haiku' };

  // ── Render helpers ────────────────────────────────
  function fmt(n) { return n.toLocaleString('es-ES'); }
  function fmtMoney(n) { return '$' + n.toFixed(4); }
  function stars(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }

  function updateStats() {
    document.getElementById('statBudget').textContent = '$' + state.budget.toFixed(2);
    var fill = document.getElementById('budgetFill');
    var pct = (state.budget / 1.00) * 100;
    fill.style.width = pct + '%';
    fill.className = 'budget-fill' + (pct < 20 ? ' danger' : pct < 40 ? ' warn' : '');

    var avg = state.results.length > 0
      ? (state.results.reduce(function (s, r) { return s + r; }, 0) / state.results.length).toFixed(1)
      : '—';
    document.getElementById('statQuality').textContent = avg + (state.results.length > 0 ? ' / 5' : '');
    document.getElementById('statLevel').textContent = (state.level + 1) + ' / 6';

    var dots = document.getElementById('levelDots');
    dots.innerHTML = SCENARIOS.map(function (_, i) {
      var cls = 'level-dot';
      if (i < state.level) cls += state.results[i] >= 3 ? ' done' : ' skipped';
      else if (i === state.level) cls += ' current';
      return '<div class="' + cls + '"></div>';
    }).join('');
  }

  // ── Render scenario ───────────────────────────────
  function renderScenario() {
    var s = SCENARIOS[state.level];
    var html = '<div class="scenario-top">';
    html += '<span class="scenario-num">' + (state.level + 1) + '</span>';
    html += '<span class="scenario-title">' + s.title + '</span></div>';
    html += '<p class="scenario-desc">' + s.desc + '</p>';
    html += '<div class="scenario-meta">';
    html += '<span>📥 ' + s.meta.input + '</span>';
    html += '<span>📤 ' + s.meta.output + '</span>';
    html += '<span>📊 Dificultad: ' + s.meta.dificultad + '</span></div>';

    if (s.unlocks) {
      html += '<div class="scenario-unlock">' + s.unlocks.label + ' — ' + s.unlocks.desc + '</div>';
    }

    scenarioEl.innerHTML = html;
  }

  // ── Render config ─────────────────────────────────
  function renderConfig() {
    var s = SCENARIOS[state.level];
    currentConfig = { model: 'sonnet', temp: 0.3, rag: false, cot: false, multiagent: false, subagentModel: 'haiku' };

    var html = '';

    // Model selection
    html += '<div class="config-section"><h3>Modelo</h3><div class="model-options">';
    Object.keys(MODELS).forEach(function (key) {
      var m = MODELS[key];
      var sel = key === currentConfig.model ? ' selected' : '';
      html += '<div class="model-opt' + sel + '" data-model="' + key + '">';
      html += '<span class="mo-icon">' + m.icon + '</span>';
      html += '<span class="mo-name">' + m.name + '</span>';
      html += '<span class="mo-desc">' + m.desc + '</span>';
      html += '<span class="mo-price">$' + m.inputPer1M + ' / $' + m.outputPer1M + ' MTok</span>';
      html += '</div>';
    });
    html += '</div></div>';

    // Temperature
    html += '<div class="config-section"><h3>Temperatura</h3><div class="temp-options">';
    [{ v: 0, l: 'Determinista' }, { v: 0.3, l: 'Bajo' }, { v: 0.7, l: 'Medio' }, { v: 1.0, l: 'Alto' }].forEach(function (t) {
      var sel = t.v === currentConfig.temp ? ' selected' : '';
      html += '<div class="temp-opt' + sel + '" data-temp="' + t.v + '">';
      html += '<span class="to-val">' + t.v + '</span>';
      html += '<span class="to-label">' + t.l + '</span></div>';
    });
    html += '</div></div>';

    // RAG toggle
    if (state.unlockedRAG || (s.unlocks && s.unlocks.type === 'rag')) {
      state.unlockedRAG = true;
      html += '<div class="config-section"><h3>Arquitectura: RAG</h3><div class="toggle-options">';
      html += '<div class="toggle-opt" data-toggle="rag">';
      html += '<span class="tg-title">🔍 Activar RAG</span>';
      html += '<span class="tg-desc">Busca en documentos reales y añade los fragmentos más relevantes al contexto del modelo.</span>';
      html += '<span class="tg-cost">+4.000 tokens de input por consulta</span></div>';
      html += '</div></div>';
    }

    // CoT toggle
    if (state.unlockedCoT || (s.unlocks && s.unlocks.type === 'cot')) {
      state.unlockedCoT = true;
      html += '<div class="config-section"><h3>Razonamiento: Chain of Thought</h3><div class="toggle-options">';
      html += '<div class="toggle-opt" data-toggle="cot">';
      html += '<span class="tg-title">🔗 Activar CoT</span>';
      html += '<span class="tg-desc">El modelo razona paso a paso antes de dar la respuesta final. Genera tokens de "pensamiento" adicionales.</span>';
      html += '<span class="tg-cost">×3 tokens de output (razonamiento)</span></div>';
      html += '</div></div>';
    }

    // Multi-agent toggle
    if (state.unlockedMultiagent || (s.unlocks && s.unlocks.type === 'multiagent')) {
      state.unlockedMultiagent = true;
      html += '<div class="config-section"><h3>Arquitectura: Multi-agente</h3><div class="toggle-options">';
      html += '<div class="toggle-opt" data-toggle="multiagent">';
      html += '<span class="tg-title">🤖 Activar Multi-agente</span>';
      html += '<span class="tg-desc">Un orquestador reparte el trabajo entre 4 subagentes especializados con contexto aislado.</span>';
      html += '<span class="tg-cost">+4 llamadas extra (subagentes)</span></div>';
      html += '</div>';
      html += '<div class="subagent-config" id="subagentCfg" style="display:none;">';
      html += '<h4>Modelo para subagentes</h4><div class="model-options">';
      Object.keys(MODELS).forEach(function (key) {
        var m = MODELS[key];
        var sel = key === 'haiku' ? ' selected' : '';
        html += '<div class="model-opt' + sel + '" data-submodel="' + key + '">';
        html += '<span class="mo-icon">' + m.icon + '</span>';
        html += '<span class="mo-name">' + m.name + '</span>';
        html += '<span class="mo-price">$' + m.inputPer1M + ' / $' + m.outputPer1M + ' MTok</span>';
        html += '</div>';
      });
      html += '</div></div>';
      html += '</div>';
    }

    configEl.innerHTML = html;

    // Live cost preview
    updateCostPreview();

    // Event listeners
    configEl.querySelectorAll('[data-model]').forEach(function (el) {
      el.addEventListener('click', function () {
        if (this.dataset.submodel) return;
        configEl.querySelectorAll('[data-model]').forEach(function (e) {
          if (!e.dataset.submodel) e.classList.remove('selected');
        });
        this.classList.add('selected');
        currentConfig.model = this.dataset.model;
        updateCostPreview();
      });
    });

    configEl.querySelectorAll('[data-temp]').forEach(function (el) {
      el.addEventListener('click', function () {
        configEl.querySelectorAll('[data-temp]').forEach(function (e) { e.classList.remove('selected'); });
        this.classList.add('selected');
        currentConfig.temp = parseFloat(this.dataset.temp);
      });
    });

    configEl.querySelectorAll('[data-toggle]').forEach(function (el) {
      el.addEventListener('click', function () {
        var key = this.dataset.toggle;
        currentConfig[key] = !currentConfig[key];
        this.classList.toggle('selected', currentConfig[key]);
        if (key === 'multiagent') {
          var sub = document.getElementById('subagentCfg');
          if (sub) sub.style.display = currentConfig[key] ? 'block' : 'none';
        }
        updateCostPreview();
      });
    });

    configEl.querySelectorAll('[data-submodel]').forEach(function (el) {
      el.addEventListener('click', function () {
        configEl.querySelectorAll('[data-submodel]').forEach(function (e) { e.classList.remove('selected'); });
        this.classList.add('selected');
        currentConfig.subagentModel = this.dataset.submodel;
        updateCostPreview();
      });
    });
  }

  function updateCostPreview() {
    var s = SCENARIOS[state.level];
    var cost = calcCost(currentConfig, s);
    var existingPreview = document.getElementById('costPreview');
    if (existingPreview) existingPreview.remove();

    var div = document.createElement('div');
    div.id = 'costPreview';
    div.style.cssText = 'text-align:center; font-size:13px; color:var(--muted); margin-top:-12px; margin-bottom:12px;';
    var color = cost.total > state.budget ? 'var(--red)' : cost.total > state.budget * 0.3 ? 'var(--yellow)' : 'var(--green)';
    div.innerHTML = 'Coste estimado: <strong style="color:' + color + '; font-family:monospace;">' + fmtMoney(cost.total) + '</strong>' +
      ' (' + fmt(cost.inputTok) + ' input + ' + fmt(cost.outputTok) + ' output)';

    var execRow = document.querySelector('.execute-row');
    execRow.parentNode.insertBefore(div, execRow);

    btnExec.disabled = cost.total > state.budget;
  }

  // ── Execute ───────────────────────────────────────
  function execute() {
    var s = SCENARIOS[state.level];
    var cost = calcCost(currentConfig, s);

    if (cost.total > state.budget) return;

    btnExec.disabled = true;
    resultEl.style.display = 'block';

    var result = s.evaluate(currentConfig);
    state.budget -= cost.total;
    state.results.push(result.quality);

    var qualityLabel = result.quality >= 5 ? 'excellent' : result.quality >= 4 ? 'good' : result.quality >= 3 ? 'ok' : 'poor';
    var qualityText = result.quality >= 5 ? 'Excelente' : result.quality >= 4 ? 'Bueno' : result.quality >= 3 ? 'Aceptable' : 'Insuficiente';

    var html = '';
    html += '<div class="result-header">';
    html += '<span class="result-stars">' + stars(result.quality) + '</span>';
    html += '<span class="result-label">' + qualityText + '</span></div>';

    html += '<div class="token-anim">';
    html += '<div class="ta-block"><span class="ta-label">Input</span><span class="ta-num" id="animInput">0</span><span class="ta-cost" id="animInputCost">$0.0000</span></div>';
    html += '<span class="ta-arrow">→</span>';
    html += '<div class="ta-block"><span class="ta-label">' + MODELS[currentConfig.model].icon + ' ' + MODELS[currentConfig.model].name + '</span><span class="ta-num" style="font-size:20px;">⏳</span></div>';
    html += '<span class="ta-arrow">→</span>';
    html += '<div class="ta-block"><span class="ta-label">Output</span><span class="ta-num" id="animOutput">0</span><span class="ta-cost" id="animOutputCost">$0.0000</span></div>';
    html += '</div>';

    html += '<div class="result-breakdown">';
    html += '<div class="rb-item"><span class="rb-label">Tokens totales</span><span class="rb-value">' + fmt(cost.inputTok + cost.outputTok) + '</span></div>';
    html += '<div class="rb-item"><span class="rb-label">Coste</span><span class="rb-value" style="color:var(--yellow);">' + fmtMoney(cost.total) + '</span>';
    html += '<span class="rb-detail">Input: ' + fmtMoney(cost.inputCost) + ' · Output: ' + fmtMoney(cost.outputCost) + '</span></div>';
    html += '<div class="rb-item"><span class="rb-label">Presupuesto restante</span><span class="rb-value" style="color:' + (state.budget < 0.2 ? 'var(--red)' : 'var(--green)') + ';">$' + state.budget.toFixed(2) + '</span></div>';
    html += '<div class="rb-item"><span class="rb-label">Modelo usado</span><span class="rb-value">' + MODELS[currentConfig.model].icon + ' ' + MODELS[currentConfig.model].name + '</span></div>';
    html += '</div>';

    html += '<div class="result-feedback ' + qualityLabel + '">' + result.feedback + '</div>';
    html += '<div class="result-tip">' + result.tip + '</div>';

    if (state.level < 5) {
      html += '<button class="btn-next" id="btnNext">Siguiente nivel →</button>';
    } else {
      html += '<button class="btn-next" id="btnFinish">Ver resultados finales →</button>';
    }

    resultEl.innerHTML = html;
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    animateTokens(cost.inputTok, cost.outputTok, cost.inputCost, cost.outputCost);

    updateStats();

    var next = document.getElementById('btnNext');
    if (next) next.addEventListener('click', nextLevel);
    var finish = document.getElementById('btnFinish');
    if (finish) finish.addEventListener('click', showFinal);
  }

  function animateTokens(inputTok, outputTok, inputCost, outputCost) {
    var duration = 1200;
    var start = performance.now();
    var elIn = document.getElementById('animInput');
    var elOut = document.getElementById('animOutput');
    var elInCost = document.getElementById('animInputCost');
    var elOutCost = document.getElementById('animOutputCost');
    var modelIcon = resultEl.querySelector('.ta-block:nth-child(3)');

    function tick(now) {
      var t = Math.min((now - start) / duration, 1);
      var ease = 1 - Math.pow(1 - t, 3);
      if (elIn) {
        elIn.textContent = fmt(Math.round(inputTok * ease));
        elInCost.textContent = fmtMoney(inputCost * ease);
      }
      if (elOut) {
        elOut.textContent = fmt(Math.round(outputTok * ease));
        elOutCost.textContent = fmtMoney(outputCost * ease);
      }
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ── Next level ────────────────────────────────────
  function nextLevel() {
    state.level++;
    if (state.budget <= 0) {
      showFinal();
      return;
    }
    resultEl.style.display = 'none';
    var preview = document.getElementById('costPreview');
    if (preview) preview.remove();
    btnExec.disabled = false;
    renderScenario();
    renderConfig();
    updateStats();
    scenarioEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Final screen ──────────────────────────────────
  function showFinal() {
    main.style.display = 'none';
    final_.style.display = 'block';

    var avgQuality = state.results.reduce(function (s, r) { return s + r; }, 0) / state.results.length;
    var totalSpent = 1.00 - state.budget;
    var efficiency = avgQuality / Math.max(totalSpent * 10, 0.01);

    var grade, gradeClass, gradeIcon;
    if (avgQuality >= 4.2 && state.budget >= 0.15) { grade = 'S — Maestro del Token'; gradeClass = 's'; gradeIcon = '🏆'; }
    else if (avgQuality >= 3.5 && state.budget >= 0.05) { grade = 'A — Buen estratega'; gradeClass = 'a'; gradeIcon = '🥇'; }
    else if (avgQuality >= 2.5) { grade = 'B — Aprendiz'; gradeClass = 'b'; gradeIcon = '🥈'; }
    else { grade = 'C — Hay que practicar'; gradeClass = 'c'; gradeIcon = '🎯'; }

    var html = '';
    html += '<div class="final-icon">' + gradeIcon + '</div>';
    html += '<h1>Reto completado</h1>';
    html += '<p class="final-subtitle">Has completado ' + state.results.length + ' de 6 tareas</p>';
    html += '<div class="final-grade ' + gradeClass + '">' + grade + '</div>';

    html += '<div class="final-stats">';
    html += '<div class="final-stat"><span class="fs-value">' + avgQuality.toFixed(1) + '/5</span><span class="fs-label">Calidad media</span></div>';
    html += '<div class="final-stat"><span class="fs-value">$' + totalSpent.toFixed(3) + '</span><span class="fs-label">Gastado</span></div>';
    html += '<div class="final-stat"><span class="fs-value">$' + state.budget.toFixed(3) + '</span><span class="fs-label">Sobrante</span></div>';
    html += '</div>';

    html += '<div class="final-breakdown">';
    state.results.forEach(function (q, i) {
      var s = SCENARIOS[i];
      var cost = state.resultCosts ? state.resultCosts[i] : 0;
      html += '<div class="fb-row">';
      html += '<span class="fb-num">' + (i + 1) + '</span>';
      html += '<span class="fb-name">' + s.title + '</span>';
      html += '<span class="fb-stars">' + stars(q) + '</span>';
      html += '</div>';
    });
    html += '</div>';

    html += '<div style="max-width:560px; margin:0 auto 32px; text-align:left; font-size:14px; color:var(--muted); line-height:1.7;">';
    html += '<strong style="color:var(--text);">¿Qué hemos aprendido?</strong><br>';
    html += '• No siempre necesitas el modelo más caro — Haiku resuelve tareas simples perfectamente<br>';
    html += '• La temperatura importa: 0 para datos, alta para creatividad<br>';
    html += '• RAG es imprescindible cuando el modelo necesita datos que no tiene<br>';
    html += '• CoT mejora el razonamiento complejo pero multiplica los tokens de output<br>';
    html += '• Multi-agente brilla en tareas complejas con subtareas especializadas</div>';

    html += '<button class="btn-retry" id="btnRetry">🔄 Intentar de nuevo</button>';

    final_.innerHTML = html;

    var retry = document.getElementById('btnRetry');
    retry.addEventListener('click', function () {
      state = { budget: 1.00, level: 0, results: [], unlockedRAG: false, unlockedCoT: false, unlockedMultiagent: false };
      final_.style.display = 'none';
      main.style.display = 'block';
      resultEl.style.display = 'none';
      var preview = document.getElementById('costPreview');
      if (preview) preview.remove();
      btnExec.disabled = false;
      renderScenario();
      renderConfig();
      updateStats();
    });
  }

  // ── Init ──────────────────────────────────────────
  document.getElementById('btnStart').addEventListener('click', function () {
    intro.style.display = 'none';
    main.style.display = 'block';
    renderScenario();
    renderConfig();
    updateStats();
  });

  btnExec.addEventListener('click', execute);
})();
