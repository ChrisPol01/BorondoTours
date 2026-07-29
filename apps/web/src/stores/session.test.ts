import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearSession,
  getAccessToken,
  isAuthenticated,
  sessionStore,
  setAccessToken,
} from './session';

/**
 * Unit tests de seguridad del session store (Tarea 7.2).
 *
 * Verifican que el access token vive EXCLUSIVAMENTE en memoria y que nunca se
 * escribe en almacenamiento persistente del navegador, además de la limpieza
 * en logout.
 *
 * Cubre:
 * - R20.1: token exclusivamente en memoria (nanostores).
 * - R20.2: nunca en `localStorage` ni `sessionStorage`.
 * - R20.3: logout elimina el token de memoria.
 */
describe('sessionStore — seguridad', () => {
  beforeEach(() => {
    // Estado limpio antes de cada test (el átomo es un singleton de módulo).
    clearSession();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearSession();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('almacenamiento en memoria (R20.1)', () => {
    it('setAccessToken guarda el token y getAccessToken lo devuelve', () => {
      expect(getAccessToken()).toBeNull();

      setAccessToken('token-abc-123');

      expect(getAccessToken()).toBe('token-abc-123');
      expect(sessionStore.get().accessToken).toBe('token-abc-123');
    });

    it('isAuthenticated refleja la presencia del token en memoria', () => {
      expect(isAuthenticated()).toBe(false);

      setAccessToken('token-abc-123');
      expect(isAuthenticated()).toBe(true);
    });

    it('setAccessToken reemplaza el token previo en memoria', () => {
      setAccessToken('token-viejo');
      setAccessToken('token-nuevo');

      expect(getAccessToken()).toBe('token-nuevo');
    });
  });

  describe('sin escritura en almacenamiento persistente (R20.1, R20.2)', () => {
    it('setAccessToken no invoca localStorage.setItem ni sessionStorage.setItem', () => {
      const localSpy = vi.spyOn(Storage.prototype, 'setItem');

      setAccessToken('token-secreto');

      expect(localSpy).not.toHaveBeenCalled();
    });

    it('clearSession no invoca localStorage.setItem ni sessionStorage.setItem', () => {
      setAccessToken('token-secreto');
      const setSpy = vi.spyOn(Storage.prototype, 'setItem');
      const removeSpy = vi.spyOn(Storage.prototype, 'removeItem');

      clearSession();

      // No se escribe ni se toca ningún almacenamiento persistente.
      expect(setSpy).not.toHaveBeenCalled();
      expect(removeSpy).not.toHaveBeenCalled();
    });

    it('el valor del token no queda presente en localStorage tras setAccessToken', () => {
      const token = 'token-que-no-debe-persistir';
      setAccessToken(token);

      expect(localStorage.length).toBe(0);
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        expect(key === null ? '' : localStorage.getItem(key)).not.toBe(token);
      }
    });

    it('el valor del token no queda presente en sessionStorage tras setAccessToken', () => {
      const token = 'token-que-no-debe-persistir';
      setAccessToken(token);

      expect(sessionStorage.length).toBe(0);
      for (let i = 0; i < sessionStorage.length; i += 1) {
        const key = sessionStorage.key(i);
        expect(key === null ? '' : sessionStorage.getItem(key)).not.toBe(token);
      }
    });
  });

  describe('limpieza en logout (R20.3)', () => {
    it('clearSession borra el token de memoria', () => {
      setAccessToken('token-abc-123');
      expect(getAccessToken()).toBe('token-abc-123');

      clearSession();

      expect(getAccessToken()).toBeNull();
      expect(isAuthenticated()).toBe(false);
      expect(sessionStore.get().accessToken).toBeNull();
    });

    it('ninguna lectura posterior a clearSession puede recuperar el valor anterior', () => {
      setAccessToken('token-abc-123');
      clearSession();

      // Simula solicitudes posteriores leyendo el token.
      expect(getAccessToken()).toBeNull();
      expect(getAccessToken()).toBeNull();
    });
  });
});
