/// <reference types="astro/client" />

/**
 * Declaración de variables de entorno públicas del Portal B2C.
 *
 * Astro expone las variables con prefijo `PUBLIC_` en `import.meta.env`.
 * Solo se declaran aquí las que usa el frontend directamente.
 */
interface ImportMetaEnv {
  /** Token de acceso de Mapbox GL JS para el mapa del catálogo (R14.8). */
  readonly PUBLIC_MAPBOX_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
