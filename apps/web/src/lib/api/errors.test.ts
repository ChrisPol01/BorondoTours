/**
 * Unit tests de los errores tipados de la capa de datos.
 */

import { describe, expect, it } from "vitest";

import {
  ApiClientError,
  ERROR_I18N_KEYS,
  isApiClientError,
  isRetryableError,
  resolveErrorI18nKey,
} from "./errors";

describe("resolveErrorI18nKey", () => {
  it("mapea cada tipo a una clave acotada common:error.*", () => {
    expect(resolveErrorI18nKey("timeout", null)).toBe(ERROR_I18N_KEYS.timeout);
    expect(resolveErrorI18nKey("network", null)).toBe(ERROR_I18N_KEYS.network);
    expect(resolveErrorI18nKey("http", 404)).toBe(ERROR_I18N_KEYS.notFound);
    expect(resolveErrorI18nKey("http", 500)).toBe(ERROR_I18N_KEYS.server);
    expect(resolveErrorI18nKey("http", 400)).toBe(ERROR_I18N_KEYS.generic);
    expect(resolveErrorI18nKey("backend", 200)).toBe(ERROR_I18N_KEYS.generic);
    expect(resolveErrorI18nKey("parse", null)).toBe(ERROR_I18N_KEYS.generic);
  });

  it("nunca devuelve una clave fuera de common:error.*", () => {
    const key = resolveErrorI18nKey("http", 418);
    expect(key.startsWith("common:error.")).toBe(true);
  });
});

describe("isRetryableError", () => {
  it("reintenta solo errores transitorios", () => {
    expect(isRetryableError("timeout", null)).toBe(true);
    expect(isRetryableError("network", null)).toBe(true);
    expect(isRetryableError("http", 503)).toBe(true);
    expect(isRetryableError("http", 404)).toBe(false);
    expect(isRetryableError("http", 400)).toBe(false);
    expect(isRetryableError("backend", 200)).toBe(false);
    expect(isRetryableError("parse", null)).toBe(false);
  });
});

describe("ApiClientError", () => {
  it("expone code, status, i18nKey y retryable sin filtrar detalle al i18nKey", () => {
    const err = new ApiClientError({
      kind: "backend",
      code: "quota_exceeded",
      status: 200,
      detail: "internal: PII leak sample",
    });
    expect(err.code).toBe("quota_exceeded");
    expect(err.status).toBe(200);
    expect(err.i18nKey).toBe(ERROR_I18N_KEYS.generic);
    expect(err.retryable).toBe(false);
    // El detalle técnico vive en message (logs), no en la clave visible.
    expect(err.i18nKey).not.toContain("PII");
  });

  it("es reconocible por instanceof y por el type guard", () => {
    const err = new ApiClientError({ kind: "timeout", code: "timeout", status: null });
    expect(err instanceof ApiClientError).toBe(true);
    expect(isApiClientError(err)).toBe(true);
    expect(isApiClientError(new Error("x"))).toBe(false);
  });
});
