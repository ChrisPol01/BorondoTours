/**
 * Unit tests del cliente de fetch (contrato { data, error, meta }).
 *
 * Se inyecta `fetchImpl` para ejercitar la lógica real sin red ni mocks de
 * funcionalidad: se construyen respuestas `Response` deterministas.
 */

import { describe, expect, it, vi } from "vitest";

import { apiFetch, parseApiResponse } from "./client";
import { ApiClientError, isApiClientError } from "./errors";
import { shouldRetry } from "./queryClient";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("parseApiResponse", () => {
  it("mapea data a camelCase y conserva error/meta", () => {
    const parsed = parseApiResponse<{ basePriceCop: number }>({
      data: { base_price_cop: 100 },
      error: null,
      meta: { page_size: 12, total: 30 },
    });
    expect(parsed.data).toEqual({ basePriceCop: 100 });
    expect(parsed.error).toBeNull();
    expect(parsed.meta).toEqual({ pageSize: 12, total: 30 });
  });

  it("lanza parse error si el cuerpo no es un sobre", () => {
    expect(() => parseApiResponse<unknown>(42)).toThrow(ApiClientError);
  });
});

describe("apiFetch — contrato de respuesta", () => {
  it("devuelve data mapeada a camelCase en 2xx con datos", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ data: { operator_name: "Op" }, error: null, meta: null }),
    );
    const data = await apiFetch<{ operatorName: string }>("/tours/x", { fetchImpl });
    expect(data).toEqual({ operatorName: "Op" });
  });

  it("devuelve null cuando data y error son null (estado vacío)", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ data: null, error: null, meta: null }));
    const result = await apiFetch("/home/page-data", { fetchImpl });
    expect(result).toBeNull();
  });

  it("lanza ApiClientError cuando error != null en 2xx", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ data: null, error: { code: "not_published", message: "raw detail" }, meta: null }),
    );
    await expect(apiFetch("/tours/x", { fetchImpl })).rejects.toMatchObject({
      kind: "backend",
      code: "not_published",
    });
  });

  it("lanza ApiClientError con status en respuestas no 2xx", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ data: null, error: { code: "missing", message: "" }, meta: null }, 404),
    );
    try {
      await apiFetch("/tours/x", { fetchImpl });
      expect.unreachable("debió lanzar");
    } catch (err) {
      expect(isApiClientError(err)).toBe(true);
      if (isApiClientError(err)) {
        expect(err.kind).toBe("http");
        expect(err.status).toBe(404);
        expect(err.i18nKey).toBe("common:error.notFound");
      }
    }
  });

  it("trata un 2xx con cuerpo vacío como estado vacío", async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 204 }));
    const result = await apiFetch("/x", { fetchImpl });
    expect(result).toBeNull();
  });
});

describe("apiFetch — timeout y cancelación (R21.3)", () => {
  it("lanza error de timeout cuando se supera timeoutMs", async () => {
    const fetchImpl: typeof fetch = (_url, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("aborted", "AbortError"));
        });
      });
    try {
      await apiFetch("/slow", { fetchImpl, timeoutMs: 10 });
      expect.unreachable("debió lanzar timeout");
    } catch (err) {
      expect(isApiClientError(err)).toBe(true);
      if (isApiClientError(err)) {
        expect(err.kind).toBe("timeout");
        expect(err.i18nKey).toBe("common:error.timeout");
      }
    }
  });

  it("propaga la cancelación externa sin convertirla en ApiClientError", async () => {
    const controller = new AbortController();
    controller.abort();
    const fetchImpl: typeof fetch = (_url, init) =>
      new Promise((_resolve, reject) => {
        const abortError = new DOMException("aborted", "AbortError");
        if (init?.signal?.aborted === true) {
          reject(abortError);
          return;
        }
        init?.signal?.addEventListener("abort", () => reject(abortError));
      });
    await expect(
      apiFetch("/cancelled", { fetchImpl, signal: controller.signal }),
    ).rejects.not.toBeInstanceOf(ApiClientError);
  });
});

describe("shouldRetry (política de reintentos sin layout shift)", () => {
  it("reintenta errores transitorios hasta el máximo", () => {
    const timeout = new ApiClientError({ kind: "timeout", code: "timeout", status: null });
    expect(shouldRetry(0, timeout)).toBe(true);
    expect(shouldRetry(2, timeout)).toBe(false);
  });

  it("no reintenta 4xx ni errores de negocio", () => {
    const notFound = new ApiClientError({ kind: "http", code: "x", status: 404 });
    const backend = new ApiClientError({ kind: "backend", code: "x", status: 200 });
    expect(shouldRetry(0, notFound)).toBe(false);
    expect(shouldRetry(0, backend)).toBe(false);
  });
});
