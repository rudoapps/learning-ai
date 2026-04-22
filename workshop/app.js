// ===== Prompt Workshop — app.js =====

(function () {
  'use strict';

  // ---- Presets ----
  const PRESETS = {
    general: {
      system: 'Eres un asistente útil y conciso. Respondes en español. Si no sabes algo, lo dices claramente en lugar de inventar.',
      placeholder: '¿Cuáles son las 3 mejores prácticas para escribir código limpio?',
      simResponse: {
        thinking: 'El usuario pregunta sobre buenas prácticas de código limpio. Voy a enumerar las 3 más importantes con explicaciones breves.',
        toolCall: null,
        toolResult: null,
        output: '**3 mejores prácticas para código limpio:**\n\n1. **Nombres descriptivos** — Variables, funciones y clases deben tener nombres que expliquen su propósito. `calcularImpuesto()` es mejor que `calc()`.\n\n2. **Funciones pequeñas y con una sola responsabilidad** — Cada función debe hacer una sola cosa. Si necesitas usar "y" para describir lo que hace, probablemente debería dividirse.\n\n3. **Evitar comentarios innecesarios** — El código bien escrito se documenta solo. Los comentarios deben explicar el *por qué*, no el *qué*.'
      }
    },
    traductor: {
      system: 'Eres un traductor profesional. El usuario te dará texto en cualquier idioma y tú lo traducirás al idioma que te indique. Mantén el tono y estilo del original. No añadas explicaciones salvo que te lo pidan.',
      placeholder: 'Traduce al inglés: La inteligencia artificial está transformando cómo trabajamos',
      simResponse: {
        thinking: 'El usuario quiere traducir del español al inglés. Debo mantener el tono y estilo original.',
        toolCall: null,
        toolResult: null,
        output: 'Artificial intelligence is transforming the way we work.'
      }
    },
    codigo: {
      system: 'Eres un revisor de código senior. Analizas el código que te envían buscando: bugs, problemas de rendimiento, seguridad y legibilidad. Respondes con bullet points concretos y sugieres mejoras con ejemplos.',
      placeholder: '```python\ndef get_user(id):\n  return db.query(f\'SELECT * FROM users WHERE id={id}\')\n```',
      simResponse: {
        thinking: 'Veo una función que construye una consulta SQL con f-string. Esto es una vulnerabilidad de inyección SQL crítica. También hay otros problemas de estilo.',
        toolCall: null,
        toolResult: null,
        output: '🔴 **Crítico — Inyección SQL:**\nUsas f-string para construir la query. Un atacante podría enviar `id = "1; DROP TABLE users"` y destruir tu base de datos.\n\n```python\n# ❌ Vulnerable\ndb.query(f\'SELECT * FROM users WHERE id={id}\')\n\n# ✅ Seguro — usa parámetros\ndb.query(\'SELECT * FROM users WHERE id = %s\', (id,))\n```\n\n🟡 **Rendimiento — SELECT * :**\nSelecciona solo las columnas que necesitas. `SELECT *` trae datos innecesarios.\n\n🟡 **Legibilidad:**\n- `id` es un nombre reservado en Python. Usa `user_id` en su lugar.\n- Falta type hint: `def get_user(user_id: int) -> User:`'
      }
    },
    rpg: {
      system: 'Eres Aldric, un herrero enano que vive en las montañas de Khardum. Hablas con acento rudo pero eres amable. Nunca rompes el personaje. Si te preguntan algo fuera del mundo de fantasía, lo reinterpretas dentro del universo.',
      placeholder: '¿Puedes forjarme una espada de dragón?',
      simResponse: {
        thinking: 'Debo responder como Aldric el herrero enano. El usuario quiere una espada de dragón — un encargo complejo que requiere materiales especiales.',
        toolCall: null,
        toolResult: null,
        output: '*golpea el yunque con fuerza y se limpia el hollín de la barba*\n\n¡Ja! ¿Una espada de dragón, dices? No es tarea pa\' cualquier herrero del valle, eso te lo digo yo.\n\nNecesitarás tres cosas, muchacho:\n\n🔥 **Escamas de Wyrm Rojo** — Solo se consiguen en las cuevas de Ashenmaw, al este. Y no, no las venden en el mercado.\n\n⛏️ **Mineral de Khardum Profundo** — Eso sí te lo puedo vender. 50 monedas de oro el lingote. Necesito tres.\n\n✨ **Agua de la Fuente Eterna** — Pa\' templar el acero. Habla con la elfa del bosque de Silverleaf.\n\nTráeme eso y en tres lunas tendrás la mejor espada que hayan visto estos reinos. ¡Palabra de Aldric!'
      }
    }
  };

  // Tool schemas (simplified for display)
  const TOOL_SCHEMAS = {
    web_search: { name: 'web_search', description: 'Buscar información en la web', parameters: { type: 'object', properties: { query: { type: 'string', description: 'Consulta de búsqueda' } }, required: ['query'] } },
    read_files: { name: 'read_files', description: 'Leer archivos del sistema', parameters: { type: 'object', properties: { path: { type: 'string', description: 'Ruta del archivo' } }, required: ['path'] } },
    calculator: { name: 'calculator', description: 'Realizar cálculos matemáticos', parameters: { type: 'object', properties: { expression: { type: 'string', description: 'Expresión matemática' } }, required: ['expression'] } },
    calendar: { name: 'calendar', description: 'Consultar o crear eventos en el calendario', parameters: { type: 'object', properties: { action: { type: 'string', enum: ['list', 'create'] }, date: { type: 'string' } }, required: ['action'] } },
    send_email: { name: 'send_email', description: 'Enviar un correo electrónico', parameters: { type: 'object', properties: { to: { type: 'string' }, subject: { type: 'string' }, body: { type: 'string' } }, required: ['to', 'subject', 'body'] } }
  };

  // Tool simulation data (used when tools are enabled)
  const TOOL_SIMULATIONS = {
    general: { tool: 'web_search', input: '{ "query": "mejores prácticas código limpio 2025" }', result: '[\n  { "title": "Clean Code — Robert C. Martin", "snippet": "Nombres claros, funciones cortas, SRP..." },\n  { "title": "Google Style Guide", "snippet": "Consistencia, legibilidad, simplicidad..." }\n]' },
    traductor: null,
    codigo: { tool: 'web_search', input: '{ "query": "SQL injection prevention Python" }', result: '[\n  { "title": "OWASP SQL Injection Prevention", "snippet": "Usar consultas parametrizadas..." }\n]' },
    rpg: null
  };

  // ---- State ----
  let currentPreset = 'general';
  let enabledTools = new Set();
  let isSimulating = false;

  // ---- DOM refs ----
  const systemPrompt = document.getElementById('system-prompt');
  const userMessage = document.getElementById('user-message');
  const tempSlider = document.getElementById('temperature');
  const tempDisplay = document.getElementById('temp-display');
  const maxTokens = document.getElementById('max-tokens');
  const jsonPreview = document.getElementById('json-preview');
  const sendBtn = document.getElementById('send-btn');
  const simContainer = document.getElementById('simulation-container');
  const tokSystem = document.getElementById('tokens-system');
  const tokTools = document.getElementById('tokens-tools');
  const tokUser = document.getElementById('tokens-user');
  const tokTotal = document.getElementById('tokens-total');

  // ---- Init ----
  function init() {
    loadPreset('general');
    bindEvents();
    updatePreview();
  }

  // ---- Presets ----
  function loadPreset(name) {
    currentPreset = name;
    const p = PRESETS[name];
    systemPrompt.value = p.system;
    userMessage.value = p.placeholder;

    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === name);
    });

    clearSimulation();
    updatePreview();
  }

  // ---- Events ----
  function bindEvents() {
    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => loadPreset(btn.dataset.preset));
    });

    // Tool chips
    document.querySelectorAll('.tool-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const tool = chip.dataset.tool;
        if (enabledTools.has(tool)) {
          enabledTools.delete(tool);
          chip.classList.remove('active');
        } else {
          enabledTools.add(tool);
          chip.classList.add('active');
        }
        updatePreview();
      });
    });

    // Temperature slider
    tempSlider.addEventListener('input', () => {
      const val = (tempSlider.value / 100).toFixed(1);
      tempDisplay.textContent = val;
      // Color shift from green (precise) to orange (creative)
      const ratio = tempSlider.value / 100;
      if (ratio <= 0.3) {
        tempDisplay.style.color = 'var(--green)';
      } else if (ratio <= 0.7) {
        tempDisplay.style.color = 'var(--accent)';
      } else {
        tempDisplay.style.color = 'var(--orange)';
      }
      updatePreview();
    });

    // Max tokens
    maxTokens.addEventListener('change', updatePreview);

    // Textareas
    systemPrompt.addEventListener('input', updatePreview);
    userMessage.addEventListener('input', updatePreview);

    // Send
    sendBtn.addEventListener('click', runSimulation);
  }

  // ---- Token estimation ----
  function estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  function updateTokenCounts() {
    const sysTokens = estimateTokens(systemPrompt.value);
    const toolsText = enabledTools.size > 0
      ? JSON.stringify(Array.from(enabledTools).map(t => TOOL_SCHEMAS[t]))
      : '';
    const toolTokens = estimateTokens(toolsText);
    const userTokens = estimateTokens(userMessage.value);
    const total = sysTokens + toolTokens + userTokens;

    animateValue(tokSystem, sysTokens);
    animateValue(tokTools, toolTokens);
    animateValue(tokUser, userTokens);
    animateValue(tokTotal, total);
  }

  function animateValue(el, newVal) {
    const old = parseInt(el.textContent) || 0;
    if (old !== newVal) {
      el.textContent = newVal;
      el.classList.remove('pulse');
      void el.offsetWidth; // reflow
      el.classList.add('pulse');
    }
  }

  // ---- JSON Preview ----
  function updatePreview() {
    const obj = buildRequestObject();
    jsonPreview.innerHTML = syntaxHighlight(obj);
    updateTokenCounts();
  }

  function buildRequestObject() {
    const obj = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: parseInt(maxTokens.value),
      temperature: parseFloat((tempSlider.value / 100).toFixed(1)),
      system: systemPrompt.value || '(vacío)',
      messages: [
        { role: 'user', content: userMessage.value || '(vacío)' }
      ]
    };

    if (enabledTools.size > 0) {
      obj.tools = Array.from(enabledTools).map(t => TOOL_SCHEMAS[t]);
    }

    return obj;
  }

  function syntaxHighlight(obj) {
    const json = JSON.stringify(obj, null, 2);
    // We'll build colored HTML manually for better control
    return colorizeJSON(json, obj);
  }

  function colorizeJSON(json, obj) {
    // Escape HTML first
    let html = json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Colorize keys
    html = html.replace(/"([^"]+)"(?=\s*:)/g, '<span class="json-key">"$1"</span>');

    // Colorize numbers (not inside strings)
    html = html.replace(/:\s*(-?\d+\.?\d*)/g, function (match, num) {
      // Check if this is temperature
      const floatVal = parseFloat(num);
      if (floatVal === obj.temperature && match.includes(num) && floatVal < 2) {
        return ': <span class="json-num temp-val">' + num + '</span>';
      }
      return ': <span class="json-num">' + num + '</span>';
    });

    // Colorize string values (after colon)
    html = html.replace(/:\s*"([^"]*)"/g, function (match, str) {
      // Determine the color class based on content
      if (str === obj.system || str === '(vacío)' && match.length < 300) {
        return ': <span class="json-str system-val">"' + str + '"</span>';
      }
      return ': <span class="json-str">"' + str + '"</span>';
    });

    // Colorize string values inside arrays (not after colon)
    html = html.replace(/(?<=[\[,]\s*)"([^"]+)"/g, '<span class="json-str">"$1"</span>');

    // Colorize booleans
    html = html.replace(/:\s*(true|false)/g, ': <span class="json-bool">$1</span>');

    // Colorize null
    html = html.replace(/:\s*(null)/g, ': <span class="json-null">$1</span>');

    // Colorize brackets
    html = html.replace(/([{}\[\]])/g, '<span class="json-bracket">$1</span>');

    return html;
  }

  // ---- Simulation ----
  function clearSimulation() {
    simContainer.innerHTML = '';
  }

  async function runSimulation() {
    if (isSimulating) return;
    if (!userMessage.value.trim()) {
      userMessage.focus();
      return;
    }

    isSimulating = true;
    sendBtn.disabled = true;
    clearSimulation();

    const preset = PRESETS[currentPreset];
    const hasTools = enabledTools.size > 0;
    const toolSim = TOOL_SIMULATIONS[currentPreset];

    // Separator
    addSeparator('Simulación de ejecución');

    // Step 1: System prompt loaded
    await delay(400);
    addTechBlock('system', 'System Prompt Cargado', truncate(systemPrompt.value, 120), estimateTokens(systemPrompt.value));

    // Step 2: Tools registered (if any)
    if (hasTools) {
      await delay(500);
      const toolNames = Array.from(enabledTools).map(t => TOOL_SCHEMAS[t].name).join(', ');
      addTechBlock('tool-call', 'Herramientas Registradas', toolNames + '\n\nSe han registrado ' + enabledTools.size + ' herramienta(s) en el contexto del modelo.', estimateTokens(toolNames));
    }

    // Step 3: User message received
    await delay(400);
    addTechBlock('input', 'Mensaje del Usuario', userMessage.value, estimateTokens(userMessage.value));

    // Step 4: Thinking
    await delay(700);
    addTechBlock('thinking', 'Razonamiento Interno', preset.simResponse.thinking);

    // Step 5: Tool call + result (if tools enabled and there's a simulation)
    if (hasTools && toolSim) {
      await delay(600);
      addTechBlock('tool-call', 'Llamada a Herramienta → ' + toolSim.tool, toolSim.input);
      await delay(800);
      addTechBlock('tool-result', 'Resultado de ' + toolSim.tool, toolSim.result);
      await delay(400);
      addTechBlock('thinking', 'Procesando Resultado', 'Integrando la información obtenida de la herramienta en la respuesta final...');
    }

    // Step 6: Final response
    await delay(600);
    addTechBlock('output', 'Respuesta del Modelo', preset.simResponse.output, estimateTokens(preset.simResponse.output));

    isSimulating = false;
    sendBtn.disabled = false;

    // Scroll preview to bottom
    const previewArea = document.getElementById('preview-area');
    previewArea.scrollTop = previewArea.scrollHeight;
  }

  function addSeparator(text) {
    const div = document.createElement('div');
    div.className = 'sim-separator';
    div.textContent = text;
    simContainer.appendChild(div);
  }

  function addTechBlock(type, label, body, tokens) {
    const block = document.createElement('div');
    block.className = 'tech-block ' + type;

    let tokenBadge = '';
    if (tokens) {
      const badgeClass = (type === 'output') ? 'out' : 'in';
      tokenBadge = '<span class="token-badge ' + badgeClass + '">~' + tokens + ' tokens</span>';
    }

    block.innerHTML =
      '<div class="label">' +
        escapeHTML(label) +
        '<span class="tag">' + getTypeTag(type) + tokenBadge + '</span>' +
      '</div>' +
      '<div class="body">' + formatBody(body) + '</div>';

    simContainer.appendChild(block);

    // Scroll into view
    block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function getTypeTag(type) {
    switch (type) {
      case 'system': return 'type: system';
      case 'input': return 'type: input';
      case 'thinking': return 'type: thinking';
      case 'tool-call': return 'type: tool_use';
      case 'tool-result': return 'type: tool_result';
      case 'output': return 'type: output';
      default: return '';
    }
  }

  function formatBody(text) {
    // Escape HTML
    let html = escapeHTML(text);
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic (single *)
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Code blocks
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre style="background:var(--surface-2);padding:8px 10px;border-radius:6px;margin:6px 0;overflow-x:auto;"><code>$2</code></pre>');
    return html;
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function truncate(str, len) {
    return str.length > len ? str.slice(0, len) + '...' : str;
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ---- Boot ----
  init();
})();
