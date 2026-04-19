// Cada scenario: { knowledgeBase: [...], steps: [...] }
const SCENARIOS = {
  basic: {
    knowledgeBase: [
      { id: 'k1', title: 'vacaciones.pdf #3', text: 'Los empleados a tiempo completo tienen derecho a 22 días hábiles de vacaciones anuales, disfrutables entre enero y diciembre del mismo año.' },
      { id: 'k2', title: 'vacaciones.pdf #4', text: 'Las vacaciones deben solicitarse con al menos 15 días de antelación al responsable directo mediante la herramienta interna HR-Flow.' },
      { id: 'k3', title: 'remoto.pdf #1', text: 'Los empleados pueden trabajar desde casa hasta 2 días por semana, previa aprobación del manager.' },
      { id: 'k4', title: 'beneficios.pdf #2', text: 'La empresa ofrece seguro médico privado para empleados y familiares directos sin coste adicional.' },
      { id: 'k5', title: 'onboarding.pdf #1', text: 'El proceso de incorporación dura 2 semanas e incluye formación en las herramientas internas de desarrollo.' },
      { id: 'k6', title: 'salarios.pdf #2', text: 'Las revisiones salariales se realizan anualmente durante el mes de enero, tras la evaluación de desempeño.' },
    ],
    steps: [
      {
        side: 'tech', type: 'info', label: '¿Qué es RAG?', tag: 'empieza por aquí',
        content: '📚 RAG = Retrieval Augmented Generation. El modelo por sí solo NO sabe de tu empresa, tu código, tus documentos. RAG es una receta para "enseñárselos" en el momento de la pregunta:\n\n  1. Buscar los trozos relevantes en tu base de datos.\n  2. Meterlos dentro del prompt junto con la pregunta.\n  3. Dejar que el modelo responda SOBRE esos trozos.\n\nArriba ves tu "base de conocimiento" — 6 chunks de docs internos ya indexados como vectores.',
        delay: 300
      },
      {
        side: 'tech', type: 'system', label: 'System prompt', inTokens: 42,
        content: 'Eres un asistente de RRHH. Responde SOLO con la información que aparece en los fragmentos proporcionados. Si la respuesta no está, dilo claramente. Cita las fuentes usadas.',
        delay: 900
      },
      {
        side: 'chat', type: 'user-message',
        content: '¿Cuántos días de vacaciones me corresponden al año?',
        delay: 1300
      },
      {
        side: 'tech', type: 'input', label: 'Pregunta del usuario', inTokens: 12,
        content: '"¿Cuántos días de vacaciones me corresponden al año?"',
        delay: 500
      },
      {
        side: 'tech', type: 'retrieval', label: '🧮 Paso 1 — Embed la pregunta',
        tag: 'modelo de embeddings (≠ LLM)',
        content: 'La pregunta se convierte en un vector de ~1500 números (un "embedding"). Dos textos con significado parecido salen con vectores cercanos. El modelo de embeddings es pequeño y barato (≠ el LLM que responderá luego).',
        delay: 1400
      },
      {
        side: 'vdb', type: 'embed-query',
        vector: '[0.13, -0.42, 0.81, 0.22, -0.07, ..., 0.54]  (1536 dim)',
        delay: 900
      },
      {
        side: 'tech', type: 'retrieval', label: '📏 Paso 2 — Comparar con cada chunk',
        tag: 'similitud coseno',
        content: 'Calculamos el ángulo entre el vector de la pregunta y el vector de CADA chunk. Cuanto menor el ángulo, mayor la similitud. Resultado: un score entre 0 (nada que ver) y 1 (idéntico).\n\nMira arriba → cada chunk muestra su score.',
        delay: 1800
      },
      {
        side: 'vdb', type: 'score',
        scores: { k1: 0.91, k2: 0.68, k3: 0.18, k4: 0.11, k5: 0.09, k6: 0.22 },
        delay: 1000
      },
      {
        side: 'tech', type: 'retrieval', label: '🎯 Paso 3 — Seleccionar top-K',
        tag: 'K = 2',
        content: 'Nos quedamos con los 2 chunks de mayor score (k1 = 0.91, k2 = 0.68). Los demás se descartan aunque tengan algo que ver — si metemos más, el input se infla y el modelo puede perder foco.',
        delay: 1800
      },
      {
        side: 'vdb', type: 'select', topk: ['k1', 'k2'],
        delay: 900
      },
      {
        side: 'tech', type: 'retrieval', label: '📝 Paso 4 — Augment: meter los chunks en el prompt',
        content: 'Construimos un prompt nuevo así:\n\n  SYSTEM: Eres un asistente de RRHH...\n  CONTEXTO:\n    [k1] Los empleados a tiempo completo tienen derecho a 22 días hábiles...\n    [k2] Las vacaciones deben solicitarse con al menos 15 días de antelación...\n  USUARIO: ¿Cuántos días de vacaciones me corresponden al año?',
        delay: 2000
      },
      {
        side: 'tech', type: 'input', label: 'Prompt final enviado al LLM',
        tag: '⚠️ input mucho más grande que la pregunta',
        inTokens: 95,
        content: '[system (42t)] + [contexto 2 chunks (41t)] + [pregunta (12t)] = 95 tokens.\n\nLa pregunta ORIGINAL era 12 tokens. Con RAG: 95. Factor ×8. Por eso top-K importa.',
        delay: 1500
      },
      {
        side: 'tech', type: 'thinking', label: 'El LLM razona sobre el contexto', outTokens: 20,
        content: 'El contexto dice "22 días hábiles". Lo cito textualmente y añado cómo solicitar.',
        delay: 1400
      },
      {
        side: 'tech', type: 'output', label: 'Respuesta generada', outTokens: 48,
        content: 'Te corresponden 22 días hábiles de vacaciones al año...',
        delay: 800
      },
      {
        side: 'chat', type: 'assistant-message',
        content: 'Te corresponden 22 días hábiles de vacaciones al año, disfrutables entre enero y diciembre. Recuerda solicitarlas con al menos 15 días de antelación a tu responsable, usando HR-Flow.',
        sources: ['k1', 'k2'],
        delay: 200
      },
      {
        side: 'tech', type: 'info', label: '🔑 El truco de RAG',
        content: 'El LLM NO sabe de tu empresa. Solo lee la pregunta + los chunks que le das. Si el retriever acierta los chunks, la respuesta es correcta. Si falla, el LLM responde mal — aunque el modelo sea el mejor del mundo.\n\nEn otras palabras: en RAG, el cuello de botella NO es el LLM, es la búsqueda.',
        delay: 2200
      }
    ]
  },

  nomatch: {
    knowledgeBase: [
      { id: 'k1', title: 'vacaciones.pdf #3', text: 'Los empleados a tiempo completo tienen derecho a 22 días hábiles de vacaciones anuales.' },
      { id: 'k2', title: 'vacaciones.pdf #4', text: 'Las vacaciones deben solicitarse con 15 días de antelación al responsable directo.' },
      { id: 'k3', title: 'remoto.pdf #1', text: 'Los empleados pueden trabajar desde casa hasta 2 días por semana.' },
      { id: 'k4', title: 'beneficios.pdf #2', text: 'La empresa ofrece seguro médico privado para empleados y familiares.' },
      { id: 'k5', title: 'onboarding.pdf #1', text: 'El proceso de incorporación dura 2 semanas con formación en herramientas.' },
      { id: 'k6', title: 'salarios.pdf #2', text: 'Las revisiones salariales se realizan anualmente en enero.' },
    ],
    steps: [
      {
        side: 'tech', type: 'info', label: '🚨 Qué pasa si la pregunta NO está en los docs',
        content: 'La misma BBDD de antes. Pero ahora el usuario pregunta algo que no tiene nada que ver con RRHH. Verás el fallo silencioso clásico de RAG mal configurado: retrieva igualmente, aunque no tenga sentido.',
        delay: 300
      },
      {
        side: 'tech', type: 'system', label: 'System prompt', inTokens: 42,
        content: 'Eres un asistente de RRHH. Responde SOLO con la información de los fragmentos. Si no está, di que no lo sabes.',
        delay: 700
      },
      {
        side: 'chat', type: 'user-message',
        content: '¿Cuál es la capital de Australia?',
        delay: 1400
      },
      {
        side: 'tech', type: 'input', label: 'Pregunta', inTokens: 10,
        content: '"¿Cuál es la capital de Australia?"',
        delay: 500
      },
      {
        side: 'vdb', type: 'embed-query',
        vector: '[-0.22, 0.71, -0.38, 0.05, ..., -0.14]  (1536 dim)',
        delay: 900
      },
      {
        side: 'tech', type: 'retrieval', label: '📏 Scores bajos en TODO',
        content: 'La pregunta habla de geografía. Ningún chunk está cerca semánticamente. El mejor apenas llega a 0.21 → muy lejos del 0.91 del escenario anterior.',
        delay: 1400
      },
      {
        side: 'vdb', type: 'score',
        scores: { k1: 0.12, k2: 0.08, k3: 0.15, k4: 0.19, k5: 0.21, k6: 0.11 },
        delay: 900
      },
      {
        side: 'tech', type: 'info', label: '⚠️ Problema clásico',
        content: 'Un retriever básico devuelve SIEMPRE los top-K, aunque todos sean basura. Si pasamos esos chunks al LLM, pueden pasar dos cosas:\n\n  (a) El LLM se da cuenta y dice "no tengo info".\n  (b) El LLM alucina algo conectando retazos irrelevantes.\n\nEl (b) es el fallo peligroso de RAG — parece que funciona, pero miente.',
        delay: 2000
      },
      {
        side: 'vdb', type: 'select', topk: ['k5', 'k4'],
        delay: 800
      },
      {
        side: 'tech', type: 'retrieval', label: '🎯 Top-K devuelto (irrelevante)',
        content: 'El retriever no juzga calidad; solo ordena por score. Devuelve k5 (onboarding) y k4 (beneficios). Ninguno habla de Australia.',
        delay: 1400
      },
      {
        side: 'tech', type: 'input', label: 'Prompt augmentado (basura útil)', inTokens: 82,
        content: '[system] + [contexto: onboarding + beneficios] + [pregunta sobre Australia]',
        delay: 1000
      },
      {
        side: 'tech', type: 'thinking', label: 'El LLM razona', outTokens: 28,
        content: 'El usuario pregunta por Australia. El contexto habla de onboarding y beneficios. No hay relación. El system prompt me pide decir "no lo sé" → obedezco.',
        delay: 1800
      },
      {
        side: 'tech', type: 'output', label: 'Respuesta', outTokens: 24,
        content: 'No encuentro información sobre eso en los documentos de RRHH.',
        delay: 700
      },
      {
        side: 'chat', type: 'assistant-message',
        content: 'No encuentro información sobre eso en los documentos disponibles. Esta base de conocimiento solo cubre temas de RRHH (vacaciones, remoto, beneficios, salarios).',
        variant: 'no-info',
        delay: 200
      },
      {
        side: 'tech', type: 'info', label: '🛡 Técnica de defensa: umbral mínimo',
        content: 'Una mejora habitual: "si el mejor score es < 0.4, devuelve CERO chunks y dile al LLM que no hay info". Así evitamos meter basura y forzamos al modelo a admitir que no sabe.\n\nOtra defensa más avanzada: un paso "guardrail" que clasifique si la pregunta está en dominio antes de buscar.',
        delay: 2400
      },
      {
        side: 'tech', type: 'info', label: '🔑 La lección',
        content: 'RAG es tan bueno como tu retriever. Y el retriever siempre te va a devolver ALGO — tu trabajo es decidir si ese algo merece la pena. Score bajo = info no disponible, no "la más cercana".',
        delay: 2200
      }
    ]
  },

  chunking: {
    knowledgeBase: [
      { id: 'k1', title: 'vacaciones.pdf #3.1', text: 'Los empleados a tiempo completo tienen derecho a' },
      { id: 'k2', title: 'vacaciones.pdf #3.2', text: '22 días hábiles de vacaciones anuales, disfrutables entre enero y' },
      { id: 'k3', title: 'vacaciones.pdf #3.3', text: 'diciembre del mismo año. Las vacaciones deben solicitarse con' },
      { id: 'k4', title: 'vacaciones.pdf #3.4', text: '15 días de antelación al responsable directo mediante HR-Flow.' },
      { id: 'k5', title: 'remoto.pdf', text: 'Los empleados pueden trabajar desde casa hasta 2 días por semana.' },
      { id: 'k6', title: 'salarios.pdf', text: 'Las revisiones salariales se realizan anualmente en enero.' },
    ],
    steps: [
      {
        side: 'tech', type: 'info', label: '✂️ El problema del chunking',
        tag: 'por qué importa cómo cortas los docs',
        content: 'Antes de meter un documento en RAG, hay que partirlo en trozos ("chunks"). El tamaño y el lugar de corte afectan MUCHO la calidad de las respuestas.\n\nArriba ves el mismo documento de vacaciones, pero mal chunkeado: cada frase está partida a la mitad.',
        delay: 300
      },
      {
        side: 'tech', type: 'system', label: 'System prompt', inTokens: 42,
        content: '[idéntico al escenario básico]',
        delay: 700
      },
      {
        side: 'chat', type: 'user-message',
        content: '¿Cuántos días de vacaciones me corresponden?',
        delay: 1300
      },
      {
        side: 'tech', type: 'input', label: 'Pregunta', inTokens: 10, content: '"¿Cuántos días de vacaciones me corresponden?"', delay: 500
      },
      {
        side: 'vdb', type: 'embed-query',
        vector: '[0.13, -0.42, 0.81, ..., 0.54]',
        delay: 800
      },
      {
        side: 'tech', type: 'retrieval', label: '📏 Comparar con cada chunk',
        content: 'La pregunta habla de "días" + "vacaciones". Los chunks están partidos: k1 tiene "vacaciones" pero no "días"; k2 tiene "22 días" pero sin decir "a qué tiene derecho quién"; etc.',
        delay: 1800
      },
      {
        side: 'vdb', type: 'score',
        scores: { k1: 0.72, k2: 0.61, k3: 0.45, k4: 0.38, k5: 0.19, k6: 0.21 },
        delay: 900
      },
      {
        side: 'tech', type: 'info', label: '⚠️ Scores decentes, pero fragmentados',
        content: 'k1 y k2 parecen buenos. Pero k1 se queda a mitad de frase ("tienen derecho a") y k2 empieza sin contexto ("22 días hábiles..."). Ninguno tiene la frase COMPLETA.',
        delay: 2000
      },
      {
        side: 'vdb', type: 'select', topk: ['k1', 'k2'],
        delay: 800
      },
      {
        side: 'tech', type: 'retrieval', label: '📝 Prompt augmentado', inTokens: 75,
        content: 'CONTEXTO:\n  [k1] "Los empleados a tiempo completo tienen derecho a"\n  [k2] "22 días hábiles de vacaciones anuales, disfrutables entre enero y"',
        delay: 1500
      },
      {
        side: 'tech', type: 'thinking', label: 'El LLM intenta componer la respuesta', outTokens: 45,
        content: 'Los dos chunks encajan como puzzle: "tienen derecho a" + "22 días hábiles". Puedo inferir la respuesta, pero falta el final (el chunk se corta en "enero y"). Respondo con lo que tengo.',
        delay: 1800
      },
      {
        side: 'tech', type: 'output', label: 'Respuesta', outTokens: 38,
        content: 'Los empleados a tiempo completo tienen derecho a 22 días hábiles de vacaciones anuales...',
        delay: 800
      },
      {
        side: 'chat', type: 'assistant-message',
        content: 'Los empleados a tiempo completo tienen derecho a 22 días hábiles de vacaciones anuales, disfrutables entre enero y... (el texto se corta en mi contexto).',
        sources: ['k1', 'k2'],
        delay: 200
      },
      {
        side: 'tech', type: 'info', label: '🔧 Cómo se arregla',
        content: 'Tres estrategias habituales:\n\n  1. CHUNKS más grandes (500-1000 tokens en lugar de 50).\n  2. OVERLAP — cada chunk repite ~15% del anterior, para no cortar frases críticas.\n  3. CHUNKING SEMÁNTICO — cortar en límites de párrafo o cambio de tema, no por tamaño.\n\nEn la práctica: chunks de ~512 tokens con 50 tokens de overlap es una buena base para empezar.',
        delay: 2800
      },
      {
        side: 'tech', type: 'info', label: '🔑 Lección',
        content: 'El 80% de los problemas de calidad en RAG vienen de chunking y calidad de datos, NO del LLM. Antes de cambiar de modelo, revisa cómo estás troceando los docs.',
        delay: 2400
      }
    ]
  },

  rerank: {
    knowledgeBase: [
      { id: 'k1', title: 'soporte/faq-pagos.md', text: 'Los pagos con tarjeta pueden fallar si el banco bloquea la transacción por seguridad.' },
      { id: 'k2', title: 'soporte/reembolsos.md', text: 'Los reembolsos se procesan en 5-7 días hábiles tras la aprobación del soporte.' },
      { id: 'k3', title: 'legal/terminos.md', text: 'El usuario acepta los términos al realizar cualquier compra en la plataforma.' },
      { id: 'k4', title: 'soporte/errores-comunes.md', text: 'Si ves el código E-402 en el pago, significa fondos insuficientes en la cuenta origen.' },
      { id: 'k5', title: 'soporte/tarjetas.md', text: 'Aceptamos Visa, Mastercard y American Express. No aceptamos Diners.' },
      { id: 'k6', title: 'tech/api-errores.md', text: 'El endpoint /payments devuelve HTTP 402 cuando el procesador rechaza el cargo.' },
      { id: 'k7', title: 'soporte/seguridad.md', text: 'Usamos 3D Secure en transacciones > 30€ para cumplir con PSD2 en Europa.' },
      { id: 'k8', title: 'soporte/contacto.md', text: 'Para incidencias urgentes, contacta con soporte@empresa.com o al chat en vivo.' },
      { id: 'k9', title: 'legal/privacidad.md', text: 'No almacenamos el número completo de la tarjeta; solo los últimos 4 dígitos.' },
      { id: 'k10', title: 'soporte/moneda.md', text: 'Los precios se muestran en EUR por defecto; la conversión depende del banco del cliente.' },
    ],
    steps: [
      {
        side: 'tech', type: 'info', label: '🚀 Re-ranking en 2 etapas',
        tag: 'cómo lo hacen los sistemas buenos',
        content: 'Una búsqueda vectorial sola es rápida pero imprecisa. La BBDD tiene miles de chunks y necesitas que el score sea eficiente → se simplifica demasiado.\n\nLa solución: 2 etapas.\n\n  1) Vector search RÁPIDO → top-20 candidatos (red de arrastre).\n  2) Reranker LENTO pero preciso → top-3 finales (filtro fino).\n\nEste patrón mejora la calidad sin volverte loco de coste.',
        delay: 300
      },
      {
        side: 'tech', type: 'system', label: 'System prompt', inTokens: 36,
        content: 'Eres un asistente de soporte. Responde con la info de los fragmentos. Cita fuentes.',
        delay: 700
      },
      {
        side: 'chat', type: 'user-message',
        content: 'Mi cliente ve error 402 al pagar con tarjeta. ¿Qué significa?',
        delay: 1400
      },
      {
        side: 'tech', type: 'input', label: 'Pregunta', inTokens: 18,
        content: '"Mi cliente ve error 402 al pagar con tarjeta. ¿Qué significa?"',
        delay: 500
      },
      {
        side: 'vdb', type: 'embed-query',
        vector: '[0.31, -0.08, 0.44, ..., -0.19]',
        delay: 900
      },
      {
        side: 'tech', type: 'retrieval', label: 'ETAPA 1 — Vector search (top-5)',
        tag: 'rápido, aproximado',
        content: 'Pedimos top-5 a la BBDD vectorial (en la práctica serían top-20-50). Es un "bi-encoder": embed pregunta y chunks por separado, comparo una vez. Milisegundos, barato, pero no distingue bien entre chunks parecidos.',
        delay: 2000
      },
      {
        side: 'vdb', type: 'score',
        scores: { k1: 0.62, k2: 0.41, k3: 0.12, k4: 0.71, k5: 0.38, k6: 0.68, k7: 0.44, k8: 0.22, k9: 0.19, k10: 0.15 },
        delay: 1000
      },
      {
        side: 'vdb', type: 'select', topk: ['k4', 'k6', 'k1', 'k7', 'k2'],
        delay: 800
      },
      {
        side: 'tech', type: 'info', label: '🤔 Fíjate',
        content: 'El top-5 incluye k4 (código E-402) y k6 (HTTP 402 de la API) — ambos relevantes. Pero también incluye k1 (pagos fallan) y k7 (3D Secure) que son tangenciales, y deja fuera ninguno catastrófico. Buen recall, precisión mejorable.',
        delay: 2200
      },
      {
        side: 'tech', type: 'retrieval', label: 'ETAPA 2 — Reranker (top-3 final)',
        tag: 'lento, muy preciso',
        content: 'Enviamos los 5 candidatos a un "cross-encoder": un modelo que mira pregunta + chunk JUNTOS y asigna un score mucho más preciso. Es 10-100× más lento por par, pero solo lo corremos sobre 5 pares (no sobre toda la BBDD).',
        delay: 2400
      },
      {
        side: 'vdb', type: 'rerank',
        topk: ['k4', 'k6', 'k1'],
        scores: { k4: 0.95, k6: 0.88, k1: 0.52 },
        delay: 1400
      },
      {
        side: 'tech', type: 'info', label: '✨ Qué cambió',
        content: 'El reranker separa mejor relevante de tangencial:\n\n  k4 (E-402 = fondos insuficientes) → 0.95 (crucial)\n  k6 (endpoint /payments 402)      → 0.88 (contexto técnico)\n  k1 (pagos fallan por banco)      → 0.52 (relacionado pero no exacto)\n\nk7 y k2 que estaban en top-5 se descartan.',
        delay: 2400
      },
      {
        side: 'tech', type: 'input', label: 'Prompt final', inTokens: 120,
        content: '[system] + [3 chunks rerankeados] + [pregunta]',
        delay: 900
      },
      {
        side: 'tech', type: 'thinking', label: 'El LLM responde', outTokens: 55,
        content: 'Tengo dos chunks exactos sobre error 402: uno dice que es fondos insuficientes (k4), el otro da contexto API (k6). Compongo respuesta útil.',
        delay: 1400
      },
      {
        side: 'tech', type: 'output', label: 'Respuesta', outTokens: 72,
        content: 'El error 402 significa "fondos insuficientes"...',
        delay: 800
      },
      {
        side: 'chat', type: 'assistant-message',
        content: 'El error 402 significa fondos insuficientes en la cuenta del cliente: el procesador de pagos rechazó el cargo. Pídele que revise el saldo o use otra tarjeta. Si persiste, probablemente sea un bloqueo del banco.',
        sources: ['k4', 'k6', 'k1'],
        delay: 200
      },
      {
        side: 'tech', type: 'info', label: '⚖️ Trade-offs',
        content: 'Pros del rerank:\n  • Calidad notablemente mejor (sobre todo con queries cortas o ambiguas).\n  • El reranker no necesita reindexar la BBDD.\n\nContras:\n  • +100-300ms de latencia por pregunta.\n  • Otra dependencia (modelo reranker adicional).\n  • Coste extra (aunque pequeño: bge-reranker o Cohere son baratos).\n\nRegla práctica: si tu RAG funciona "ok pero no genial", prueba antes rerank que cambiar de LLM.',
        delay: 2600
      },
      {
        side: 'tech', type: 'info', label: '🔑 Lección',
        content: 'El patrón "red amplia → filtro fino" aparece en muchos sitios de IA: búsqueda web (BM25 → rerank), recomendadores (candidate generation → ranking), etc. RAG no es distinto.',
        delay: 2200
      }
    ]
  }
};
