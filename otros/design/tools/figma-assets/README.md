# Herramientas de assets para Figma (MCP Bridge)

Todo vive en el repositorio (costo $0, no se borra al reiniciar). Nada depende de carpetas temporales.

| Archivo | Para qué |
|---|---|
| `servidor-local.mjs` | Sirve `otros/design/` en `http://127.0.0.1:8777` para que el plugin de Figma lea logos y fotos (`node otros/design/tools/figma-assets/servidor-local.mjs`). |
| `escalar-imagen.ps1` | Sube la resolución de una foto con Real-ESRGAN x4plus y la guarda como JPG (ej. Ciudad Perdida 1536 → 3072 px). El binario se cachea en `%LOCALAPPDATA%\borondo-tools`. |
| `generar-copias-figma.ps1` | Regenera `b2c/fotos-test/figma-1600/` (JPG livianos para Figma) desde las fotos originales. |
| `buscar-unsplash.mjs` | Busca candidatos por destino en Unsplash (sin premium) → JSON. `node buscar-unsplash.mjs salida.json` |
| `hoja-contactos.ps1` | Arma una hoja de miniaturas para elegir fotos visualmente. |
| `descargar-seleccion.mjs` | Descarga las fotos elegidas a 2560px y regenera `fuentes.json`. |
| `candidatos-unsplash.json` | Última búsqueda de candidatos (referencia). |

## Carga de imágenes en el plugin
- `figma.createImageAsync(url)` falla en este host → usar `fetch(url)` → `arrayBuffer()` → `figma.createImage(bytes)`.
- Subir los originales con `async: true` y consultar `figma_job_status`. Nunca pedir `capture` del frame completo en la misma llamada. Límites medidos en `b2c/fotos-test/README.md`.
- `generar-copias-figma.ps1` queda como respaldo si una imagen pesada llegara a bloquear el plugin.
- No enviar un `User-Agent` personalizado a `unsplash.com/napi` (responde 401).
