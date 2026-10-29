# .megafactory

Carpeta de contexto de la Megafábrica SDLC 1.0.0 en este proyecto. Lo pesado (motor, roles, skills, recetas, métodos y manual) vive en la fábrica central; aquí quedan el perfil, el pin, el registro renderizado y los resultados del trabajo.

- Packs: core, web-app, ops-day2.
- Herramientas enlazadas: agents-md, kiro.
- Pin de la central: `megafactory.lock.json` (versión, commit y hash de contenido).

## Qué hay aquí

| Ruta | Qué es | Git |
|---|---|---|
| `profile.json` | Perfil del proyecto (lo edita el humano) | Versionado |
| `megafactory.lock.json`, `link.manifest.json` | Pin y propiedad de los archivos administrados (solo `mf`) | Versionado |
| `bin/` | Lanzadores `factory.mjs` (agentes y humanos) y `mf.mjs` (humanos) | Versionado |
| `registry/` | Registro renderizado: agentes, tipos, recetas, kits, grafo, MCP | Versionado |
| `bus/`, `memory/`, `findings/`, `activities/` | Trabajo, memoria, hallazgos y actividades (control solo por el CLI) | Versionado |
| `core` | Enlace a la central (`MF_HOME`) | Ignorado |
| `local.json`, `state/`, `views/`, `adapters/` | Datos de esta máquina y vistas regenerables | Ignorado |

## Enlazar en otra máquina

1. Clona la fábrica central y define `MF_HOME` con su ruta (o déjala junto a este repo como `../megafabrica-sdlc`).
2. Ejecuta `node .megafactory/bin/mf.mjs link` en la raíz del proyecto.
3. Comprueba con `node .megafactory/bin/mf.mjs status --verify`.

Antes de borrar esta carpeta ejecuta `node .megafactory/bin/mf.mjs unlink`: `core` es un enlace a la central y borrarlo a mano puede borrar la central.
