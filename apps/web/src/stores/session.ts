/**
 * Session store del Portal B2C (Fase 1).
 *
 * Guarda el access token EXCLUSIVAMENTE en memoria mediante nanostores. Nunca
 * se escribe en `localStorage` ni en `sessionStorage` (R20.1, R20.2). El cierre
 * de sesión limpia la memoria (R20.3) y, al ser estado en memoria, una recarga
 * o el cierre de la pestaña descartan el token de forma natural (R20.4).
 *
 * El refresh token vive en una cookie `HttpOnly` gestionada por el backend y
 * queda fuera del alcance de este módulo (no accesible desde JavaScript).
 *
 * Diseño: design.md §"Seguridad frontend (R20)". TypeScript strict, sin `any`.
 */

import { atom, type ReadableAtom } from "nanostores";

/**
 * Forma del estado de sesión mantenido en memoria.
 *
 * `accessToken` es `null` cuando no hay sesión autenticada (estado inicial,
 * tras logout o tras una recarga del documento).
 */
export interface SessionState {
  readonly accessToken: string | null;
}

const initialState: SessionState = { accessToken: null };

/**
 * Átomo interno con el estado de sesión. Vive solo en memoria del runtime:
 * nunca se persiste. Se expone como `ReadableAtom` para que los consumidores se
 * suscriban a cambios (p. ej. islands React vía `@nanostores/react`) sin poder
 * reemplazar el átomo ni escribir el token por fuera de las acciones.
 */
const sessionAtom = atom<SessionState>(initialState);

/**
 * Store de solo lectura del estado de sesión, para suscripción reactiva desde
 * las islands. La escritura del token se realiza únicamente a través de
 * `setAccessToken` y `clearSession`.
 */
export const sessionStore: ReadableAtom<SessionState> = sessionAtom;

/**
 * Establece el access token en memoria (R20.1).
 *
 * @param token Access token emitido por el backend.
 */
export function setAccessToken(token: string): void {
  sessionAtom.set({ accessToken: token });
}

/**
 * Devuelve el access token actual, o `null` si no hay sesión activa.
 *
 * @returns El access token en memoria o `null`.
 */
export function getAccessToken(): string | null {
  return sessionAtom.get().accessToken;
}

/**
 * Indica si existe una sesión con access token disponible.
 *
 * @returns `true` si hay un access token en memoria; `false` en caso contrario.
 */
export function isAuthenticated(): boolean {
  return sessionAtom.get().accessToken !== null;
}

/**
 * Cierra la sesión eliminando el access token de la memoria (R20.3).
 *
 * Tras esta llamada, `getAccessToken()` devuelve `null` y ninguna solicitud
 * posterior puede leer el valor anterior.
 */
export function clearSession(): void {
  sessionAtom.set(initialState);
}
