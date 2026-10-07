/**
 * Pruebas de la lógica pura del runtime de las vistas de Figma: acceso de demostración, catálogo,
 * formulario de contacto, documentos legales y traducción de frases con partes variables.
 */
import { describe, expect, it } from "vitest";
import {
  AUTH_LIMITS,
  DEMO_ACCOUNT,
  authenticate,
  createChallenge,
  createSession,
  hashPassword,
  initialsOf,
  isLocked,
  isSessionValid,
  isStrongPassword,
  maskEmail,
  otpFromBytes,
  registerFailure,
  safeNext,
  upsertUser,
  validateEmail,
  validateName,
  verifyOtp,
  type DemoUser,
} from "./auth";
import {
  CATALOG,
  EMPTY_FILTERS,
  PAGE_SIZE,
  discountOf,
  filtersToParams,
  formatCop,
  parseFilters,
  searchCatalog,
  tourBySlug,
} from "./catalog";
import { CONTACT_LIMITS, isBot, validateContact, validatePhone } from "./contact";
import { LEGAL_COMPANY, LEGAL_DOCS } from "./legal";
import { translatePhrase } from "./i18n";
import { CONTENT_DICTIONARY } from "./i18n-content";

describe("auth (demo)", () => {
  it("solo acepta destinos internos en ?next (sin redirección abierta)", () => {
    expect(safeNext("/mis-reservas")).toBe("/mis-reservas");
    expect(safeNext("https://evil.com")).toBeNull();
    expect(safeNext("//evil.com")).toBeNull();
    expect(safeNext("/\\evil.com")).toBeNull();
    expect(safeNext(null)).toBeNull();
  });

  it("valida correos y nombres", () => {
    expect(validateEmail("")).toBe("required");
    expect(validateEmail("ana@correo.com")).toBeNull();
    expect(validateEmail("ana@@correo.com")).toBe("invalid");
    expect(validateEmail("ana..b@correo.com")).toBe("invalid");
    expect(validateName("Jo")).toBe("too-short");
    expect(validateName("María José O'Neil-Pérez")).toBeNull();
    expect(validateName("Ana123")).toBe("invalid");
  });

  it("exige contraseña de 8+ caracteres con mayúscula y número (RF-F02)", () => {
    expect(isStrongPassword("borondo2026")).toBe(false);
    expect(isStrongPassword("Borondo")).toBe(false);
    expect(isStrongPassword("Borondo2026")).toBe(true);
  });

  it("enmascara el correo y arma iniciales", () => {
    expect(maskEmail("andres.morales@correo.com")).toMatch(/^an.+@correo\.com$/);
    expect(initialsOf("Andrés Morales")).toBe("AM");
    expect(initialsOf("")).toBe("BT");
  });

  it("bloquea tras 5 intentos fallidos durante 15 minutos (RF-F04)", () => {
    let record = undefined as ReturnType<typeof registerFailure> | undefined;
    const now = 1_000_000;
    for (let i = 0; i < AUTH_LIMITS.maxLoginAttempts; i++) record = registerFailure(record, now);
    expect(isLocked(record, now)).toBe(true);
    expect(isLocked(record, now + AUTH_LIMITS.lockMs + 1)).toBe(false);
  });

  it("verifica el OTP: correcto, incorrecto, vencido y agotado", () => {
    const now = 0;
    const code = otpFromBytes(new Uint32Array([123]));
    expect(code).toBe("000123");
    const challenge = createChallenge({ email: "a@b.co", purpose: "register" } as never, code, now);
    expect(verifyOtp(challenge, "000123", now)).toEqual({ ok: true });
    expect(verifyOtp(challenge, "12", now)).toMatchObject({ ok: false, reason: "format" });
    expect(verifyOtp(challenge, "999999", now + AUTH_LIMITS.otpTtlMs + 1)).toMatchObject({ ok: false, reason: "expired" });
    let current = challenge;
    let last: ReturnType<typeof verifyOtp> = { ok: true };
    for (let i = 0; i < AUTH_LIMITS.otpAttempts; i++) {
      last = verifyOtp(current, "999999", now);
      if (!last.ok && last.challenge) current = last.challenge;
    }
    expect(last).toMatchObject({ ok: false, reason: "exhausted" });
  });

  it("autentica contra el hash con salt y crea sesiones válidas", async () => {
    const salt = "abc123";
    const user: DemoUser = { email: DEMO_ACCOUNT.email, name: DEMO_ACCOUNT.name, salt, hash: await hashPassword(DEMO_ACCOUNT.password, salt), createdAt: DEMO_ACCOUNT.createdAt };
    expect(await authenticate([user], DEMO_ACCOUNT.email, DEMO_ACCOUNT.password)).toMatchObject({ email: DEMO_ACCOUNT.email });
    expect(await authenticate([user], DEMO_ACCOUNT.email, "Otra2026")).toBeNull();
    const session = createSession(user, false, 0);
    expect(isSessionValid(session, 1)).toBe(true);
    expect(isSessionValid({ email: 1 }, 1)).toBe(false);
    expect(upsertUser([user], { ...user, name: "Otro" })).toHaveLength(1);
  });
});

describe("catálogo", () => {
  it("cada tour tiene slug único y su detalle se resuelve", () => {
    const slugs = CATALOG.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(tourBySlug("parque-tayrona-y-playas")?.name).toBe("Parque Tayrona y playas");
  });

  it("los filtros viajan en la URL y vuelven iguales", () => {
    const filters = { ...EMPTY_FILTERS, q: "café", regions: ["eje-cafetero" as const], types: ["PASADIA" as const], min: 100_000 };
    const back = parseFilters(filtersToParams(filters));
    expect(back).toMatchObject({ q: "café", regions: ["eje-cafetero"], types: ["PASADIA"], min: 100_000 });
  });

  it("filtra por región y tipo (combinación AND)", () => {
    const list = searchCatalog({ ...EMPTY_FILTERS, regions: ["caribe"], types: ["PASADIA"] });
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((t) => t.region === "caribe" && t.type === "PASADIA")).toBe(true);
  });

  it("la búsqueda ignora tildes y mayúsculas", () => {
    expect(searchCatalog({ ...EMPTY_FILTERS, q: "PARAMO" }).map((t) => t.slug)).toContain("senderismo-al-paramo");
  });

  it("ordena por precio y respeta el rango", () => {
    const asc = searchCatalog({ ...EMPTY_FILTERS, sort: "precio-asc" });
    expect(asc.map((t) => t.price)).toEqual([...asc.map((t) => t.price)].sort((a, b) => a - b));
    const cheap = searchCatalog({ ...EMPTY_FILTERS, max: 150_000 });
    expect(cheap.every((t) => t.price <= 150_000)).toBe(true);
  });

  it("formatea pesos y descuentos", () => {
    expect(formatCop(178_500)).toBe("$178.500");
    expect(discountOf(CATALOG[0]!)).toBe("-15%");
    expect(PAGE_SIZE).toBe(6);
  });
});

describe("contacto", () => {
  const valid = { name: "Laura Gómez", email: "laura@example.com", phone: "+57 300 123 4567", message: "Quiero información del Cocora.", consent: true, honeypot: "" };

  it("acepta un mensaje válido", () => {
    expect(validateContact(valid)).toEqual({});
  });

  it("exige nombre, correo, mensaje y consentimiento", () => {
    const errors = validateContact({ ...valid, name: "", email: "x", message: "hola", consent: false });
    expect(Object.keys(errors).sort()).toEqual(["consent", "email", "message", "name"]);
  });

  it("valida teléfonos colombianos y extranjeros", () => {
    expect(validatePhone("")).toBeNull();
    expect(validatePhone("+57 ")).toBeNull();
    expect(validatePhone("+57 3001234567")).toBeNull();
    expect(validatePhone("+57 1234567890")).not.toBeNull();
    expect(validatePhone("+1 305 555 0100")).toBeNull();
    expect(validatePhone("+1 12")).not.toBeNull();
  });

  it("detecta bots por el campo trampa y limita el envío", () => {
    expect(isBot({ ...valid, honeypot: "spam" })).toBe(true);
    expect(isBot(valid)).toBe(false);
    expect(CONTACT_LIMITS.throttleMs).toBeGreaterThanOrEqual(30_000);
  });
});

describe("legal", () => {
  it("cada documento trae resumen y secciones con texto", () => {
    for (const doc of LEGAL_DOCS) {
      expect(doc.summary.length).toBeGreaterThan(20);
      expect(doc.sections.length).toBeGreaterThan(0);
      expect(doc.sections.every((s) => s.paragraphs.length > 0)).toBe(true);
    }
  });

  it("cita el marco legal colombiano y los datos de la empresa", () => {
    const all = JSON.stringify(LEGAL_DOCS);
    for (const ref of ["Ley 1581 de 2012", "Ley 1480 de 2011", "Decreto 587 de 2016", "Ley 2300 de 2023", "Leyes 679 de 2001 y 1336 de 2009"]) {
      expect(all).toContain(ref);
    }
    expect(all).toContain(LEGAL_COMPANY.nit);
    expect(all).toContain(LEGAL_COMPANY.privacyEmail);
  });
});

describe("traducción de contenido", () => {
  it("traduce frases del diccionario de contenido", () => {
    expect(translatePhrase("Cargar más tours", "en")).toBe("Load more tours");
    expect(translatePhrase("Valle del Cocora y Salento", "fr")).toBe("Vallée de Cocora et Salento");
  });

  it("traduce la parte variable de las frases compuestas", () => {
    expect(translatePhrase("86 tours · Caribe y Eje Cafetero", "en")).toBe("86 tours · Caribbean and Coffee Region");
    expect(translatePhrase("Ordenar: Más populares", "en")).toBe("Sort: Most popular");
    expect(translatePhrase("Caribe ×", "pt")).toBe("Caribe ×");
    expect(translatePhrase("1 día · 8 horas", "en")).toBe("1 day · 8 hours");
    expect(translatePhrase("12 sep 2026 · 8 min de lectura", "en")).toBe("Sep 12, 2026 · 8 min read");
  });

  it("todas las entradas tienen las cinco traducciones", () => {
    for (const [es, map] of Object.entries(CONTENT_DICTIONARY)) {
      for (const lang of ["en", "fr", "zh", "ja", "pt"] as const) expect(map[lang], `${es} → ${lang}`).toBeTruthy();
    }
  });
});
