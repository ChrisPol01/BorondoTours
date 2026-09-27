# 🔌 Guía MCP: Obsidian ↔ Claude Desktop y Kiro

## ¿Qué es un MCP para Obsidian?
El MCP (Model Context Protocol) le permite a Claude Desktop y a Kiro
**leer y escribir notas de Obsidian directamente**, sin copiar y pegar.

---

## PARTE 1 — Claude Desktop ↔ Obsidian

### Paso 1: Instalar el MCP de Obsidian

El MCP más usado es `mcp-obsidian` (Node.js).

```bash
# Instalar globalmente
npm install -g mcp-obsidian
```

### Paso 2: Configurar Claude Desktop

Abre el archivo de config de Claude Desktop:

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Mac:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

Agrega esto al JSON:

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": [
        "mcp-obsidian",
        "C:/ruta/a/tu/vault"
      ]
    }
  }
}
```

> ⚠️ Reemplaza la ruta con la ruta real de tu vault Obsidian.
> En Windows usa barras normales: `C:/Users/TuUsuario/Documents/mi-vault`

### Paso 3: Reiniciar Claude Desktop

Cierra y vuelve a abrir Claude Desktop.
Verás el ícono 🔌 en el chat — indica que el MCP está activo.

### Paso 4: Probar la conexión

Escribe en Claude Desktop:
```
Lista las notas que hay en mi vault de Obsidian
```

---

## PARTE 2 — Kiro ↔ Obsidian (vía filesystem MCP)

Kiro no necesita un MCP específico de Obsidian — usa el **MCP filesystem**
nativo para leer archivos Markdown directamente.

### Opción A: Filesystem MCP en Kiro (más simple)

En Kiro, abre el panel lateral → **MCP Servers** → **Add server**

Agrega este servidor:

```json
{
  "name": "obsidian-vault",
  "type": "filesystem",
  "config": {
    "rootPath": "C:/ruta/a/tu/vault",
    "allowedExtensions": [".md"],
    "readOnly": false
  }
}
```

Kiro podrá leer y escribir archivos `.md` en tu vault.

### Opción B: Steering file (recomendado para Kiro)

Es más limpio usar un **Steering file** que apunte al vault.
Ya tienes la plantilla en `.kiro-steering-template.md` de este vault.

En tu repo de código, crea:
```
.kiro/
  steering/
    proyecto-context.md   ← copia el contenido de .kiro-steering-template.md
```

El steering file le dice a Kiro dónde está el vault y cómo usarlo.
El agente puede luego usar `#File ../obsidian-vault/01-Specs/Spec-Principal.md`
para incluir specs directamente en el contexto del chat.

---

## PARTE 3 — Flujo combinado en la práctica

### Cuando diseñas (claude.ai o Claude Desktop):
1. "Ayúdame a escribir la spec para el módulo de autenticación"
2. Claude genera la spec
3. Le dices: "Guárdala en `01-Specs/Spec-Auth.md` de mi vault"
4. Claude Desktop la escribe vía MCP

### Cuando codeas (Kiro):
1. Abres Kiro en tu repo
2. En el chat: `#File ../vault/01-Specs/Spec-Auth.md Implementa esto`
3. Kiro lee la spec directamente y genera el código

### Cuando tomas decisiones (Kiro + Obsidian):
1. En Kiro: "Necesito decidir entre JWT y sessions"
2. Kiro te ayuda a evaluar opciones
3. Le dices: "Documenta esto como ADR-002 en el vault"
4. Kiro escribe `../vault/02-ADRs/ADR-002-Auth-Strategy.md`

---

## Troubleshooting común

| Problema | Solución |
|---|---|
| Claude Desktop no ve el MCP | Verifica que `npx mcp-obsidian` corra desde terminal primero |
| Ruta con espacios no funciona | Pon la ruta entre comillas dobles en el JSON |
| Kiro no encuentra archivos | Usa rutas absolutas en el steering file |
| Error `ENOENT` | La ruta del vault no existe o está mal escrita |
