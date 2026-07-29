# Fuentes web auto-alojadas — Portal B2C

Estos archivos `.woff2` son consumidos por `src/styles/fonts.css` y precargados
desde `src/layouts/Base.astro`. Se sirven desde la raíz del sitio: un archivo en
`public/fonts/sora-bold.woff2` queda disponible en `/fonts/sora-bold.woff2`.

## Archivos requeridos (exactamente estos pesos — R2.3)

| Familia | Peso | Nombre CSS | Archivo esperado |
|---------|------|------------|------------------|
| Sora    | 800 (ExtraBold) | `Sora` / 800 | `sora-extrabold.woff2` |
| Sora    | 700 (Bold)      | `Sora` / 700 | `sora-bold.woff2` |
| Sora    | 600 (SemiBold)  | `Sora` / 600 | `sora-semibold.woff2` |
| Inter   | 400 (Regular)   | `Inter` / 400 | `inter-regular.woff2` |
| Inter   | 600 (SemiBold)  | `Inter` / 600 | `inter-semibold.woff2` |

No agregar otros pesos ni variantes italic: el diseño solo usa estos cinco (R2.3).

## Origen de las fuentes

- **Sora**: <https://fonts.google.com/specimen/Sora> (SIL Open Font License 1.1)
- **Inter**: <https://fonts.google.com/specimen/Inter> (SIL Open Font License 1.1)

## Subsetting recomendado

Para minimizar el peso y mejorar CLS/LCP, subsetear a `latin` + `latin-ext`
(cubre español) y convertir a woff2. Ejemplo con `fonttools`:

```bash
# pip install fonttools brotli
pyftsubset Sora-ExtraBold.ttf \
  --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD" \
  --flavor=woff2 --output-file=sora-extrabold.woff2
# repetir para los otros 4 pesos
```

## Recalibrar métricas del respaldo (R2.5 — CLS < 0.1)

Las familias `Sora Fallback` e `Inter Fallback` en `fonts.css` usan
`size-adjust` / `ascent-override` / `descent-override` / `line-gap-override`
para que el texto ocupe casi el mismo espacio con la fuente de respaldo del
sistema mientras carga la fuente web, evitando saltos de layout.

Los valores de Inter ya están calibrados contra Arial. Los de Sora son una
aproximación inicial y **deben recalibrarse** con los `.woff2` reales usando,
por ejemplo:

- [Fontaine](https://github.com/unjs/fontaine)
- [`@capsizecss/core`](https://github.com/seek-oss/capsize) + `fontkit`
- El generador de métricas de Next.js (`next/font`)

Verificar el resultado con Lighthouse / WebPageTest asegurando CLS < 0.1.
