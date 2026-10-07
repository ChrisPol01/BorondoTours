# Fotos de prueba — B2C (placeholders)

Banco temporal de imágenes de alta calidad para los mockups de Figma y el desarrollo del B2C, mientras el portal B2B no existe.
Cuando los operadores suban sus fotos (Spec-I RF-I04, paso "Multimedia"), estas imágenes se reemplazan.

## Reglas
- Son **solo de prueba**: no se publican como fotos oficiales de un tour ni se asocian a un operador real (marca blanca).
- No incluyen personas identificables en primer plano ni menores de edad.
- Formato: JPG, 2560px de ancho (≈16:9 o 3:2), calidad 80. Para código se convierten a WebP con srcset 400/800/1200 (Spec-A RF-A12).
- El registro completo (autor, enlace, ID) está en `fuentes.json`.

## Fuentes y licencia
- Fotos `destino-*` y `exp-*` en JPG: **Unsplash** bajo la [Unsplash License](https://unsplash.com/license) (uso gratuito, comercial permitido, atribución no obligatoria). No se pueden vender sin modificar ni usar para crear un servicio de fotos competidor.
- `destino-ciudad-perdida.png`: imagen propia de BorondoTours (copia de `../web/fondo ciudad perdida.png`), 1536×1024.
- `destino-ciudad-perdida-hd.jpg`: la misma imagen escalada con super-resolución (Real-ESRGAN x4plus → reducida a 3072×2048). **Usar esta** en hero y producción.

## Subida a Figma (medido 2026-09-27)
- Verificado: el hero HD de 3072 px (1,3 MB) subió en 0,65 s.
- Fotos de 1–3 MB (hasta 2560 px) suben en 1–3 s con `figma_execute_code` en modo `async: true` + `figma_job_status`. Se usan los originales; no hacen falta copias livianas.
- Figma reduce automáticamente cualquier imagen mayor a 4096 px por lado → no subir más grande.
- Lo que bloqueaba el plugin era pedir `capture: true` del frame completo (1440×1920) en la misma llamada. Capturas siempre aparte y con `scale ≤ 0.6`.
- Si algún día hace falta aligerar: `otros/design/tools/figma-assets/generar-copias-figma.ps1`.

## Inventario
| Archivo | Uso sugerido |
|---|---|
| destino-ciudad-perdida-hd.jpg | Hero de Home (3072px) |
| destino-eje-cafetero-cocora.jpg | Tour / destino Eje Cafetero |
| destino-tayrona.jpg | Tour / destino Caribe |
| destino-amazonas.jpg | Tour / destino Amazonas |
| destino-cartagena.jpg | Tour / destino Cartagena |
| destino-guatape.jpg | Tour / destino Antioquia |
| destino-san-andres.jpg | Tour / destino San Andrés |
| destino-pacifico.jpg | Tour / destino Pacífico |
| destino-tatacoa.jpg | Tour / destino Huila |
| destino-andes.jpg | Destino Andes / cabeceras de sección |
| exp-avistamiento-aves.jpg | Experiencia avistamiento de aves |
| exp-trekking.jpg | Experiencia trekking |
| exp-cafe.jpg | Experiencia cafetera |
| exp-gastronomia.jpg | Experiencia gastronómica |
| exp-navegacion-rio.jpg | Experiencia navegación (Amazonas) |
| exp-pueblo-patrimonio.jpg | Experiencia cultural / pueblos |
| exp-finca-tradicional.jpg | Experiencia rural / finca |
| exp-paramo.jpg | Experiencia páramo (frailejones) |
