// Cada step: { side: 'term'|'tech', type, ..., delay }
const SCENARIOS = {
  list: [
    {
      side: 'tech', type: 'info', label: 'Una CLI de IA es esto',
      tag: 'empieza por aquí',
      content: '🧠 Es el MISMO LLM del demo de chat (la misma red neuronal que predice tokens). Pero el desarrollador le ha dado HERRAMIENTAS para leer tu disco, ejecutar comandos y editar archivos.\n\nEl chat responde con texto. La CLI además puede PEDIR que se ejecuten acciones en tu máquina. Nada más. El "truco" está en el system prompt y en las herramientas que le expones.',
      delay: 300
    },
    {
      side: 'tech', type: 'system', label: 'System prompt de la CLI',
      tag: 'MUY grande — se reenvía en cada turno',
      inTokens: 3800,
      content: 'Eres un asistente de codificación que opera en una terminal.\n\nHERRAMIENTAS DISPONIBLES:\n  Read(path)        → leer un archivo\n  Bash(cmd)         → ejecutar un comando\n  Edit(path,a,b)    → reemplazar texto a por b\n  Write(path,text)  → crear/sobrescribir archivo\n  Glob(pattern)     → buscar archivos por patrón\n  Grep(pattern)     → buscar texto dentro de archivos\n\nCONTEXTO DE ENTORNO:\n  cwd: /Users/fer/mi-proyecto\n  OS:  macOS 15.2\n  git: main (limpia)\n\n[... + ~3500 tokens de reglas: cuándo pedir permiso, formato de respuestas, buenas prácticas, ejemplos, tono, seguridad ...]',
      delay: 900
    },
    {
      side: 'tech', type: 'info', label: '👀 Fíjate',
      content: 'El system prompt SOLO ya ocupa ~3.800 tokens. A precios de Sonnet eso son ≈ $0.011 POR TURNO, antes de que el usuario escriba nada. Por eso las CLIs usan "prompt caching" para no pagar esto 10 veces seguidas.',
      delay: 1800
    },
    {
      side: 'term', type: 'user-cmd',
      content: '¿Qué archivos tengo en este proyecto?',
      delay: 1500
    },
    {
      side: 'tech', type: 'input', label: 'Mensaje del usuario',
      inTokens: 9,
      content: '"¿Qué archivos tengo en este proyecto?"',
      delay: 500
    },
    {
      side: 'term', type: 'thinking', content: 'pensando', delay: 400
    },
    {
      side: 'tech', type: 'thinking', label: 'Razonamiento',
      outTokens: 28,
      content: 'El usuario quiere una lista de archivos de su proyecto. Yo no tengo acceso directo al disco; debo pedir la herramienta Bash con un `ls`, o Glob con un patrón. Voy con Bash que es más natural.',
      delay: 1400
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 El modelo pide usar una herramienta',
      tag: 'esto es OUTPUT de la IA',
      outTokens: 18,
      content: '{\n  "tool": "Bash",\n  "arguments": { "command": "ls -la" }\n}',
      delay: 1000
    },
    {
      side: 'tech', type: 'info', label: '⚙️ El runtime ejecuta el comando',
      content: 'La IA NO ejecuta nada en tu máquina. Solo emite un JSON diciendo "querría ejecutar esto". El programa que la hospeda (la CLI) es quien de verdad corre el `ls` y captura stdout/stderr.',
      delay: 1400
    },
    {
      side: 'term', type: 'tool',
      head: 'Bash(ls -la)',
      body: 'total 24\ndrwxr-xr-x   8 fer staff  256 Apr 18 10:12 .\ndrwxr-xr-x  20 fer staff  640 Apr 18 10:00 ..\n-rw-r--r--   1 fer staff 1420 Apr 18 10:12 README.md\n-rw-r--r--   1 fer staff  512 Apr 18 10:11 package.json\ndrwxr-xr-x   5 fer staff  160 Apr 18 10:12 src\ndrwxr-xr-x   3 fer staff   96 Apr 18 10:10 tests',
      delay: 900
    },
    {
      side: 'tech', type: 'tool-result', label: '✅ Resultado vuelve a la IA',
      tag: 'cuenta como INPUT (se cobra)',
      inTokens: 110,
      content: 'stdout:\ntotal 24\ndrwxr-xr-x  8 fer staff  256 Apr 18 10:12 .\n... (6 líneas)\nREADME.md\npackage.json\nsrc/\ntests/',
      delay: 800
    },
    {
      side: 'term', type: 'thinking', content: 'resumiendo', delay: 500
    },
    {
      side: 'tech', type: 'thinking', label: 'Segunda llamada al modelo',
      tag: 'con TODO el contexto anterior',
      outTokens: 46,
      content: 'Tengo la salida de `ls`. Resumo los archivos de forma amigable, agrupando carpetas y archivos.',
      delay: 1400
    },
    {
      side: 'tech', type: 'output', label: 'Respuesta final',
      outTokens: 52,
      content: 'En tu proyecto hay: README.md, package.json, y dos carpetas (src/, tests/). ¿Quieres que mire dentro de alguna?',
      delay: 800
    },
    {
      side: 'term', type: 'assistant',
      content: 'En tu proyecto hay:\n\n  📄 README.md\n  📄 package.json\n  📁 src/\n  📁 tests/\n\n¿Quieres que mire dentro de alguna?',
      delay: 200
    },
    {
      side: 'tech', type: 'info', label: '🔑 Lo que acabas de ver',
      content: 'El patrón CLI = chat + herramientas + BUCLE:\n\n  1. Usuario pide → input\n  2. Modelo decide → "necesito Bash(ls)"\n  3. Runtime ejecuta en TU máquina → stdout\n  4. stdout vuelve al modelo como input\n  5. Modelo genera respuesta natural\n\nTodo este ida y vuelta fue UNA única instrucción del usuario, pero son DOS llamadas al modelo — y TODO el system prompt (3.800 tokens) se reenvió las dos veces.',
      delay: 2000
    }
  ],

  read: [
    {
      side: 'tech', type: 'info', label: 'Leer un archivo',
      content: 'Cuando pides algo como "explícame este archivo", la IA usa la herramienta Read para cargar el contenido a su contexto. Cuidado: archivos grandes = muchos tokens de input.',
      delay: 300
    },
    {
      side: 'tech', type: 'system', label: 'System prompt', inTokens: 3800,
      content: '[... igual que antes: tools + contexto + reglas ...]',
      delay: 700
    },
    {
      side: 'term', type: 'user-cmd',
      content: 'Explícame qué hace src/auth.js',
      delay: 1300
    },
    {
      side: 'tech', type: 'input', label: 'Mensaje del usuario',
      inTokens: 10,
      content: '"Explícame qué hace src/auth.js"',
      delay: 500
    },
    {
      side: 'term', type: 'thinking', content: 'leyendo archivo', delay: 400
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 Tool call',
      outTokens: 12,
      content: '{ "tool": "Read", "arguments": { "path": "src/auth.js" } }',
      delay: 1100
    },
    {
      side: 'term', type: 'tool',
      head: 'Read(src/auth.js)',
      body: '84 líneas leídas',
      delay: 700
    },
    {
      side: 'tech', type: 'tool-result', label: '✅ Contenido del archivo → input',
      tag: '⚠️ archivo entero = tokens',
      inTokens: 920,
      content: '// src/auth.js — 84 líneas, ~3KB\nimport bcrypt from "bcrypt";\nimport jwt from "jsonwebtoken";\n\nexport async function login(email, password) {\n  const user = await db.users.findOne({ email });\n  if (!user) throw new Error("no user");\n  const ok = await bcrypt.compare(password, user.hash);\n  ...\n}\n\n[... 76 líneas más que ocupan ~920 tokens ...]',
      delay: 900
    },
    {
      side: 'tech', type: 'info', label: '💡 Clave de coste',
      content: 'Un archivo de 84 líneas = ~920 tokens. Un repo entero (200 archivos) leído a ciegas serían ~180k tokens de input → varios dólares por turno. Por eso las CLIs exploran con Glob/Grep primero, y solo leen los archivos que de verdad necesitan.',
      delay: 2000
    },
    {
      side: 'tech', type: 'thinking', label: 'Razonamiento', outTokens: 80,
      content: 'El archivo expone dos funciones: login() y verifyToken(). Uso bcrypt para hash y jwt para tokens. Detecto un detalle: el secreto JWT viene de process.env.JWT_SECRET pero no hay fallback. Voy a resumir y destacarlo.',
      delay: 1500
    },
    {
      side: 'tech', type: 'output', label: 'Respuesta final', outTokens: 120,
      content: '`src/auth.js` expone dos funciones...',
      delay: 700
    },
    {
      side: 'term', type: 'assistant',
      content: '`src/auth.js` expone dos funciones:\n\n  • login(email, password) → valida credenciales contra BBDD, devuelve un JWT firmado.\n  • verifyToken(token) → decodifica un JWT y devuelve el user id.\n\nUsa bcrypt para el hash de contraseña y jsonwebtoken para firmar. Un detalle: el JWT_SECRET viene de process.env sin fallback → si la env falta, crashea en runtime.',
      delay: 200
    },
    {
      side: 'tech', type: 'info', label: '🔑 Resumen',
      content: 'Read es barato de ejecutar pero caro en tokens. Cada archivo leído ocupa input permanente durante el resto de la sesión (hasta que se "compacta"). Por eso una buena CLI lee lo menos posible.',
      delay: 1800
    }
  ],

  edit: [
    {
      side: 'tech', type: 'info', label: 'Edit con aprobación',
      tag: 'el usuario tiene la última palabra',
      content: '✏️ Leer es seguro. Editar no. Una buena CLI PAUSA antes de modificar archivos y te muestra el diff para que tú decidas si aplicarlo. Esa pausa es un mecanismo del runtime, no del modelo.',
      delay: 300
    },
    {
      side: 'tech', type: 'system', label: 'System prompt', inTokens: 3800,
      content: '[... incluye una regla: "Antes de usar Edit o Write, el usuario verá un diff y deberá aprobar" ...]',
      delay: 700
    },
    {
      side: 'term', type: 'user-cmd',
      content: 'En README.md dice "funcionamiendo" en vez de "funcionamiento". Arréglalo.',
      delay: 1400
    },
    {
      side: 'tech', type: 'input', label: 'Mensaje del usuario', inTokens: 22,
      content: '"En README.md dice \\"funcionamiendo\\" en vez de \\"funcionamiento\\". Arréglalo."',
      delay: 500
    },
    {
      side: 'term', type: 'thinking', content: 'leyendo README.md', delay: 400
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 Tool call 1', outTokens: 14,
      content: '{ "tool": "Read", "arguments": { "path": "README.md" } }',
      delay: 1100
    },
    {
      side: 'term', type: 'tool',
      head: 'Read(README.md)',
      body: '42 líneas leídas',
      delay: 600
    },
    {
      side: 'tech', type: 'tool-result', label: '✅ Contenido leído', inTokens: 480,
      content: '# Mi proyecto\n\nEsta herramienta permite ver el funcionamiendo interno de la API.\n...\n[42 líneas]',
      delay: 800
    },
    {
      side: 'tech', type: 'thinking', label: 'Razonamiento', outTokens: 38,
      content: 'He localizado la línea 12 con "funcionamiendo". Uso Edit con el reemplazo exacto. El runtime pedirá aprobación al usuario.',
      delay: 1400
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 Tool call 2: Edit',
      tag: 'requiere aprobación',
      outTokens: 34,
      content: '{\n  "tool": "Edit",\n  "arguments": {\n    "path": "README.md",\n    "old": "ver el funcionamiendo interno",\n    "new": "ver el funcionamiento interno"\n  }\n}',
      delay: 1200
    },
    {
      side: 'term', type: 'tool',
      head: 'Edit(README.md)',
      body: 'preparando cambio...',
      delay: 600
    },
    {
      side: 'term', type: 'diff',
      file: 'README.md:12',
      lines: [
        '- Esta herramienta permite ver el funcionamiendo interno de la API.',
        '+ Esta herramienta permite ver el funcionamiento interno de la API.'
      ],
      delay: 500
    },
    {
      side: 'term', type: 'approval',
      question: '¿Aplicar este cambio a README.md?',
      delay: 600
    },
    {
      side: 'tech', type: 'info', label: '⏸ Pausa',
      content: 'Aquí el modelo NO está pensando. Está congelado esperando la respuesta del humano. La IA no "ve" el diff — es un render del runtime para ti.',
      delay: 2000
    },
    {
      side: 'term', type: 'approval-accepted',
      choice: 'usuario pulsó y',
      delay: 1800
    },
    {
      side: 'term', type: 'status', content: 'escribiendo cambio...', delay: 500
    },
    {
      side: 'tech', type: 'tool-result', label: '✅ Resultado al modelo', inTokens: 14,
      content: '{ "ok": true, "lines_changed": 1 }',
      delay: 900
    },
    {
      side: 'tech', type: 'output', label: 'Respuesta final', outTokens: 26,
      content: 'Corregido. Reemplacé "funcionamiendo" por "funcionamiento" en README.md:12.',
      delay: 700
    },
    {
      side: 'term', type: 'assistant',
      content: '✓ Corregido "funcionamiendo" → "funcionamiento" en README.md:12.',
      delay: 200
    },
    {
      side: 'tech', type: 'info', label: '🔑 La aprobación no es del modelo',
      content: 'El modelo NO decide si te pide permiso. Es el runtime el que intercepta Edit/Write/Bash y aplica las reglas (qué herramientas son "seguras", cuáles siempre preguntan, cuáles el usuario ha dicho "permite siempre"). La IA solo propone.',
      delay: 2200
    }
  ],

  bug: [
    {
      side: 'tech', type: 'info', label: 'Arreglar un bug',
      content: '🐛 Aquí ves el ciclo típico: leer → razonar → editar. El modelo tiene que entender el código antes de tocarlo, y a veces necesita varias lecturas para estar seguro.',
      delay: 300
    },
    {
      side: 'tech', type: 'system', label: 'System prompt', inTokens: 3800,
      content: '[... + contexto de herramientas ...]',
      delay: 700
    },
    {
      side: 'term', type: 'user-cmd',
      content: 'La función parseDate() devuelve NaN cuando le paso "2024-12-31". Arréglalo.',
      delay: 1400
    },
    {
      side: 'tech', type: 'input', label: 'Mensaje del usuario', inTokens: 28,
      content: '"La función parseDate() devuelve NaN cuando le paso \\"2024-12-31\\". Arréglalo."',
      delay: 500
    },
    {
      side: 'term', type: 'thinking', content: 'buscando la función', delay: 400
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 Grep para localizar', outTokens: 16,
      content: '{ "tool": "Grep", "arguments": { "pattern": "function parseDate" } }',
      delay: 1000
    },
    {
      side: 'term', type: 'tool',
      head: 'Grep("function parseDate")',
      body: 'src/utils/date.js:4',
      delay: 600
    },
    {
      side: 'tech', type: 'tool-result', inTokens: 18, label: '✅ 1 coincidencia',
      content: 'src/utils/date.js:4: function parseDate(s) {',
      delay: 700
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 Leer archivo', outTokens: 14,
      content: '{ "tool": "Read", "arguments": { "path": "src/utils/date.js" } }',
      delay: 900
    },
    {
      side: 'term', type: 'tool',
      head: 'Read(src/utils/date.js)',
      body: '22 líneas leídas',
      delay: 600
    },
    {
      side: 'tech', type: 'tool-result', inTokens: 240, label: '✅ Contenido',
      content: '// src/utils/date.js\nexport function parseDate(s) {\n  const [d, m, y] = s.split("-");\n  return new Date(y, m - 1, d);\n}',
      delay: 800
    },
    {
      side: 'tech', type: 'thinking', label: 'Diagnóstico', outTokens: 110,
      content: 'Veo el bug. El código asume formato DD-MM-YYYY pero el usuario pasa "2024-12-31" (ISO, YYYY-MM-DD). Split da ["2024","12","31"]: d="2024", m="12", y="31" → Date(31, 11, 2024) → fecha inválida en muchos motores.\n\nDos opciones: (1) aceptar ambos formatos, (2) usar Date directamente porque ISO es nativo. Voy con la 2, más simple.',
      delay: 2200
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 Edit', tag: 'requiere aprobación', outTokens: 58,
      content: '{\n  "tool": "Edit",\n  "arguments": {\n    "path": "src/utils/date.js",\n    "old": "const [d, m, y] = s.split(\\"-\\");\\n  return new Date(y, m - 1, d);",\n    "new": "return new Date(s);"\n  }\n}',
      delay: 1200
    },
    {
      side: 'term', type: 'tool',
      head: 'Edit(src/utils/date.js)',
      body: 'preparando cambio...',
      delay: 600
    },
    {
      side: 'term', type: 'diff',
      file: 'src/utils/date.js',
      lines: [
        '  export function parseDate(s) {',
        '-   const [d, m, y] = s.split("-");',
        '-   return new Date(y, m - 1, d);',
        '+   return new Date(s);',
        '  }'
      ],
      delay: 400
    },
    {
      side: 'term', type: 'approval',
      question: '¿Aplicar este cambio a src/utils/date.js?',
      delay: 500
    },
    {
      side: 'term', type: 'approval-accepted', choice: 'aceptado', delay: 1600
    },
    {
      side: 'tech', type: 'tool-result', inTokens: 14, label: '✅ Edit aplicado',
      content: '{ "ok": true, "lines_changed": 2 }',
      delay: 800
    },
    {
      side: 'tech', type: 'output', label: 'Respuesta final', outTokens: 85,
      content: 'Arreglado. El bug estaba en el parseo...',
      delay: 700
    },
    {
      side: 'term', type: 'assistant',
      content: 'Arreglado. El bug: parseDate asumía formato DD-MM-YYYY, pero "2024-12-31" es ISO (YYYY-MM-DD). Al hacer split, pasaba día=2024 al constructor Date → NaN.\n\nLo he simplificado a `new Date(s)`, que ya soporta ISO nativamente.',
      delay: 200
    },
    {
      side: 'tech', type: 'info', label: '🔑 Grep + Read + Edit',
      content: 'Tres herramientas en un turno. La IA las encadena porque cada resultado informa la siguiente decisión. Esto es el "bucle agente" en miniatura: no es una sola llamada al modelo, son CUATRO (una por cada tool call + la respuesta final).',
      delay: 2200
    }
  ],

  test: [
    {
      side: 'tech', type: 'info', label: 'Bucle agente: crear un test y ejecutarlo',
      tag: 'aquí empieza a parecer mágico',
      content: '🤖 Ahora la IA no solo ejecuta pasos — también VERIFICA su propio trabajo. Escribe un test, lo ejecuta, si falla lo arregla. Eso es un agente: acción → observación → ajuste → repetir.',
      delay: 300
    },
    {
      side: 'tech', type: 'system', label: 'System prompt', inTokens: 3800,
      content: '[... tools, cwd, reglas ...]',
      delay: 700
    },
    {
      side: 'term', type: 'user-cmd',
      content: 'Añade un test para la función sum() en src/math.js y asegúrate de que pasa.',
      delay: 1400
    },
    {
      side: 'tech', type: 'input', label: 'Mensaje del usuario', inTokens: 26,
      content: '"Añade un test para sum() en src/math.js y asegúrate de que pasa."',
      delay: 500
    },
    {
      side: 'term', type: 'thinking', content: 'explorando estructura de tests', delay: 400
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 Tool call 1: Read el código', outTokens: 12,
      content: '{ "tool": "Read", "arguments": { "path": "src/math.js" } }',
      delay: 900
    },
    {
      side: 'term', type: 'tool', head: 'Read(src/math.js)', body: '18 líneas', delay: 500
    },
    {
      side: 'tech', type: 'tool-result', inTokens: 95, label: '✅ Contenido',
      content: 'export function sum(a, b) { return a + b; }\nexport function sub(a, b) { return a - b; }\n...',
      delay: 700
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 Tool call 2: buscar ejemplos de test', outTokens: 14,
      content: '{ "tool": "Glob", "arguments": { "pattern": "tests/*.test.js" } }',
      delay: 900
    },
    {
      side: 'term', type: 'tool',
      head: 'Glob(tests/*.test.js)',
      body: 'tests/utils.test.js',
      delay: 500
    },
    {
      side: 'tech', type: 'tool-result', inTokens: 14, label: '✅ 1 archivo',
      content: '["tests/utils.test.js"]',
      delay: 600
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 Tool call 3: imitar el estilo existente', outTokens: 14,
      content: '{ "tool": "Read", "arguments": { "path": "tests/utils.test.js" } }',
      delay: 900
    },
    {
      side: 'term', type: 'tool', head: 'Read(tests/utils.test.js)', body: '14 líneas', delay: 500
    },
    {
      side: 'tech', type: 'tool-result', inTokens: 140, label: '✅ Estilo del proyecto',
      content: 'import { test, expect } from "vitest";\nimport { capitalize } from "../src/utils.js";\n\ntest("capitalize", () => { expect(capitalize("hi")).toBe("Hi"); });',
      delay: 700
    },
    {
      side: 'tech', type: 'thinking', label: 'Plan', outTokens: 60,
      content: 'Usan vitest. Voy a crear tests/math.test.js imitando ese patrón. Luego ejecuto `npm test` para verificar.',
      delay: 1500
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 Tool call 4: Write', tag: 'requiere aprobación', outTokens: 70,
      content: '{\n  "tool": "Write",\n  "arguments": {\n    "path": "tests/math.test.js",\n    "content": "import { test, expect } from \\"vitest\\";\\nimport { sum } from \\"../src/math.js\\";\\n\\ntest(\\"sum basic\\", () => { expect(sum(2,3)).toBe(5); });\\ntest(\\"sum zeros\\", () => { expect(sum(0,0)).toBe(0); });\\ntest(\\"sum negatives\\", () => { expect(sum(-1,-2)).toBe(-3); });\\n"\n  }\n}',
      delay: 1200
    },
    {
      side: 'term', type: 'tool', head: 'Write(tests/math.test.js)', body: 'archivo nuevo (7 líneas)', delay: 500
    },
    {
      side: 'term', type: 'approval', question: '¿Crear archivo tests/math.test.js?', delay: 500
    },
    {
      side: 'term', type: 'approval-accepted', choice: 'aceptado', delay: 1500
    },
    {
      side: 'tech', type: 'tool-result', inTokens: 10, label: '✅ Archivo creado',
      content: '{ "ok": true, "bytes": 260 }',
      delay: 700
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 Tool call 5: ejecutar tests', outTokens: 14,
      content: '{ "tool": "Bash", "arguments": { "command": "npm test" } }',
      delay: 1000
    },
    {
      side: 'term', type: 'tool',
      head: 'Bash(npm test)',
      body: '✓ tests/math.test.js (3 tests) 12ms\n✓ tests/utils.test.js (1 test) 3ms\n\nTest Files  2 passed (2)\nTests       4 passed (4)',
      delay: 1400
    },
    {
      side: 'tech', type: 'tool-result', inTokens: 85, label: '✅ Todos los tests pasan',
      content: 'exit 0\nstdout: 4 passed (2 files)',
      delay: 700
    },
    {
      side: 'tech', type: 'output', label: 'Respuesta final', outTokens: 70,
      content: 'Creado tests/math.test.js con 3 casos. Todos pasan.',
      delay: 700
    },
    {
      side: 'term', type: 'assistant',
      content: '✓ Creado tests/math.test.js con 3 casos (básico, ceros, negativos).\n✓ npm test: 4 tests pasan (los tuyos + el mío).',
      delay: 200
    },
    {
      side: 'tech', type: 'info', label: '🔑 Esto es un agente',
      content: 'UNA instrucción del usuario → 5 tool calls + 1 respuesta final = 6 llamadas al modelo.\n\nY lo importante: la IA NO siguió un plan fijo. Tras cada resultado decidió el siguiente paso. Si los tests hubieran fallado, habría leído el error y editado el código. Ese bucle es lo que hace "agente" a un agente.',
      delay: 2400
    }
  ],

  refactor: [
    {
      side: 'tech', type: 'info', label: 'Refactor multi-archivo',
      tag: 'aquí se nota el coste',
      content: '🔧 Renombrar una función usada en 8 archivos parece trivial — pero cada archivo es input de tokens, y cada Edit es otra llamada al modelo. Verás por qué el coste de las CLIs escala con el tamaño del cambio.',
      delay: 300
    },
    {
      side: 'tech', type: 'system', label: 'System prompt', inTokens: 3800,
      content: '[... tools, cwd, reglas ...]',
      delay: 700
    },
    {
      side: 'term', type: 'user-cmd',
      content: 'Renombra la función getUserData a fetchUser en todo el repo.',
      delay: 1400
    },
    {
      side: 'tech', type: 'input', label: 'Mensaje del usuario', inTokens: 20,
      content: '"Renombra la función getUserData a fetchUser en todo el repo."',
      delay: 500
    },
    {
      side: 'term', type: 'thinking', content: 'buscando usos', delay: 400
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 Grep — encontrar todos los usos', outTokens: 14,
      content: '{ "tool": "Grep", "arguments": { "pattern": "getUserData" } }',
      delay: 900
    },
    {
      side: 'term', type: 'tool',
      head: 'Grep("getUserData")',
      body: '8 coincidencias en 5 archivos:\n  src/api/users.js:12 (definición)\n  src/api/users.js:45\n  src/routes/profile.js:8\n  src/routes/profile.js:23\n  src/routes/admin.js:15\n  src/hooks/useUser.js:4\n  tests/users.test.js:3\n  tests/users.test.js:18',
      delay: 700
    },
    {
      side: 'tech', type: 'tool-result', inTokens: 120, label: '✅ 5 archivos a tocar',
      content: '8 matches across 5 files',
      delay: 700
    },
    {
      side: 'tech', type: 'thinking', label: 'Plan', outTokens: 55,
      content: 'Tengo que editar 5 archivos. La función se define en users.js y se usa en 4 más. Empezaré por la definición y luego los usos. Cada Edit requerirá aprobación (el usuario puede aceptar "siempre" tras la primera).',
      delay: 1800
    },
    {
      side: 'tech', type: 'info', label: '⚠️ Factor coste',
      content: 'Para editar con seguridad, la IA suele LEER cada archivo antes de editarlo (para construir el `old_string` exacto). 5 archivos × ~200 tokens cada uno = ~1.000 tokens de input adicional solo en lecturas.',
      delay: 2200
    },
    {
      side: 'term', type: 'tool', head: 'Read(src/api/users.js)', body: '58 líneas', delay: 700
    },
    {
      side: 'tech', type: 'tool-result', inTokens: 420, label: '✅ users.js', content: '...', delay: 400
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 Edit users.js', outTokens: 30, tag: 'aprobación',
      content: '{ "tool": "Edit", "arguments": { "path": "src/api/users.js", "old": "export async function getUserData", "new": "export async function fetchUser" } }',
      delay: 700
    },
    {
      side: 'term', type: 'tool', head: 'Edit(src/api/users.js)', body: 'preparando...', delay: 300
    },
    {
      side: 'term', type: 'diff',
      file: 'src/api/users.js:12',
      lines: ['- export async function getUserData(id) {', '+ export async function fetchUser(id) {']
    ,
      delay: 300
    },
    {
      side: 'term', type: 'approval', question: '¿Aplicar este cambio?', delay: 400
    },
    {
      side: 'term', type: 'approval-accepted', choice: 'usuario: [a] aceptar SIEMPRE', delay: 1400
    },
    {
      side: 'tech', type: 'info', label: '💡 "Accept edits"',
      content: 'Al pulsar "aceptar siempre", el runtime se salta la aprobación en las próximas Edit durante esta sesión. La IA no lo sabe; para ella, todas las aprobaciones parecen instantáneas. Es un atajo UX, no lógica del modelo.',
      delay: 1800
    },
    {
      side: 'term', type: 'tool', head: 'Edit(src/api/users.js)', body: 'segunda coincidencia...', delay: 400
    },
    {
      side: 'term', type: 'tool', head: 'Read(src/routes/profile.js) + Edit × 2', body: 'aplicado', delay: 700
    },
    {
      side: 'term', type: 'tool', head: 'Read(src/routes/admin.js) + Edit', body: 'aplicado', delay: 500
    },
    {
      side: 'term', type: 'tool', head: 'Read(src/hooks/useUser.js) + Edit', body: 'aplicado', delay: 500
    },
    {
      side: 'term', type: 'tool', head: 'Read(tests/users.test.js) + Edit × 2', body: 'aplicado', delay: 500
    },
    {
      side: 'tech', type: 'info', label: 'Iteraciones del modelo',
      tag: '~13 llamadas al modelo',
      content: 'Grep (1) + Read×5 + Edit×8 + respuesta final = ~14 llamadas. En cada una se reenvía el system prompt + TODO el historial acumulado (el contexto crece en cada turno).',
      delay: 1800
    },
    {
      side: 'tech', type: 'tool-call', label: '🔧 Verificar con Grep', outTokens: 14,
      content: '{ "tool": "Grep", "arguments": { "pattern": "getUserData" } }',
      delay: 700
    },
    {
      side: 'term', type: 'tool', head: 'Grep("getUserData")', body: '0 coincidencias', delay: 500
    },
    {
      side: 'tech', type: 'tool-result', inTokens: 10, label: '✅ Sin referencias antiguas',
      content: 'no matches',
      delay: 500
    },
    {
      side: 'tech', type: 'output', label: 'Respuesta final', outTokens: 90,
      content: 'Renombrado en 5 archivos (8 sustituciones). Grep confirma que no quedan referencias a getUserData.',
      delay: 700
    },
    {
      side: 'term', type: 'assistant',
      content: '✓ Renombrado getUserData → fetchUser:\n\n  • src/api/users.js (2 usos)\n  • src/routes/profile.js (2 usos)\n  • src/routes/admin.js (1 uso)\n  • src/hooks/useUser.js (1 uso)\n  • tests/users.test.js (2 usos)\n\nGrep confirma que no quedan referencias al nombre antiguo.',
      delay: 200
    },
    {
      side: 'tech', type: 'info', label: '🔑 Por qué las CLIs son caras',
      content: 'Este refactor = ~14 llamadas × ~6.000 tokens de contexto promedio = ~84k tokens movidos. A precios de Sonnet eso son ≈ $0.30–$0.50 por ESTE refactor. Por eso:\n\n  • el prompt caching es obligatorio (descuento de 90% en tokens repetidos)\n  • a veces `sed` sigue siendo mejor opción ;)',
      delay: 2400
    }
  ]
};
