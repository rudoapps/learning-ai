const SCENARIOS = {
  parallel: {
    agents: [
      { id: 'orch', icon: '🎯', name: 'Orquestador', role: 'planner', tint: 'orange' },
      { id: 'w1',   icon: '🍕', name: 'Agente Comida', role: 'worker', tint: 'green' },
      { id: 'w2',   icon: '📍', name: 'Agente Lugar',  role: 'worker', tint: 'yellow' },
      { id: 'w3',   icon: '🎵', name: 'Agente Música', role: 'worker', tint: 'purple' },
    ],
    steps: [
      {
        side: 'tech', type: 'info', label: '🏗 Patrón: Orquestador + Subagentes',
        tag: 'empieza por aquí',
        content: '🤖 Un "sistema multi-agente" es simplemente VARIAS instancias del LLM trabajando a la vez, cada una con su propio prompt y su propia conversación.\n\nEn este patrón: UN orquestador recibe la misión, la parte en subtareas, lanza un agente por subtarea, espera resultados y los combina. El usuario solo habla con el orquestador.\n\nArriba ves 4 "carriles" — uno por cada agente.',
        delay: 300
      },
      {
        side: 'chat', type: 'user-message',
        content: 'Organiza una cena para 8 amigos el sábado en Madrid. Presupuesto 200€. A mi grupo le gusta la comida asiática.',
        delay: 1300
      },
      {
        side: 'tech', type: 'input', label: 'Pregunta al orquestador', inTokens: 28,
        content: '"Organiza una cena para 8 amigos el sábado en Madrid..."',
        delay: 600
      },
      {
        side: 'lane', agent: 'orch', type: 'think',
        label: 'leyendo misión...', working: true, delay: 700
      },
      {
        side: 'lane', agent: 'orch', type: 'dispatch',
        label: 'Plan inicial', detail: 'divido en 3 subtareas paralelas',
        outTokens: 90, delay: 1400
      },
      {
        side: 'tech', type: 'info', label: '🧠 Por qué paralelo',
        content: 'Las 3 subtareas (comida, lugar, música) son INDEPENDIENTES — el lugar no depende de la música. Hacerlas en paralelo divide el tiempo total por 3 (aprox.). Solo tiene sentido cuando no hay dependencias.',
        delay: 2000
      },
      // Dispatch arrows (fire nearly simultaneously)
      { side: 'lane', agent: 'w1', type: 'dispatch', label: '→ subtarea', detail: 'menú asiático 200€ x 8', inTokens: 40, delay: 500 },
      { side: 'lane', agent: 'w2', type: 'dispatch', label: '→ subtarea', detail: 'local Madrid sábado', inTokens: 38, delay: 60 },
      { side: 'lane', agent: 'w3', type: 'dispatch', label: '→ subtarea', detail: 'playlist cena asiática', inTokens: 34, delay: 60 },
      // Parallel work
      { side: 'lane', agent: 'w1', type: 'think', label: 'pensando', working: true, delay: 400 },
      { side: 'lane', agent: 'w2', type: 'think', label: 'pensando', working: true, delay: 80 },
      { side: 'lane', agent: 'w3', type: 'think', label: 'pensando', working: true, delay: 80 },
      { side: 'lane', agent: 'w1', type: 'tool', label: 'Web search', detail: 'platos coreanos grupo', outTokens: 18, delay: 900 },
      { side: 'lane', agent: 'w3', type: 'work', label: 'componiendo lista', outTokens: 120, delay: 800 },
      { side: 'lane', agent: 'w2', type: 'tool', label: 'Web search', detail: 'restaurantes asiáticos sábado Madrid', outTokens: 20, delay: 400 },
      { side: 'lane', agent: 'w1', type: 'work', label: 'diseñando menú', outTokens: 180, delay: 700 },
      { side: 'lane', agent: 'w3', type: 'result', label: '✓ 12 canciones', inTokens: 15, outTokens: 85, delay: 900 },
      { side: 'lane', agent: 'w3', type: 'done', delay: 50 },
      { side: 'lane', agent: 'w2', type: 'work', label: 'filtrando por aforo', inTokens: 220, outTokens: 90, delay: 1000 },
      { side: 'lane', agent: 'w1', type: 'result', label: '✓ menú 3 platos + postre', outTokens: 140, delay: 900 },
      { side: 'lane', agent: 'w1', type: 'done', delay: 50 },
      { side: 'lane', agent: 'w2', type: 'result', label: '✓ 3 opciones de local', outTokens: 110, delay: 700 },
      { side: 'lane', agent: 'w2', type: 'done', delay: 50 },
      {
        side: 'tech', type: 'info', label: '📥 Los 3 resultados vuelven al orquestador',
        content: 'Cada subagente devuelve un resumen corto, NO su conversación entera. El orquestador recibe 3 textos breves y los combina. Si los agentes devolvieran todo su historial, el orquestador se ahogaría en tokens.',
        delay: 2000
      },
      { side: 'lane', agent: 'orch', type: 'work', label: 'recibe 3 resultados', detail: 'menú + local + playlist', inTokens: 320, delay: 700 },
      { side: 'lane', agent: 'orch', type: 'think', label: 'compongo plan final', outTokens: 160, delay: 1200 },
      { side: 'lane', agent: 'orch', type: 'done', delay: 50 },
      {
        side: 'chat', type: 'assistant-message',
        content: '✅ Tu plan:\n\n📍 Local: Pan-Asian Kitchen (Chueca). Mesa para 8 a las 21:00, ~120€.\n\n🍜 Menú propuesto: bao de cerdo → bowl de ramen tonkotsu → mochi de matcha. ~55€/persona. Total ~440€ con el local — ajustable si quieres quedarte en 200€.\n\n🎵 Playlist: 12 temas de jazz oriental + citypop, 50 min.\n\n¿Te sirve o retocamos algo?',
        delay: 400
      },
      {
        side: 'tech', type: 'info', label: '💰 Coste real',
        content: 'Mira el contador arriba. Ese total es la SUMA de 4 conversaciones distintas:\n\n  • orquestador: ~500 tokens\n  • agente comida: ~400 tokens\n  • agente lugar: ~450 tokens\n  • agente música: ~200 tokens\n\nUn único LLM que hiciera todo secuencialmente gastaría MENOS tokens pero tardaría 3× más. Es un trade-off clásico: coste vs latencia.',
        delay: 2400
      },
      {
        side: 'tech', type: 'info', label: '🔑 Conclusión',
        content: 'Multi-agente no es "un LLM más inteligente". Es un LLM normal llamado varias veces con roles distintos. El VALOR lo aporta la descomposición: partir el problema en piezas pequeñas que quepan bien en un solo contexto.',
        delay: 2200
      }
    ]
  },

  sequential: {
    agents: [
      { id: 'orch', icon: '🎯', name: 'Orquestador',  role: 'planner',     tint: 'orange' },
      { id: 'w1',   icon: '📋', name: 'Planificador', role: 'design',      tint: 'accent' },
      { id: 'w2',   icon: '⚙️', name: 'Implementador', role: 'code',       tint: 'green' },
      { id: 'w3',   icon: '🧪', name: 'Tester',        role: 'validation', tint: 'yellow' },
      { id: 'w4',   icon: '👀', name: 'Revisor',       role: 'critique',   tint: 'purple' },
    ],
    steps: [
      {
        side: 'tech', type: 'info', label: '🏗 Patrón: pipeline secuencial',
        content: 'A veces las subtareas NO son paralelizables: el código necesita el plan, el test necesita el código, la revisión necesita el test. Cada agente toma el output del anterior y añade su contribución. Es un "pipeline".',
        delay: 300
      },
      {
        side: 'chat', type: 'user-message',
        content: 'Implementa un endpoint POST /users en Express con validación de email y password.',
        delay: 1300
      },
      {
        side: 'tech', type: 'input', label: 'Pregunta al orquestador', inTokens: 20, content: '"Implementa POST /users..."', delay: 500 },
      // Stage 1: planner
      { side: 'lane', agent: 'orch', type: 'dispatch', label: '→ Planificador', detail: 'diseña la ruta', outTokens: 20, delay: 800 },
      { side: 'lane', agent: 'w1', type: 'think', label: 'pensando', working: true, inTokens: 35, delay: 500 },
      { side: 'lane', agent: 'w1', type: 'work', label: 'escribe plan', outTokens: 180, delay: 1400 },
      { side: 'lane', agent: 'w1', type: 'result', label: '✓ plan entregado', detail: 'spec + validación + esquema', delay: 700 },
      { side: 'lane', agent: 'w1', type: 'done', delay: 50 },
      {
        side: 'tech', type: 'info', label: '🔗 Entrega al siguiente',
        content: 'El orquestador toma el plan de w1 y se lo pasa a w2. w2 NO ha visto la pregunta original — solo la versión estructurada que el planificador le dejó. Menos ambigüedad = mejor código.',
        delay: 1800
      },
      // Stage 2: coder
      { side: 'lane', agent: 'orch', type: 'dispatch', label: '→ Implementador', detail: 'código según plan', outTokens: 30, delay: 900 },
      { side: 'lane', agent: 'w2', type: 'think', label: 'pensando', working: true, inTokens: 210, delay: 500 },
      { side: 'lane', agent: 'w2', type: 'tool', label: 'Write', detail: 'src/routes/users.js', outTokens: 180, delay: 900 },
      { side: 'lane', agent: 'w2', type: 'work', label: 'añade Joi schema', outTokens: 90, delay: 700 },
      { side: 'lane', agent: 'w2', type: 'result', label: '✓ código escrito', detail: '42 líneas, usa Joi', delay: 600 },
      { side: 'lane', agent: 'w2', type: 'done', delay: 50 },
      // Stage 3: tester
      { side: 'lane', agent: 'orch', type: 'dispatch', label: '→ Tester', detail: 'cubre casos', outTokens: 22, delay: 800 },
      { side: 'lane', agent: 'w3', type: 'think', label: 'pensando casos', working: true, inTokens: 280, delay: 600 },
      { side: 'lane', agent: 'w3', type: 'tool', label: 'Write', detail: 'users.test.js', outTokens: 140, delay: 800 },
      { side: 'lane', agent: 'w3', type: 'tool', label: 'Bash', detail: 'npm test', outTokens: 8, delay: 600 },
      { side: 'lane', agent: 'w3', type: 'result', label: '✓ 5/5 tests pasan', detail: 'cobertura 92%', inTokens: 120, delay: 900 },
      { side: 'lane', agent: 'w3', type: 'done', delay: 50 },
      // Stage 4: reviewer
      { side: 'lane', agent: 'orch', type: 'dispatch', label: '→ Revisor', detail: 'critica código+test', outTokens: 20, delay: 800 },
      { side: 'lane', agent: 'w4', type: 'think', label: 'leyendo todo', working: true, inTokens: 420, delay: 800 },
      {
        side: 'tech', type: 'info', label: '⚠️ Mira el input del revisor',
        content: 'El revisor recibe TODO lo anterior: plan + código + tests. Su contexto es mucho más grande (~420t) que el del planner (~35t). En pipelines largos, el último agente suele ser el más caro.',
        delay: 2200
      },
      { side: 'lane', agent: 'w4', type: 'work', label: 'analiza', outTokens: 220, delay: 1000 },
      { side: 'lane', agent: 'w4', type: 'result', label: '⚠️ 2 mejoras sugeridas', detail: 'rate limit + hash password', outTokens: 80, delay: 900 },
      { side: 'lane', agent: 'w4', type: 'done', delay: 50 },
      // Orchestrator final
      { side: 'lane', agent: 'orch', type: 'work', label: 'compone respuesta', inTokens: 300, outTokens: 200, delay: 900 },
      { side: 'lane', agent: 'orch', type: 'done', delay: 50 },
      {
        side: 'chat', type: 'assistant-message',
        content: '✅ POST /users creado en src/routes/users.js (42 líneas, Joi para validar email/password).\n\n🧪 5/5 tests pasan (users.test.js, cobertura 92%).\n\n⚠️ El revisor sugirió dos mejoras opcionales:\n  1. Rate limit para evitar abuso del endpoint.\n  2. Hash con bcrypt antes de guardar la password.\n\n¿Las aplico?',
        delay: 300
      },
      {
        side: 'tech', type: 'info', label: '📐 Pipeline vs paralelo',
        content: 'Paralelo: rápido, caro, subtareas independientes.\nSecuencial: lento, más barato (cada agente ve solo lo necesario), ideal cuando hay dependencias.\n\nLos sistemas reales combinan ambos: un orquestador lanza fases secuenciales, y DENTRO de cada fase hay subagentes paralelos.',
        delay: 2400
      },
      {
        side: 'tech', type: 'info', label: '🔑 Por qué roles especializados',
        content: 'Un único LLM haciendo todo (planear + codear + testear + revisar) suele hacer peor cada parte. Con roles especializados, cada prompt puede afinarse ("eres un revisor crítico; busca fallos, no elogies") → mejor calidad por rol. Pero cuidado: demasiados agentes = orquestación frágil.',
        delay: 2400
      }
    ]
  },

  isolated: {
    agents: [
      { id: 'orch', icon: '🎯', name: 'Orquestador',  role: 'tiene TODO', tint: 'orange' },
      { id: 'w1',   icon: '🔍', name: 'Investigador', role: 'solo ve subtarea', tint: 'accent' },
    ],
    steps: [
      {
        side: 'tech', type: 'info', label: '🧠 Cada agente = su propio contexto',
        tag: 'el concepto más confundido',
        content: 'Mito: "los subagentes comparten lo que el orquestador sabe".\nRealidad: CADA subagente arranca con un prompt nuevo, sin el historial del orquestador. Solo ve lo que el orquestador le PASA EXPLÍCITAMENTE.\n\nEsto tiene ventajas (menos tokens, foco) y riesgos (puede que le falte contexto crítico).',
        delay: 300
      },
      {
        side: 'chat', type: 'user-message',
        content: 'Llevo 3 mensajes diciéndote que mi empresa se llama "Acme" y que nuestros clientes son B2B. Investiga si TechCrunch publicó algo sobre nosotros el mes pasado.',
        delay: 1500
      },
      { side: 'tech', type: 'input', label: 'Pregunta + historial (orquestador)', inTokens: 280, content: '[3 mensajes previos + la nueva petición]', delay: 600 },
      { side: 'lane', agent: 'orch', type: 'think', label: 'tiene TODO el historial', working: true, delay: 700 },
      {
        side: 'tech', type: 'info', label: '📤 Qué pasa el orquestador al subagente',
        content: 'Opción A (mala): pasarle TODO el historial (280 tokens).\nOpción B (buena): pasarle UN prompt limpio con solo lo necesario.\n\nLa opción B es la habitual. El orquestador "destila" el contexto relevante.',
        delay: 2000
      },
      { side: 'lane', agent: 'orch', type: 'dispatch', label: 'Prompt resumido →', detail: '"busca Acme en TechCrunch, marzo 2026"', outTokens: 28, delay: 1000 },
      {
        side: 'tech', type: 'info', label: '🆕 El subagente empieza DE CERO',
        content: 'Su contexto al arrancar = system prompt + el mensaje que le pasó el orquestador. NADA MÁS. No sabe que la empresa es B2B, no vio los 3 mensajes anteriores, no sabe quién eres.\n\nEso es lo que hace el patrón eficiente: 28 tokens de input en lugar de 280.',
        delay: 2400
      },
      { side: 'lane', agent: 'w1', type: 'think', label: 'arranca limpio', working: true, inTokens: 28, delay: 700 },
      { side: 'lane', agent: 'w1', type: 'tool', label: 'Web search', detail: 'Acme TechCrunch mar 2026', outTokens: 18, delay: 900 },
      { side: 'lane', agent: 'w1', type: 'tool', label: 'Web fetch', detail: 'techcrunch.com/2026/03/...', inTokens: 380, delay: 800 },
      { side: 'lane', agent: 'w1', type: 'work', label: 'leyendo artículo', delay: 900 },
      { side: 'lane', agent: 'w1', type: 'result', label: '✓ 1 artículo encontrado', detail: 'serie B de Acme', outTokens: 120, delay: 800 },
      { side: 'lane', agent: 'w1', type: 'done', delay: 50 },
      {
        side: 'tech', type: 'info', label: '📥 El orquestador recibe SOLO el resumen',
        content: 'El investigador no devuelve "lo que leí durante 900ms" — devuelve un resumen de 120 tokens. El orquestador recupera eso Y su historial completo, y compone la respuesta final AL USUARIO.',
        delay: 2400
      },
      { side: 'lane', agent: 'orch', type: 'work', label: 'integra resumen en historial', inTokens: 400, outTokens: 130, delay: 900 },
      { side: 'lane', agent: 'orch', type: 'done', delay: 50 },
      {
        side: 'chat', type: 'assistant-message',
        content: 'Sí: TechCrunch publicó el 12 de marzo de 2026 un artículo sobre la serie B de 15M$ que cerró Acme, destacando vuestro enfoque B2B y la integración con Salesforce.',
        delay: 300
      },
      {
        side: 'tech', type: 'info', label: '⚖️ La desventaja del aislamiento',
        content: 'Si el orquestador NO le pasa algo crítico al subagente, el subagente no lo sabe. Ejemplo real: si solo dices "busca Acme" sin decir "B2B", quizás devuelve resultados de Acme Corp del coyote (Looney Tunes). El resumen que pasa el orquestador ES el cuello de botella.',
        delay: 2400
      },
      {
        side: 'tech', type: 'info', label: '🔑 La lección',
        content: 'Multi-agente barato y eficiente = cada agente ve lo mínimo. Pero "lo mínimo" hay que elegirlo bien. El arte de los sistemas multi-agente está en diseñar QUÉ pasa cada nivel al siguiente.',
        delay: 2200
      }
    ]
  },

  recover: {
    agents: [
      { id: 'orch', icon: '🎯', name: 'Orquestador', role: 'planner',  tint: 'orange' },
      { id: 'w1',   icon: '💾', name: 'DB Agent',    role: 'consulta', tint: 'accent' },
      { id: 'w2',   icon: '📊', name: 'Stats Agent', role: 'análisis', tint: 'green' },
      { id: 'w3',   icon: '📧', name: 'Email Agent', role: 'envío',    tint: 'red' },
    ],
    steps: [
      {
        side: 'tech', type: 'info', label: '🛡 Qué pasa cuando un subagente falla',
        content: 'Los agentes del mundo real fallan: la API se cae, el tool devuelve error, el modelo alucina un JSON inválido. El orquestador necesita detectar el fallo y decidir: ¿reintentar? ¿reasignar a otro agente? ¿rendirse?',
        delay: 300
      },
      {
        side: 'chat', type: 'user-message',
        content: 'Envíame por email un resumen de ventas de ayer.',
        delay: 1300
      },
      { side: 'tech', type: 'input', label: 'Pregunta al orquestador', inTokens: 14, content: '"Envíame resumen ventas ayer"', delay: 500 },
      { side: 'lane', agent: 'orch', type: 'think', label: 'pipeline: DB → Stats → Email', working: true, outTokens: 45, delay: 900 },
      // Fase 1: DB query
      { side: 'lane', agent: 'orch', type: 'dispatch', label: '→ DB Agent', detail: 'ventas 2026-04-18', outTokens: 22, delay: 700 },
      { side: 'lane', agent: 'w1', type: 'think', working: true, label: 'pensando', inTokens: 40, delay: 500 },
      { side: 'lane', agent: 'w1', type: 'tool', label: 'SQL', detail: 'SELECT ... FROM sales', outTokens: 40, delay: 700 },
      { side: 'lane', agent: 'w1', type: 'result', label: '✓ 247 filas', inTokens: 320, outTokens: 80, delay: 800 },
      { side: 'lane', agent: 'w1', type: 'done', delay: 50 },
      // Fase 2: Stats analysis
      { side: 'lane', agent: 'orch', type: 'dispatch', label: '→ Stats Agent', detail: 'resume 247 filas', outTokens: 20, delay: 700 },
      { side: 'lane', agent: 'w2', type: 'think', working: true, label: 'pensando', inTokens: 400, delay: 500 },
      { side: 'lane', agent: 'w2', type: 'work', label: 'calcula KPIs', outTokens: 140, delay: 900 },
      { side: 'lane', agent: 'w2', type: 'result', label: '✓ resumen listo', detail: '+12% vs ayer · top 3 productos', outTokens: 60, delay: 800 },
      { side: 'lane', agent: 'w2', type: 'done', delay: 50 },
      // Fase 3: Email — FALLA
      { side: 'lane', agent: 'orch', type: 'dispatch', label: '→ Email Agent', detail: 'envía a fer@...', outTokens: 25, delay: 800 },
      { side: 'lane', agent: 'w3', type: 'think', working: true, label: 'pensando', inTokens: 180, delay: 500 },
      { side: 'lane', agent: 'w3', type: 'tool', label: 'send_email', detail: 'to=fer@empresa.com', outTokens: 30, delay: 700 },
      { side: 'lane', agent: 'w3', type: 'error', label: '✗ ERROR 503', detail: 'SMTP timeout', inTokens: 30, delay: 1200 },
      {
        side: 'tech', type: 'info', label: '🚨 El subagente falla',
        tag: 'momento crítico',
        content: 'La herramienta `send_email` devolvió 503 (servicio caído). El Email Agent se lo pasa al orquestador. Aquí es donde el diseño del sistema importa:\n\n  • Sistema ingenuo → el orquestador no distingue error de éxito. Dice al usuario "enviado" aunque no sea verdad. 🔥\n  • Sistema robusto → detecta el error y reacciona.',
        delay: 2400
      },
      { side: 'lane', agent: 'orch', type: 'think', label: 'detecta error, decide', working: true, inTokens: 80, outTokens: 60, delay: 1200 },
      {
        side: 'tech', type: 'info', label: '🔁 Estrategia: reintento con backoff',
        content: 'El orquestador escoge reintentar tras 2 segundos. Es una decisión del MODELO (instruido via system prompt: "si un tool falla con 5xx, reintenta hasta 3 veces con espera exponencial").',
        delay: 1800
      },
      { side: 'lane', agent: 'orch', type: 'dispatch', label: '↺ Reintento 1/3', detail: 'tras 2s', outTokens: 18, delay: 1200 },
      { side: 'lane', agent: 'w3', type: 'tool', label: 'send_email', detail: 'retry', outTokens: 30, delay: 700 },
      { side: 'lane', agent: 'w3', type: 'result', label: '✓ enviado', detail: 'message_id=xyz123', inTokens: 20, outTokens: 45, delay: 900 },
      { side: 'lane', agent: 'w3', type: 'done', delay: 50 },
      { side: 'lane', agent: 'orch', type: 'work', label: 'informa al usuario', inTokens: 50, outTokens: 40, delay: 700 },
      { side: 'lane', agent: 'orch', type: 'done', delay: 50 },
      {
        side: 'chat', type: 'assistant-message',
        content: '✅ Email enviado con el resumen de ventas de ayer:\n\n  • Ingresos: 12.430€ (+12% vs lunes)\n  • 247 transacciones\n  • Top 3: teclados mecánicos, cables USB-C, hubs Thunderbolt\n\n(Hubo un timeout del SMTP en el primer intento; reenviado automáticamente.)',
        delay: 300
      },
      {
        side: 'tech', type: 'info', label: '🛠 Qué hace robusto al sistema',
        content: '1. Los subagentes devuelven errores ESTRUCTURADOS (código + razón), no texto libre.\n2. El orquestador tiene reglas claras en su prompt sobre qué hacer con cada tipo de error.\n3. Hay un límite máximo de reintentos — sin él, un bucle puede quemarte $$ en segundos.\n4. Se informa al usuario de la eventualidad: no ocultar fallos transitorios.',
        delay: 2400
      },
      {
        side: 'tech', type: 'info', label: '🔑 Conclusión',
        content: 'Los sistemas multi-agente son frágiles por naturaleza: cada agente puede fallar, el orquestador puede malinterpretar resultados, los errores se propagan en cascada. La mayoría del trabajo de producción está en diseñar BIEN los mensajes, los errores estructurados y los puntos de reintento — no en el LLM en sí.',
        delay: 2400
      }
    ]
  }
};
