// Cada step: { side: 'user'|'tech', type, content, delay (ms antes de ejecutarlo) }
const SCENARIOS = {
  weather: [
    {
      side: 'tech', type: 'system', label: 'System prompt (instrucciones iniciales)',
      tag: 'se envía en CADA turno',
      inTokens: 38,
      content: 'Eres un asistente útil. Tienes acceso a herramientas externas para obtener información en tiempo real cuando el usuario la pida (clima, búsquedas, etc.). Responde en español.',
      delay: 300
    },
    {
      side: 'tech', type: 'info', label: 'Estado',
      content: '💤 Esperando mensaje del usuario...',
      delay: 600
    },
    {
      side: 'user', type: 'user-message',
      content: '¿Qué tiempo hace en Madrid ahora mismo?',
      delay: 1200
    },
    {
      side: 'tech', type: 'input', label: 'Mensaje recibido del usuario',
      inTokens: 12,
      content: '"¿Qué tiempo hace en Madrid ahora mismo?"',
      delay: 500
    },
    {
      side: 'user', type: 'typing',
      delay: 400
    },
    {
      side: 'tech', type: 'thinking', label: 'Razonamiento interno del modelo',
      tag: 'no visible al usuario — pero SÍ se factura como output',
      outTokens: 42,
      content: 'El usuario pregunta por el tiempo actual en Madrid. No puedo saberlo yo solo: mi conocimiento tiene fecha de corte. Necesito usar la herramienta get_weather con la ciudad como parámetro.',
      delay: 1800
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 Llamada a herramienta',
      tag: 'la IA la GENERA → output',
      outTokens: 24,
      content: '{\n  "tool": "get_weather",\n  "arguments": {\n    "city": "Madrid",\n    "country": "ES",\n    "units": "celsius"\n  }\n}',
      delay: 1200
    },
    {
      side: 'tech', type: 'info', label: 'Ejecutando...',
      content: '⚙️  HTTP GET api.weather.com/v1/current?q=Madrid,ES\n    (la IA NO ejecuta esto — lo hace el sistema que la hospeda)',
      delay: 1400
    },
    {
      side: 'tech', type: 'tool-result', label: '✅ Resultado de la herramienta',
      tag: 'vuelve a la IA → input',
      inTokens: 55,
      content: '{\n  "city": "Madrid",\n  "temperature": 18,\n  "feels_like": 17,\n  "condition": "Parcialmente nublado",\n  "humidity": 62,\n  "wind_kmh": 11\n}',
      delay: 1000
    },
    {
      side: 'tech', type: 'thinking', label: 'Razonamiento interno',
      outTokens: 22,
      content: 'Ya tengo los datos. Ahora los resumo de forma natural y amable, sin abrumar con todos los números.',
      delay: 1400
    },
    {
      side: 'tech', type: 'output', label: 'Respuesta generada',
      tag: 'token a token',
      outTokens: 38,
      content: 'En Madrid hace 18°C con el cielo parcialmente nublado. La humedad es del 62% y hay una brisa suave de 11 km/h. ¡Un día agradable para salir!',
      delay: 1000
    },
    {
      side: 'user', type: 'assistant-message',
      content: 'En Madrid hace 18°C con el cielo parcialmente nublado. La humedad es del 62% y hay una brisa suave de 11 km/h. ¡Un día agradable para salir!',
      delay: 200
    },
    {
      side: 'tech', type: 'info', label: 'Fin del turno — factura',
      content: '💸 Total: ~105 input + 126 output.\n   Fíjate que el "pensamiento" y los tool calls también son OUTPUT y cuestan.\n   En el próximo mensaje del usuario, TODO lo anterior se reenvía como input → la conversación crece y cada turno es más caro.',
      delay: 1800
    }
  ],

  math: [
    {
      side: 'tech', type: 'system', label: 'System prompt',
      inTokens: 45,
      content: 'Eres un asistente con acceso a una calculadora. Para cálculos numéricos SIEMPRE usa la herramienta en vez de calcular mentalmente (los modelos de lenguaje se equivocan con aritmética larga).',
      delay: 300
    },
    {
      side: 'user', type: 'user-message',
      content: 'Tengo una factura de 1.247,80€ y quiero aplicar un descuento del 15% y luego sumarle el 21% de IVA. ¿Cuánto queda?',
      delay: 1200
    },
    {
      side: 'tech', type: 'input', label: 'Entrada del usuario',
      inTokens: 36,
      content: '"Tengo una factura de 1.247,80€ y quiero aplicar un descuento del 15% y luego sumarle el 21% de IVA. ¿Cuánto queda?"',
      delay: 500
    },
    {
      side: 'user', type: 'typing',
      delay: 300
    },
    {
      side: 'tech', type: 'thinking', label: 'Razonamiento',
      outTokens: 48,
      content: 'Tengo que hacer dos operaciones: (1) 1247.80 × 0.85 para el descuento, (2) resultado × 1.21 para el IVA. Voy a llamar a la calculadora.',
      delay: 1800
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 Llamada 1',
      outTokens: 18,
      content: '{\n  "tool": "calculator",\n  "expression": "1247.80 * 0.85"\n}',
      delay: 1200
    },
    {
      side: 'tech', type: 'tool-result', label: '✅ Resultado 1',
      inTokens: 10,
      content: '{ "result": 1060.63 }',
      delay: 900
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 Llamada 2',
      outTokens: 18,
      content: '{\n  "tool": "calculator",\n  "expression": "1060.63 * 1.21"\n}',
      delay: 1200
    },
    {
      side: 'tech', type: 'tool-result', label: '✅ Resultado 2',
      inTokens: 10,
      content: '{ "result": 1283.36 }',
      delay: 900
    },
    {
      side: 'tech', type: 'output', label: 'Respuesta generada',
      outTokens: 42,
      content: 'Con el 15% de descuento la factura baja a 1.060,63€. Al aplicar el 21% de IVA, el total final es 1.283,36€.',
      delay: 1000
    },
    {
      side: 'user', type: 'assistant-message',
      content: 'Con el 15% de descuento la factura baja a 1.060,63€. Al aplicar el 21% de IVA, el total final es 1.283,36€.',
      delay: 200
    },
    {
      side: 'tech', type: 'info', label: 'Observa',
      content: '👀 La IA NO hizo las multiplicaciones: las delegó. Así evita errores aritméticos.',
      delay: 1500
    }
  ],

  search: [
    {
      side: 'tech', type: 'system', label: 'System prompt',
      inTokens: 42,
      content: 'Eres un asistente con acceso a búsqueda web. Tu conocimiento tiene fecha de corte en enero 2025. Para eventos posteriores o información muy reciente, usa la herramienta web_search.',
      delay: 300
    },
    {
      side: 'user', type: 'user-message',
      content: '¿Quién ganó el último Balón de Oro?',
      delay: 1200
    },
    {
      side: 'tech', type: 'input', label: 'Entrada del usuario',
      inTokens: 11,
      content: '"¿Quién ganó el último Balón de Oro?"',
      delay: 500
    },
    {
      side: 'user', type: 'typing',
      delay: 300
    },
    {
      side: 'tech', type: 'thinking', label: 'Razonamiento',
      outTokens: 56,
      content: 'El Balón de Oro se entrega cada año en octubre/noviembre. No sé cuál es "el último" desde la perspectiva del usuario — podría ser posterior a mi fecha de corte. Mejor busco en la web para no inventar.',
      delay: 2000
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 Búsqueda web',
      outTokens: 18,
      content: '{\n  "tool": "web_search",\n  "query": "ganador Balón de Oro 2025"\n}',
      delay: 1200
    },
    {
      side: 'tech', type: 'tool-result', label: '✅ Resultados',
      tag: 'las búsquedas web suelen ser MUY costosas en input',
      inTokens: 380,
      content: '[\n  {\n    "title": "Ousmane Dembélé gana el Balón de Oro 2025",\n    "url": "marca.com/...",\n    "snippet": "El delantero francés del PSG se impone..."\n  },\n  {\n    "title": "Gala París — resultados completos",\n    "url": "uefa.com/...",\n    "snippet": "Dembélé recoge el trofeo tras una temporada histórica..."\n  }\n]',
      delay: 1400
    },
    {
      side: 'tech', type: 'thinking', label: 'Razonamiento',
      outTokens: 28,
      content: 'Los resultados son consistentes: Dembélé ganó el Balón de Oro 2025. Cito la fuente para que el usuario pueda verificar.',
      delay: 1500
    },
    {
      side: 'tech', type: 'output', label: 'Respuesta generada',
      outTokens: 35,
      content: 'El último Balón de Oro (2025) lo ganó Ousmane Dembélé, delantero francés del PSG, tras una temporada destacada. Fuente: Marca / UEFA.',
      delay: 1000
    },
    {
      side: 'user', type: 'assistant-message',
      content: 'El último Balón de Oro (2025) lo ganó Ousmane Dembélé, delantero francés del PSG, tras una temporada destacada. Fuente: Marca / UEFA.'
,
      delay: 200
    },
    {
      side: 'tech', type: 'info', label: 'Clave',
      content: '🧠 Sin búsqueda, la IA habría respondido con datos desactualizados o se los habría inventado ("alucinación"). Las herramientas anclan sus respuestas a la realidad.',
      delay: 1500
    }
  ],

  mcp: [
    {
      side: 'tech', type: 'info', label: '¿Qué es MCP?',
      tag: 'contexto previo',
      content: '📡 MCP (Model Context Protocol) es un estándar abierto para que una IA se conecte a "servidores" externos que le dan herramientas y datos: tu base de datos, tu GitHub, tu Slack, tu sistema de archivos... El cliente (la app que habla con la IA) arranca esos servidores y le expone sus herramientas.',
      delay: 300
    },
    {
      side: 'tech', type: 'info', label: 'Arranque del cliente',
      content: '🚀 Lanzando servidores MCP configurados:\n  • mcp-server-postgres  (base de datos interna)\n  • mcp-server-github    (repos de la empresa)\n  • mcp-server-slack     (mensajería)',
      delay: 1500
    },
    {
      side: 'tech', type: 'tool-call', label: '🤝 Handshake MCP',
      tag: 'JSON-RPC sobre stdio',
      content: '→ { "method": "initialize", "params": { "protocolVersion": "2025-03-26" } }\n← { "result": { "serverInfo": { "name": "postgres", "version": "1.2" } } }',
      delay: 1400
    },
    {
      side: 'tech', type: 'tool-call', label: '📋 Listado de herramientas',
      tag: 'las definiciones se inyectan como input en CADA turno',
      inTokens: 420,
      content: '→ { "method": "tools/list" }\n← { "tools": [\n    { "name": "query_db", "description": "Ejecuta SQL de solo lectura" },\n    { "name": "list_tables", "description": "Lista tablas" },\n    { "name": "github_search_prs", "description": "Busca PRs" },\n    { "name": "slack_post", "description": "Envía mensaje a canal" }\n  ] }',
      delay: 1600
    },
    {
      side: 'tech', type: 'system', label: 'System prompt (ya con herramientas MCP inyectadas)',
      inTokens: 52,
      content: 'Eres un asistente interno de la empresa. Tienes acceso a herramientas MCP: query_db, list_tables, github_search_prs, slack_post. Usa solo los datos que obtengas de estas herramientas; no inventes.',
      delay: 1000
    },
    {
      side: 'user', type: 'user-message',
      content: '¿Cuántos usuarios nuevos se registraron ayer? Y avisa al canal #growth.',
      delay: 1400
    },
    {
      side: 'tech', type: 'input', label: 'Mensaje del usuario',
      inTokens: 18,
      content: '"¿Cuántos usuarios nuevos se registraron ayer? Y avisa al canal #growth."',
      delay: 500
    },
    {
      side: 'user', type: 'typing',
      delay: 300
    },
    {
      side: 'tech', type: 'thinking', label: 'Razonamiento',
      outTokens: 52,
      content: 'Necesito dos cosas: (1) consultar la BBDD para contar registros de ayer, (2) publicar el resultado en Slack. Ambas son herramientas MCP. Primero el SQL, luego el mensaje.',
      delay: 1800
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 query_db  (servidor MCP: postgres)',
      tag: 'petición JSON-RPC',
      outTokens: 42,
      content: '{\n  "method": "tools/call",\n  "params": {\n    "name": "query_db",\n    "arguments": {\n      "sql": "SELECT COUNT(*) FROM users WHERE created_at::date = CURRENT_DATE - 1"\n    }\n  }\n}',
      delay: 1400
    },
    {
      side: 'tech', type: 'info', label: 'El servidor MCP ejecuta localmente',
      content: '⚙️  postgres-mcp abre conexión a la BBDD interna, ejecuta el SQL con permisos de solo lectura y devuelve el resultado. La IA nunca ve credenciales ni habla directo con la BBDD.',
      delay: 1400
    },
    {
      side: 'tech', type: 'tool-result', label: '✅ Respuesta MCP',
      inTokens: 25,
      content: '{\n  "content": [\n    { "type": "text", "text": "[{\\"count\\": 147}]" }\n  ]\n}',
      delay: 1000
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 slack_post  (servidor MCP: slack)',
      outTokens: 48,
      content: '{\n  "method": "tools/call",\n  "params": {\n    "name": "slack_post",\n    "arguments": {\n      "channel": "#growth",\n      "text": "📈 Ayer se registraron 147 usuarios nuevos."\n    }\n  }\n}',
      delay: 1400
    },
    {
      side: 'tech', type: 'tool-result', label: '✅ Respuesta MCP',
      inTokens: 22,
      content: '{ "content": [{ "type": "text", "text": "{\\"ok\\": true, \\"ts\\": \\"1712934821.001\\"}" }] }',
      delay: 900
    },
    {
      side: 'tech', type: 'output', label: 'Respuesta al usuario',
      outTokens: 20,
      content: 'Ayer se registraron 147 usuarios nuevos. Acabo de publicarlo en #growth ✅',
      delay: 1000
    },
    {
      side: 'user', type: 'assistant-message',
      content: 'Ayer se registraron 147 usuarios nuevos. Acabo de publicarlo en #growth ✅',
      delay: 200
    },
    {
      side: 'tech', type: 'info', label: 'Clave de MCP',
      content: '🔑 La IA no "sabe" SQL de tu BBDD ni tiene cuenta en Slack. Usa un protocolo estándar para pedirle a servidores locales que lo hagan por ella. Cambias de proveedor de IA sin tocar la integración.',
      delay: 1800
    },
    {
      side: 'tech', type: 'info', label: '⚠️ Coste oculto de MCP',
      content: '📊 Las definiciones de herramientas (sus nombres, descripciones y schemas JSON) se reenvían como INPUT en CADA turno. Con 4 herramientas ya son ~420 tokens. Con 30 herramientas conectadas pueden ser miles — aunque no uses ninguna. Por eso conviene conectar solo los MCP que de verdad necesites.',
      delay: 2000
    }
  ],

  compaction: [
    {
      side: 'tech', type: 'info', label: '¿Qué es la compactación?',
      tag: 'contexto previo',
      content: '📦 Una IA tiene una "ventana de contexto" limitada (ej. 200k tokens). Cada mensaje de la conversación se queda ahí ocupando espacio. Cuando se llena, hay que resumir lo anterior para hacer hueco. Eso es compactación.',
      delay: 300
    },
    {
      side: 'tech', type: 'info', label: 'Estado del contexto',
      tag: '8.240 / 200.000 tokens',
      inTokens: 8240,
      content: '▓░░░░░░░░░░░░░░░░░░░ 4%   — conversación corta, todo cabe',
      delay: 1200
    },
    {
      side: 'user', type: 'user-message',
      content: 'Ayúdame a diseñar el esquema de base de datos para una tienda online.',
      delay: 1300
    },
    {
      side: 'user', type: 'assistant-message',
      content: 'Claro. Propongo las tablas: users, products, categories, orders, order_items, payments. ¿Quieres que detalle los campos?',
      delay: 1400
    },
    {
      side: 'tech', type: 'info', label: 'Estado del contexto',
      tag: '45.100 / 200.000 tokens',
      inTokens: 36860,
      content: '▓▓▓▓▓░░░░░░░░░░░░░░░ 22%   — tras 15 mensajes con ejemplos y SQL',
      delay: 1200
    },
    {
      side: 'user', type: 'user-message',
      content: '[...35 mensajes más tarde, discutiendo índices, triggers, migraciones, seeding, tests...]',
      delay: 1400
    },
    {
      side: 'tech', type: 'info', label: 'Estado del contexto',
      tag: '178.500 / 200.000 tokens',
      inTokens: 133400,
      content: '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░ 89%   — ⚠️  cerca del límite',
      delay: 1400
    },
    {
      side: 'tech', type: 'info', label: '🚨 Umbral superado',
      content: 'El cliente detecta que se acerca al límite. Antes de que la siguiente respuesta falle, dispara una COMPACTACIÓN.',
      delay: 1400
    },
    {
      side: 'tech', type: 'tool-call', label: '🗜  Llamada interna: compact_conversation',
      tag: 'el sistema lo pide, no el usuario',
      content: '{\n  "action": "summarize_history",\n  "keep_last_n_messages": 4,\n  "target_tokens": 8000\n}',
      delay: 1400
    },
    {
      side: 'tech', type: 'thinking', label: 'La IA resume la conversación',
      content: 'Tengo que destilar 50 mensajes en un resumen breve que preserve: decisiones tomadas, esquemas acordados, convenciones de nombres, problemas resueltos. Descarto: charla, ejemplos intermedios, reformulaciones.',
      delay: 2200
    },
    {
      side: 'tech', type: 'tool-result', label: '✅ Resumen generado',
      tag: 'coste de resumir 170k tokens',
      outTokens: 6800,
      content: 'RESUMEN DE LA CONVERSACIÓN HASTA AHORA:\n• Proyecto: tienda online con PostgreSQL 15.\n• Esquema acordado: users, products, categories, orders, order_items, payments, audit_log.\n• Convención: snake_case, UUIDs como PKs, timestamps con zona.\n• Decisiones: índice GIN sobre products.tags; soft-delete en users; partición por fecha en orders.\n• Pendiente: definir política de retención y migrar datos legacy del CSV que adjuntó el usuario.',
      delay: 1800
    },
    {
      side: 'tech', type: 'info', label: 'Reemplazo del contexto',
      content: '🔄 Se eliminan los 50 mensajes antiguos del contexto activo.\n   En su lugar, se inyecta el resumen + los 4 últimos mensajes literales.',
      delay: 1600
    },
    {
      side: 'tech', type: 'info', label: 'Estado del contexto tras compactar',
      tag: '11.200 / 200.000 tokens',
      content: '▓░░░░░░░░░░░░░░░░░░░ 6%   — ✨ hueco recuperado, la conversación puede continuar',
      delay: 1400
    },
    {
      side: 'user', type: 'user-message',
      content: '¿En qué habíamos quedado sobre el índice de products.tags?',
      delay: 1600
    },
    {
      side: 'user', type: 'typing',
      delay: 300
    },
    {
      side: 'tech', type: 'thinking', label: 'Razonamiento',
      content: 'No tengo la conversación original, pero el resumen menciona: "índice GIN sobre products.tags". Con eso puedo responder manteniendo la continuidad.',
      delay: 1800
    },
    {
      side: 'tech', type: 'output', label: 'Respuesta',
      content: 'Quedamos en usar un índice GIN sobre products.tags, pensando en búsquedas por etiquetas múltiples. ¿Lo implementamos ahora o antes definimos la política de retención que teníamos pendiente?',
      delay: 1200
    },
    {
      side: 'user', type: 'assistant-message',
      content: 'Quedamos en usar un índice GIN sobre products.tags, pensando en búsquedas por etiquetas múltiples. ¿Lo implementamos ahora o antes definimos la política de retención que teníamos pendiente?',
      delay: 200
    },
    {
      side: 'tech', type: 'info', label: 'Tradeoff de la compactación',
      content: '⚖️  Ganas espacio pero pierdes detalle. Si el resumen omite algo (un matiz, un código exacto, una decisión pequeña), la IA lo habrá "olvidado". Por eso un buen resumen es crítico — y por eso a veces conviene empezar una conversación nueva en lugar de compactar.\n\n💡 Observa el contador de tokens: compactar cuesta (hay que generar el resumen), pero a cambio evitas reenviar cientos de miles de tokens de input en cada mensaje futuro.',
      delay: 2000
    }
  ],

  rag: [
    {
      side: 'tech', type: 'info', label: '¿Qué es RAG?',
      tag: 'contexto previo',
      content: '📚 RAG = Retrieval-Augmented Generation. En vez de meter TODOS tus documentos en el prompt (caro e imposible si son miles), los troceas, los guardas en una base vectorial, y por cada pregunta recuperas solo los fragmentos relevantes. La IA responde usando esos fragmentos como evidencia.',
      delay: 300
    },
    {
      side: 'tech', type: 'info', label: 'Fase previa (indexado, se hace UNA vez)',
      content: '📥 Para preparar la base:\n  1. Coges los documentos (PDFs, wikis, tickets...).\n  2. Los partes en "chunks" de ~500 tokens con solape.\n  3. Cada chunk se convierte en un VECTOR (embedding) — un array de 1536 números que captura su significado.\n  4. Se guardan todos en una base vectorial (Pinecone, Qdrant, pgvector...).',
      delay: 2000
    },
    {
      side: 'tech', type: 'info', label: 'Estado de la base vectorial',
      tag: '847 documentos → 12.394 chunks indexados',
      content: '🗄️  Políticas RRHH, manuales de producto, contratos, actas...\n    Total: ~6.2 millones de tokens. Imposible meterlo todo en cada prompt.',
      delay: 1500
    },
    {
      side: 'tech', type: 'system', label: 'System prompt',
      inTokens: 58,
      content: 'Eres el asistente interno de Acme Corp. Responde SOLO usando los fragmentos de contexto que se te proporcionen. Si no hay información suficiente, dilo. Cita siempre la fuente (documento y sección).',
      delay: 800
    },
    {
      side: 'user', type: 'user-message',
      content: '¿Cuántos días de teletrabajo puedo pedir al mes según la política actual?',
      delay: 1300
    },
    {
      side: 'tech', type: 'input', label: 'Entrada del usuario',
      inTokens: 18,
      content: '"¿Cuántos días de teletrabajo puedo pedir al mes según la política actual?"',
      delay: 500
    },
    {
      side: 'user', type: 'typing',
      delay: 300
    },
    {
      side: 'tech', type: 'info', label: '🔍 Paso 1 — Embedear la pregunta',
      content: 'Antes de llamar a la IA generadora, el sistema convierte la pregunta del usuario en un vector con un modelo de embeddings (barato y rápido, distinto del LLM principal).',
      delay: 1400
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 embeddings.create',
      tag: 'modelo: text-embedding-3-small',
      content: '{\n  "model": "text-embedding-3-small",\n  "input": "¿Cuántos días de teletrabajo puedo pedir al mes según la política actual?"\n}',
      delay: 1200
    },
    {
      side: 'tech', type: 'tool-result', label: '✅ Vector de la pregunta',
      tag: '1536 dimensiones',
      content: '[0.0124, -0.0871, 0.0342, 0.1108, -0.0056, ..., 0.0231]\n                    (1536 números en total)',
      delay: 1100
    },
    {
      side: 'tech', type: 'info', label: '🔍 Paso 2 — Búsqueda por similitud',
      content: 'Se compara el vector de la pregunta contra los 12.394 vectores guardados. Se devuelven los K más parecidos (coseno más alto). Esto NO usa la IA — es álgebra pura, instantánea.',
      delay: 1500
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 vectordb.query',
      content: '{\n  "collection": "acme_docs",\n  "vector": [0.0124, -0.0871, ...],\n  "top_k": 3,\n  "min_score": 0.75\n}',
      delay: 1200
    },
    {
      side: 'tech', type: 'tool-result', label: '✅ Top-3 chunks recuperados',
      tag: 'ordenados por relevancia',
      content: '[\n  {\n    "score": 0.89,\n    "source": "politica-teletrabajo-2025.pdf",\n    "section": "§3.2 Días flexibles",\n    "text": "Todos los empleados a jornada completa pueden solicitar hasta 8 días de teletrabajo al mes, distribuidos a su elección, comunicándolos al manager con 48h de antelación."\n  },\n  {\n    "score": 0.82,\n    "source": "faq-rrhh.md",\n    "section": "Teletrabajo",\n    "text": "El tope mensual es de 8 días. Excepciones (mudanzas, cuidado familiar) se tramitan por RRHH."\n  },\n  {\n    "score": 0.78,\n    "source": "convenio-colectivo-2024.pdf",\n    "section": "Anexo III",\n    "text": "La empresa facilitará el trabajo remoto siempre que el puesto lo permita, respetando la política interna vigente."\n  }\n]',
      delay: 1800
    },
    {
      side: 'tech', type: 'info', label: '🧩 Paso 3 — Construir el prompt aumentado',
      content: 'Los chunks se pegan al prompt como "contexto" JUNTO con la pregunta. Ahora la IA tiene evidencia específica que antes no tenía en su entrenamiento.',
      delay: 1400
    },
    {
      side: 'tech', type: 'input', label: 'Prompt final enviado al LLM',
      tag: 'system + chunks + pregunta',
      inTokens: 312,
      content: '[system prompt: 58 tokens]\n\n[CONTEXTO RECUPERADO]\n--- Fragmento 1 (politica-teletrabajo-2025.pdf §3.2) ---\nTodos los empleados a jornada completa pueden solicitar hasta 8 días de teletrabajo al mes...\n\n--- Fragmento 2 (faq-rrhh.md) ---\nEl tope mensual es de 8 días. Excepciones...\n\n--- Fragmento 3 (convenio-colectivo-2024.pdf Anexo III) ---\n...\n\n[PREGUNTA DEL USUARIO]\n¿Cuántos días de teletrabajo puedo pedir al mes según la política actual?',
      delay: 1600
    },
    {
      side: 'tech', type: 'thinking', label: 'Razonamiento',
      outTokens: 58,
      content: 'Los tres fragmentos coinciden en 8 días/mes. El fragmento 1 es el más específico y autoritativo. Voy a responder con la cifra, la condición (48h de antelación), y citar la fuente.',
      delay: 1800
    },
    {
      side: 'tech', type: 'output', label: 'Respuesta generada',
      outTokens: 52,
      content: 'Puedes solicitar hasta 8 días de teletrabajo al mes, distribuidos a tu elección, comunicándoselo a tu manager con al menos 48 horas de antelación.\n\nFuente: Política de Teletrabajo 2025, §3.2.',
      delay: 1200
    },
    {
      side: 'user', type: 'assistant-message',
      content: 'Puedes solicitar hasta 8 días de teletrabajo al mes, distribuidos a tu elección, comunicándoselo a tu manager con al menos 48 horas de antelación.\n\nFuente: Política de Teletrabajo 2025, §3.2.',
      delay: 200
    },
    {
      side: 'tech', type: 'info', label: 'Por qué RAG > meter todo en el prompt',
      content: '💡 Alternativas descartadas:\n  ❌ Meter los 6.2M tokens de docs → no cabe, no lo permite ningún modelo.\n  ❌ Entrenar/fine-tunear un modelo con tus docs → caro, lento, y cada vez que cambias un doc hay que re-entrenar.\n  ✅ RAG → baratísimo, actualizable al instante (cambias un PDF y listo), y la IA cita fuentes verificables.',
      delay: 2000
    },
    {
      side: 'tech', type: 'info', label: '⚠️  Límites de RAG',
      content: '🎯 Si la búsqueda recupera chunks malos, la IA responde mal. La calidad depende de:\n  • Cómo trocees los documentos (chunking).\n  • El modelo de embeddings que uses.\n  • Cuántos chunks devuelvas (top_k) y su umbral.\n  • Que la pregunta tenga vocabulario parecido al de los documentos.',
      delay: 2000
    }
  ]
};
