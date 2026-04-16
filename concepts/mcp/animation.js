const ANIMATIONS = {};

// ========== MCP ==========
ANIMATIONS.mcp = function(stage) {
  stage.innerHTML = `
    <div class="stage-controls">
      <button id="mcpGo" class="primary">▶ Reproducir</button>
      <button id="mcpReset">Reiniciar</button>
      <span style="font-size:12px;color:var(--muted);">Ejemplo: conectar IA a tu BBDD y Slack via MCP</span>
    </div>
    <div class="tool-flow" id="mcpFlow">
      <div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver cómo MCP conecta herramientas a la IA</div></div>
    </div>
  `;

  const steps = [
    { label: '🔌 Fase 1: Arranque de servidores MCP', cls: 'tf-exec', text: 'El cliente (tu app) arranca los servidores configurados:\n  • mcp-server-postgres  (base de datos)\n  • mcp-server-slack     (mensajería)' },
    { label: '🤝 Handshake (JSON-RPC)', cls: 'tf-call', text: '→ { "method": "initialize",\n    "params": { "protocolVersion": "2025-03-26" } }\n← { "result": { "serverInfo": { "name": "postgres" } } }' },
    { label: '📋 Listado de herramientas', cls: 'tf-result', text: '→ { "method": "tools/list" }\n← { "tools": [\n    { "name": "query_db", "desc": "SQL de solo lectura" },\n    { "name": "list_tables", "desc": "Lista tablas" },\n    { "name": "slack_post", "desc": "Envía mensaje" }\n  ] }' },
    { label: '📋 System prompt (con tools MCP inyectadas)', cls: 'tf-think', text: '"Eres un asistente interno. Tienes acceso a: query_db, list_tables, slack_post.\nUsa solo datos de estas herramientas."' },
    { label: '💬 El usuario pregunta', cls: 'tf-user', text: '¿Cuántos usuarios nuevos se registraron ayer? Y avísale al canal #growth.' },
    { label: '🧠 La IA decide usar tools MCP', cls: 'tf-think', text: 'Necesito consultar la BBDD y luego publicar en Slack. Ambas son tools MCP.' },
    { label: '🔧 query_db (servidor MCP: postgres)', cls: 'tf-call', text: '→ { "method": "tools/call",\n    "params": {\n      "name": "query_db",\n      "arguments": {\n        "sql": "SELECT COUNT(*) FROM users WHERE created_at::date = CURRENT_DATE - 1"\n      }\n    } }' },
    { label: '⚙️ El servidor MCP ejecuta localmente', cls: 'tf-exec', text: 'postgres-mcp abre conexión a la BBDD interna,\nejecuta el SQL con permisos de solo lectura.\nLa IA nunca ve credenciales ni habla directo con la BBDD.' },
    { label: '✅ Resultado', cls: 'tf-result', text: '{ "content": [{ "type": "text", "text": "[{count: 147}]" }] }' },
    { label: '🔧 slack_post (servidor MCP: slack)', cls: 'tf-call', text: '→ { "method": "tools/call",\n    "params": {\n      "name": "slack_post",\n      "arguments": {\n        "channel": "#growth",\n        "text": "📈 Ayer se registraron 147 usuarios nuevos."\n      }\n    } }' },
    { label: '✅ Resultado', cls: 'tf-result', text: '{ "ok": true }' },
    { label: '💬 Respuesta al usuario', cls: 'tf-answer', text: 'Ayer se registraron 147 usuarios nuevos. Ya lo publiqué en #growth. ✅\n\n→ Dos servidores MCP distintos (postgres, slack),\n   mismo protocolo, misma IA. Cambias de LLM sin tocar las integraciones.' }
  ];

  async function run() {
    const flow = document.getElementById('mcpFlow');
    flow.innerHTML = '';
    for (const s of steps) {
      const d = document.createElement('div');
      d.className = 'tf-step';
      d.innerHTML = `<div class="tf-label">${s.label}</div><div class="tf-box ${s.cls}"><pre>${s.text}</pre></div>`;
      flow.appendChild(d);
      flow.scrollTop = flow.scrollHeight;
      await new Promise(r => setTimeout(r, 1300));
    }
  }

  document.getElementById('mcpGo').addEventListener('click', run);
  document.getElementById('mcpReset').addEventListener('click', () => {
    document.getElementById('mcpFlow').innerHTML = '<div class="tf-step" style="opacity:0.4"><div class="tf-label">Pulsa ▶ para ver cómo MCP conecta herramientas a la IA</div></div>';
  });
};

// ========== MINI: MCP 2 (filesystem) — visual timeline ==========
ANIMATIONS._mcp2 = function(mount) {
  const steps = [
    { type: 'act',    icon: '🔌', head: 'Servidor MCP: filesystem', body: 'Acceso a <code>/home/user/proyecto/</code>' },
    { type: 'result', icon: '📋', head: 'Tools disponibles', body: '<code>read_file</code> · <code>write_file</code> · <code>list_directory</code> · <code>search_files</code>' },
    { type: 'user',   icon: '💬', head: 'Usuario pregunta', body: '"¿Hay algún TODO pendiente en el proyecto?"' },
    { type: 'act',    icon: '🔍', head: 'search_files() via MCP', body: 'Busca patrón "TODO" en todo el proyecto' },
    { type: 'result', icon: '📄', head: '3 resultados encontrados', body: '<code>auth.py:42</code> → refresh token<br><code>api.py:108</code> → rate limiting<br><code>test_api.py:5</code> → edge case' },
    { type: 'done',   icon: '✅', head: 'Respuesta', body: 'La IA leyó tus archivos locales vía MCP, sin acceso directo al filesystem' }
  ];
  mount.innerHTML = '<div class="mini-controls"><button class="primary" id="mcp2Go">▶ Reproducir</button></div><div class="vtl" id="mcp2Vtl"></div>';
  function build() {
    document.getElementById('mcp2Vtl').innerHTML = steps.map((s, i) => `
      <div class="vtl-step s-${s.type}" id="mcp2-s${i}">
        <div class="vtl-dot">${s.icon}</div>
        <div class="vtl-card"><div class="vtl-head">${s.head}</div>${s.body}</div>
      </div>`).join('');
  }
  async function run() {
    build();
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      document.getElementById('mcp2-s' + i).classList.add('show');
    }
  }
  document.getElementById('mcp2Go').addEventListener('click', run);
  build();
};

