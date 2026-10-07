# Trabajar con Kiro + Figma como lo hacemos en BorondoTours — guía para un proyecto nuevo

> Para un compañero que quiere **diseñar en Figma desde Kiro** (generar pantallas por código)
> en **su propio archivo de Figma** y en **otro proyecto distinto de BorondoTours**.
>
> Son tres piezas: (A) el MCP que conecta Kiro con Figma, (B) el plugin dentro de Figma
> Desktop, (C) el patrón de "módulos de diseño". Lo de Borondo (marca, mapa de Colombia,
> pantallas) **no se copia**: se adapta. Aquí va lo genérico y reutilizable.

---

## 0. Qué NO compartir

- **No** le pases tu `~/.kiro/settings/mcp.json`: tiene tokens y API keys reales (Figma, GitHub,
  Stripe, Google, etc.). Cada quien usa los suyos.
- **No** le pases tu `bridge_token.txt`: es por máquina, se genera solo al instalar el bridge.
- **No** le copies los módulos de marca de Borondo (`bt`, `btt`, `btmap`, `btflow`, `btmx*`,
  `btstate*`, `btp`, …): traen la paleta, el mapa de Colombia y las pantallas de Borondo.
  Sirven como **ejemplo**, no para usarlos tal cual en otro proyecto.

---

## A. Instalar el MCP figma-bridge (desde su repositorio en GitHub)

> **De dónde sale la carpeta `~/.figma-mcp-bridge/`.** La crea el instalador del repositorio
> **[kolganovr/figma-mcp-bridge](https://github.com/kolganovr/figma-mcp-bridge)** (server v4.x,
> "Figma Live Plugin Bridge"). NO la crea el parche. El parche del paso B solo *reemplaza* un
> archivo que ese instalador ya dejó; si no instalas el bridge antes, el script del paso B no
> encuentra las carpetas y no copia nada.
>
> ⚠️ El instalador registra el MCP en Claude, Cursor, Windsurf y Antigravity, **pero NO en Kiro**.
> Para usarlo desde Kiro, el registro en `mcp.json` es manual (paso 4).

0. Requisito: tener **Node.js** instalado (es el único runtime que necesita; sin dependencias npm).

1. **Instalar el bridge.** Dos formas equivalentes:
   ```bash
   # a) rápida, una línea:
   npx @kolganovr/figma-mcp-bridge

   # b) revisando el instalador antes de ejecutarlo:
   git clone https://github.com/kolganovr/figma-mcp-bridge.git
   cd figma-mcp-bridge
   node install.mjs
   ```
   Cualquiera copia el server y el plugin a `~/.figma-mcp-bridge/` y genera el token en
   `~/.figma-mcp-bridge/bridge_token.txt`.

2. **Importar el plugin en Figma Desktop:** `Plugins` → `Development` →
   `Import plugin from manifest…` → elegir `~/.figma-mcp-bridge/mcp/figma-plugin/manifest.json`.

3. **Lanzar el plugin:** en Figma, `Ctrl + Alt + P` (mac: `Cmd + Option + P`) → "Antigravity Bridge".
   El estado debe ponerse verde: **CONNECTED**.

4. **Registrar el MCP en Kiro (manual).** Agregar este bloque a `~/.kiro/settings/mcp.json`
   (ver `mcp.figma-bridge.ejemplo.json`), con su usuario y su token de `bridge_token.txt`:

   ```json
   {
     "mcpServers": {
       "figma-bridge": {
         "command": "node",
         "args": ["C:/Users/<SU_USUARIO>/.figma-mcp-bridge/mcp/figma/index.js"],
         "env": {
           "FIGMA_PERSONAL_ACCESS_TOKEN": "",
           "FIGMA_BRIDGE_TOKEN": "<contenido de su bridge_token.txt>"
         },
         "disabled": false
       }
     }
   }
   ```
   Reiniciar/reconectar el MCP en Kiro para que tome las herramientas.

> Verificar la instalación en cualquier momento: `npx @kolganovr/figma-mcp-bridge --doctor`
> Para actualizar el bridge: `node install.mjs --update` desde el repo clonado (sobrescribe el
> `code.js`, así que después hay que **volver a aplicar el parche** del paso B).

---

## B. Instalar el plugin parcheado en Figma Desktop

El plugin que trae el bridge funciona, pero nuestro `code.js` tiene **dos parches** necesarios:
sube el tope de las capturas (evita que el chat se cierre con imágenes grandes) y arregla la
carga de fuentes. Por eso se reemplaza por el nuestro.

1. Copiar el `code.js` de esta carpeta a las **tres** rutas donde Figma lo busca. Con el script:

   ```powershell
   pwsh otros/infra/figma-bridge-plugin/compartir/install-plugin.ps1
   ```

   O a mano, a cada una:
   - `~/.gemini/antigravity/mcp/figma-plugin/code.js`
   - `~/.gemini/antigravity-ide/mcp/figma-plugin/code.js`
   - `~/.figma-mcp-bridge/mcp/figma-plugin/code.js`
2. En **Figma Desktop**: menú → *Plugins* → *Development* → *Import plugin from manifest…* →
   elegir el `manifest.json` de cualquiera de esas carpetas.
3. Ejecutar el plugin **Antigravity Bridge** en Figma (debe quedar abierto mientras trabajan).
4. Verificar desde Kiro con una llamada simple (el agente usa `figma_execute_code`):

   ```js
   return bridge.info()
   ```

> Si una actualización del bridge sobrescribe `code.js`, volver a correr el paso 1.

---

## C. El patrón de "módulos de diseño" (lo que lo hace rápido)

No construimos cada pantalla con llamadas sueltas: guardamos **helpers** dentro del archivo de
Figma y los reutilizamos. El mecanismo es genérico (sirve en cualquier proyecto):

- **Guardar un módulo** en el documento:
  ```js
  bridge.define('ui', `<contenido del módulo>`)   // una vez por archivo de Figma
  ```
- **Usar un módulo** en cualquier llamada posterior:
  ```js
  const UI = bridge.require('ui');
  const card = UI.F(figma.currentPage, { dir:'v', w:300, r:20, fill:'#fff' });
  ```
- Los módulos se persisten en el **documento**, así que al reabrir el archivo siguen ahí.
- Si el plugin se recarga, `bridge.state` se borra pero los módulos definidos **no** (viven en el
  documento). Lo que no sobrevive hay que guardarlo con `bridge.store`.

### Qué módulos llevarse (genéricos) y cuáles no

| Módulo (en `../modules/`) | ¿Reutilizable en otro proyecto? |
|---|---|
| `btq` | **Sí** — auditoría de contraste WCAG (no depende de la marca). Renómbralo p. ej. `q`. |
| `btvis` | **Sí** — auditor de contraste con fondo real. |
| `btlg` | Sí, como **referencia** del patrón "liquid glass" (depende de variables de tema propias). |
| `btt` | Solo como **ejemplo** de cómo montar temas con variables de Figma; sus 20 tokens son de Borondo. |
| `bt` | **Ejemplo** de un módulo base (colores, fuentes, primitivas `F`/`T`/`I`, botones). Cópialo y cambia la paleta y las fuentes por las del nuevo proyecto. |
| `btmap`, `btflow`, `btmx*`, `btstate*`, `btp`, `btm`, `btd`, … | **No** — son pantallas, el mapa de Colombia y temas específicos de Borondo. |

### Plantilla mínima de un módulo base para el proyecto nuevo

Está en `modulo-base.ejemplo.js` de esta carpeta: un `ui` con `F` (frame con auto-layout), `T`
(texto) y `sol` (color), sin nada de Borondo. Es el punto de partida: el compañero le pone su
paleta y sus fuentes y a partir de ahí construye sus botones, tarjetas, etc.

### Cargar un módulo desde un archivo `.js`

El plugin no lee archivos del disco: hay que pasar el **contenido** del `.js` como string a
`bridge.define`. En Kiro basta pedirle al agente: *"define el módulo `ui` con el contenido de
`modulo-base.ejemplo.js`"* y él hace la llamada `bridge.define('ui', <contenido>)`.

---

## D. Reglas de seguridad del plugin (importantes, aplican a cualquier proyecto)

Vienen de nuestra experiencia (ver `.kiro/steering/13-figma-bridge-safety.md`):

- **Capturas:** `capture:false` por defecto; cuando se capture, usar `capture_node_ids` de un nodo
  pequeño y `scale ≤ 1`. Nunca capturar la página entera (cierra el chat).
- **Fuentes:** cargar con `await ensureFont(familia, estilo)` y usar el `fontName` que devuelve. Los
  nombres exactos varían por equipo (p. ej. Inter "Semi Bold" con espacio, Sora "SemiBold" sin
  espacio). No llamar `figma.listAvailableFontsAsync()` (es lento).
- **Lotes:** construir por secciones, una llamada por sección; los trabajos largos van con
  `async: true`. Devolver resultados pequeños (`{k:3}`), no árboles de nodos (satura al devolver).
- **Nombres reservados:** no declarar `log` ni `n` en el cuerpo de `figma_execute_code`.
- **`findAll` sobre toda la página** puede tumbar el puente: recorrer frame por frame.

---

## E. Resumen para el compañero (lo mínimo)

1. Instalar el Antigravity Bridge → agregar `figma-bridge` a su `mcp.json` con su propio token.
2. Correr `install-plugin.ps1` para dejar nuestro `code.js` parcheado → importar el plugin en Figma.
3. Copiar esta carpeta `compartir/` a su proyecto. Usar `modulo-base.ejemplo.js` como punto de
   partida de su módulo `ui`, y `btq`/`btvis` para auditar contraste.
4. Pedirle al agente de Kiro: *"define el módulo ui con el contenido de modulo-base.ejemplo.js y
   créame la primera pantalla"*.
