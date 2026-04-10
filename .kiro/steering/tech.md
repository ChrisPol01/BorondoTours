# Tech Stack

This is a documentation vault, not a code project. There is no build system or package manager.

## Tools & Integrations

| Herramienta | Versión | Uso |
|---|---|---|
| Obsidian | latest | UI principal del vault |
| Kiro IDE | latest | Desarrollo con IA + specs |
| Claude Desktop | latest | Asistente con contexto del vault |
| mcp-obsidian | latest | Conecta Claude Desktop con el vault |

## MCP Setup

### Claude Desktop → Obsidian
```json
{
  "mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": ["mcp-obsidian", "C:/ruta/al/vault"]
    }
  }
}
```

### Kiro → Vault
Kiro accede al vault directamente vía filesystem. Usar `#File` en el chat para incluir archivos del vault como contexto.

## Convenciones
- Commits: Conventional Commits (`feat`, `fix`, `docs`, `refactor`, `test`)
- Idioma del código: inglés
- Idioma de docs y comentarios: español
- Tests: obligatorios para toda lógica de negocio
