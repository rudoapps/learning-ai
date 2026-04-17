const QUIZZES = {
  llm: [
    { q: '¿Qué hace un LLM en cada paso?', opts: ['Busca en una base de datos','Predice el siguiente token más probable','Ejecuta código'], ans: 1 },
    { q: '¿Un LLM puede acceder a internet por sí solo?', opts: ['Sí, siempre','Solo si tiene tools conectadas','Nunca, necesita herramientas externas'], ans: 2 },
    { q: '¿Por qué un LLM puede inventar datos falsos?', opts: ['Porque miente a propósito','Porque predice texto probable sin verificar fuentes','Porque su base de datos está corrupta'], ans: 1 },
  ],
  tokens: [
    { q: '¿Qué es un token?', opts: ['Una palabra completa','Un fragmento de ~3-4 caracteres','Una letra'], ans: 1 },
    { q: '¿Qué tipo de tokens cuesta más?', opts: ['Input (lo que envías)','Output (lo que genera)','Cuestan igual'], ans: 1 },
    { q: '¿Por qué las conversaciones largas cuestan más?', opts: ['El modelo se cansa','El historial entero se reenvía como input en cada turno','Los servidores cobran por tiempo'], ans: 1 },
  ],
  prompt: [
    { q: '¿Cuáles son los 4 ingredientes de un buen prompt?', opts: ['Largo, detallado, formal, complejo','Rol, contexto, formato, restricciones','Pregunta, respuesta, ejemplo, repetición'], ans: 1 },
    { q: '¿Qué es few-shot prompting?', opts: ['Usar pocas palabras','Dar 2-3 ejemplos antes de la pregunta real','Limitar la respuesta a pocas líneas'], ans: 1 },
  ],
  system_prompt: [
    { q: '¿Cuándo se envía el system prompt?', opts: ['Solo en el primer turno','En cada turno de la conversación','Solo cuando el usuario lo pide'], ans: 1 },
    { q: '¿El system prompt es secreto para el usuario?', opts: ['Sí, es imposible de extraer','No, con técnicas de prompt extraction se puede revelar','Solo en modelos de pago'], ans: 1 },
  ],
  temperature: [
    { q: '¿Qué hace la temperatura?', opts: ['Controla la velocidad de respuesta','Controla la aleatoriedad al elegir cada token','Controla el tamaño de la respuesta'], ans: 1 },
    { q: '¿Qué temperatura usarías para extraer JSON?', opts: ['T=0 (determinista)','T=0.7 (equilibrado)','T=1.5 (creativo)'], ans: 0 },
    { q: '¿Bajar la temperatura hace al modelo más inteligente?', opts: ['Sí','No, solo más predecible','Solo para matemáticas'], ans: 1 },
  ],
  streaming: [
    { q: '¿El streaming reduce el coste total?', opts: ['Sí, gasta menos tokens','No, el coste es el mismo','Depende del modelo'], ans: 1 },
    { q: '¿Qué es TTFT?', opts: ['Total Tokens For Text','Time To First Token','Token Transfer Format Type'], ans: 1 },
  ],
  context_window: [
    { q: '¿Qué pasa si superas la ventana de contexto?', opts: ['El modelo responde más lento','La API da error','El modelo ignora lo del principio'], ans: 1 },
    { q: '¿El contexto se mantiene entre conversaciones?', opts: ['Sí, siempre','No, se limpia al cerrar la conversación','Solo con modelos premium'], ans: 1 },
  ],
  cot: [
    { q: '¿Cuándo mejora más el Chain of Thought?', opts: ['Preguntas factuales simples','Problemas de razonamiento multi-paso','Clasificación de texto'], ans: 1 },
    { q: '¿El razonamiento de CoT cuesta tokens?', opts: ['No, es gratis','Sí, son tokens de output (los más caros)','Solo en extended thinking'], ans: 1 },
  ],
  multimodal: [
    { q: '¿Cómo "ve" un LLM una imagen?', opts: ['La describe con texto primero','La convierte en tokens visuales (parches)','No puede ver imágenes'], ans: 1 },
    { q: '¿Cuántos tokens ocupa una imagen típica?', opts: ['1-5 tokens','100-1500 tokens','10.000+ tokens'], ans: 1 },
  ],
  tools: [
    { q: '¿Quién ejecuta realmente una herramienta?', opts: ['El LLM','Tu backend/sistema','El proveedor de la API'], ans: 1 },
    { q: '¿Por qué no conviene conectar 50 tools?', opts: ['Es ilegal','Las definiciones consumen tokens y confunden al modelo','Las APIs se sobrecargan'], ans: 1 },
  ],
  function_calling: [
    { q: '¿Qué produce el modelo en function calling?', opts: ['Texto libre con los datos','JSON válido según un schema','Una URL con los resultados'], ans: 1 },
    { q: '¿Qué temperatura se recomienda para function calling?', opts: ['T=0 o muy baja','T=0.7 (estándar)','T=1.5 (creativa)'], ans: 0 },
  ],
  skills: [
    { q: '¿Qué diferencia un skill de una tool?', opts: ['El skill es más rápido','El skill combina prompt + varias tools para un objetivo','El skill es más barato'], ans: 1 },
    { q: '¿Cuándo usar un skill en lugar de un agente?', opts: ['Cuando la tarea es predecible y repetible','Cuando la tarea es impredecible','Siempre'], ans: 0 },
  ],
  embeddings: [
    { q: '¿Qué representa un embedding?', opts: ['La posición de un archivo en disco','El significado de un texto como vector numérico','El hash criptográfico de un documento'], ans: 1 },
    { q: '¿Qué encuentra una búsqueda por embeddings que Ctrl+F no?', opts: ['Archivos ocultos','Sinónimos y conceptos relacionados','Errores de ortografía'], ans: 1 },
  ],
  vector_db: [
    { q: '¿Para qué está optimizada una base vectorial?', opts: ['Transacciones ACID','Encontrar los K vectores más parecidos a uno dado','Almacenar imágenes'], ans: 1 },
    { q: '¿pgvector es buena opción si ya uso PostgreSQL?', opts: ['No, necesitas una BBDD especializada','Sí, es una extensión que añade soporte vectorial','Solo para prototipos'], ans: 1 },
  ],
  rag: [
    { q: '¿Qué parte de RAG NO usa el LLM?', opts: ['La generación de la respuesta','La búsqueda por similitud en la base vectorial','El resumen de los chunks'], ans: 1 },
    { q: '¿Qué pasa si el retrieval recupera chunks malos?', opts: ['El LLM los ignora','La respuesta será mala aunque el LLM sea bueno','Se auto-corrige'], ans: 1 },
  ],
  memory: [
    { q: '¿Qué es la "memoria" de ChatGPT en realidad?', opts: ['Un cerebro digital que recuerda todo','Hechos guardados en BBDD que se pegan al system prompt','Acceso al historial de todas tus conversaciones'], ans: 1 },
    { q: '¿Más memoria siempre es mejor?', opts: ['Sí','No, los hechos obsoletos ensucian el prompt y cuestan tokens','Da igual, es gratis'], ans: 1 },
  ],
  compaction: [
    { q: '¿Qué se pierde al compactar?', opts: ['Nada, es lossless','Detalle: debates, ejemplos intermedios, reformulaciones','Las decisiones tomadas'], ans: 1 },
    { q: '¿La compactación ahorra dinero?', opts: ['No, cuesta lo mismo','Sí: genera un resumen (coste puntual) pero ahorra miles de tokens de input en cada turno futuro','Solo en conversaciones cortas'], ans: 1 },
  ],
  fine_tuning: [
    { q: '¿Para qué es mejor el fine-tuning?', opts: ['Enseñar hechos nuevos al modelo','Enseñar un tono, estilo o formato consistente','Conectar con APIs externas'], ans: 1 },
    { q: '¿Qué pasa si cambias un dato en tus documentos y usaste fine-tuning?', opts: ['Se actualiza automáticamente','Hay que re-entrenar el modelo','Se corrige con un prompt'], ans: 1 },
  ],
  agent: [
    { q: '¿Qué diferencia a un agente de un chat normal?', opts: ['Tiene más memoria','Tiene un bucle autónomo: piensa → actúa → observa → repite','Usa modelos más grandes'], ans: 1 },
    { q: '¿Cuál es el mayor riesgo de un agente?', opts: ['Es más lento','Puede entrar en bucles infinitos o tomar acciones irreversibles sin supervisión','Cuesta menos que un chat'], ans: 1 },
  ],
  orchestrator: [
    { q: '¿Cuándo necesitas un orquestador?', opts: ['Siempre que uses IA','Cuando hay partes independientes paralelizables o que necesitan especialización','Solo en empresas grandes'], ans: 1 },
    { q: '¿El orquestador ve los pasos intermedios de los subagentes?', opts: ['Sí, todo','No, solo sus informes finales','Depende de la configuración'], ans: 1 },
  ],
  subagents: [
    { q: '¿Cuál es la ventaja principal del contexto aislado?', opts: ['Es más seguro','Cada subagente trabaja limpio, sin ruido de las otras tareas','Es obligatorio por ley'], ans: 1 },
    { q: '¿Lanzar 3 subagentes cuesta más o menos que 1 agente?', opts: ['Menos','Más: cada uno es una llamada completa al LLM','Igual'], ans: 1 },
  ],
  mcp: [
    { q: '¿Qué problema resuelve MCP?', opts: ['Hace los modelos más inteligentes','Estandariza cómo conectar tools y datos a cualquier LLM','Reduce el coste de las APIs'], ans: 1 },
    { q: '¿Las definiciones de tools MCP cuestan tokens?', opts: ['No, son gratis','Sí, se inyectan como input en cada turno','Solo la primera vez'], ans: 1 },
  ],
  hallucination: [
    { q: '¿Por qué alucina un LLM?', opts: ['Porque miente a propósito','Porque predice texto estadísticamente probable sin verificar fuentes','Porque está mal entrenado'], ans: 1 },
    { q: '¿Se pueden eliminar completamente las alucinaciones?', opts: ['Sí, con RAG','Sí, con temperatura 0','No, solo mitigar — son inherentes al mecanismo de predicción'], ans: 2 },
  ],
  guardrails: [
    { q: '¿Dónde actúan los guardrails?', opts: ['Solo antes del modelo','Solo después del modelo','Antes (input) Y después (output)'], ans: 2 },
    { q: '¿Si el filtro PRE bloquea un input, se llama al LLM?', opts: ['Sí, pero con restricciones','No, se ahorra la llamada y se responde directamente','Depende del modelo'], ans: 1 },
  ],
  prompt_injection: [
    { q: '¿Por qué funciona el prompt injection?', opts: ['Los modelos tienen bugs de seguridad','Para el modelo todo es texto: no distingue instrucciones de datos','Los atacantes tienen acceso al servidor'], ans: 1 },
    { q: '¿Existe una defensa perfecta contra prompt injection?', opts: ['Sí, RLHF lo soluciona','Sí, basta con filtrar "ignora instrucciones"','No, es una carrera armamentística continua'], ans: 2 },
  ],
  alignment: [
    { q: '¿Qué es RLHF?', opts: ['Un tipo de base de datos','Entrenamiento con feedback humano para alinear el modelo con valores','Un lenguaje de programación para IA'], ans: 1 },
    { q: '¿Un modelo alineado puede equivocarse?', opts: ['No, el alineamiento lo hace perfecto','Sí, puede ser sobre-cauteloso o tener sesgos de los evaluadores','Solo si está desactualizado'], ans: 1 },
  ],
};
