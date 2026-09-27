# SKILL — Método de Medición Visual (Anti-Alucinación)

> **Qué es esto:** el método para describir tamaños, espaciados y proporciones de un mockup SIN inventar píxeles exactos.
> **Cómo usarla:** aplica estas reglas cada vez que vayas a reportar una medida. El objetivo no es acertar el pixel,
> es dar una medida **útil y honesta** que el implementador pueda usar, distinguiendo lo medido de lo inferido.

---

## 1. Principio central: medir por REFERENCIA, no por adivinación

No puedes conocer los píxeles absolutos de una imagen escalada. Lo que sí puedes hacer es **comparar contra anclas conocidas** y expresar todo en la escala del design system. Anclas fiables:

- **Ancho del contenedor público:** 1280px (`max-w-public`) en desktop. Úsalo como el 100% horizontal.
- **Alto del header:** 88px (5.5rem) desktop / 72px (4.5rem) mobile. Es una "regla" vertical excelente.
- **Altura de una línea de texto Body1:** ~26px (16px × 1.6). Sirve para estimar altos de bloques de texto.
- **Botón:** alto mínimo 44px (`min-h-11`).

Estima diciendo "este bloque mide aproximadamente 2 alturas de header" antes de convertir a px. Es más fiable.

## 2. Escala de espaciado permitida (redondea SIEMPRE a estos valores)

El proyecto usa una escala tipo 4/8px. Cuando estimes un gap/padding/margin, redondea al valor más cercano de:

`4, 8, 12, 16, 24, 32, 48, 64, 96 px`  (equivalen a `1,2,3,4,6,8,12,16,24` en Tailwind).

Ejemplo: si un espacio "parece unos 20-28px", repórtalo como `~24px (gap-6)`. No escribas `27px`.

## 3. Vocabulario de precisión obligatorio

Etiqueta CADA medida con su nivel de certeza:

- **Medida directa** (algo comparable a un ancla): repórtala normal, ej. `alto ~88px (= header)`.
- **Estimación:** antepón `~` , ej. `padding ~24px`.
- **Inferencia** (no se ve, lo deduces por patrón): añade `(INFERIDO)`, ej. `en mobile pasa a 1 columna (INFERIDO)`.
- **Ilegible/incierto:** escribe `[ilegible]` o `[confirmar]`. Nunca rellenes con un valor inventado.

## 4. Cómo medir cada tipo de propiedad

- **Layout de sección:** ¿flex o grid? ¿cuántas columnas? ¿el gap es chico (8-16) o grande (24-48)? ¿centrado o full-bleed?
- **Proporción de imagen:** compárala con formas conocidas — cuadrada (1/1), retrato (3/4, como TourCard), apaisada (16/9), banner (21/9). Reporta el ratio, no los px.
- **Jerarquía tipográfica:** no midas el font-size en px; **clasifícalo** por rol relativo (el texto más grande de la sección probablemente es H1/H2; el secundario Body1/Body2) y mapéalo a `text-h1..text-label`.
- **Ancho de columna/card:** exprésalo como fracción del contenedor ("~1/3 del ancho", "~320px") + el número de columnas visibles.
- **Posición vertical:** describe el orden y la separación relativa entre secciones, no coordenadas absolutas.

## 5. Detección de breakpoint del mockup

Antes de medir, decide qué viewport representa la imagen:
- Si hay 3-4 columnas de cards y navbar horizontal completa → **desktop (~1440)**.
- Si hay 1 columna, menú hamburguesa, elementos apilados → **mobile (~375)**.
- Declara el viewport al inicio; todas tus medidas se interpretan respecto a él.

## 6. Errores a evitar (causan re-trabajo)

- ❌ Dar px "exactos" imposibles de conocer (`padding: 23px`).
- ❌ Medir font-size en px en vez de asignar rol tipográfico.
- ❌ Describir posiciones como coordenadas absolutas.
- ❌ Inventar el comportamiento responsive sin marcarlo `(INFERIDO)`.
- ❌ Mezclar unidades: usa px redondeado a la escala + su clase Tailwind entre paréntesis.

## 7. Formato recomendado para una medida

> `<propiedad>: <valor redondeado> (<clase Tailwind>) [<certeza>]`
> Ejemplos:
> - `gap columnas: ~24px (gap-6)`
> - `padding sección: ~64px vertical (py-16) (INFERIDO en los bordes)`
> - `card: ratio 3/4, ~320px ancho, 3 por fila`
> - `título: rol H2 (text-h2), peso Bold`
