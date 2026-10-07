import { describe, expect, it } from "vitest";
import { assistantMessage, quoteTemplate, whatsappUrl, AGENCY_WHATSAPP } from "./whatsapp";
import { catalogUrl, HERO_SLIDES, nextIndex, slugify, ADVISOR_CARD_MESSAGES, REGION_LABELS } from "./home";
import { DICTIONARY, parseLang, t, translatePhrase } from "./i18n";
import { LEGAL_DOCS, legalDocByAnchor } from "./legal";

describe("whatsapp", () => {
  it("arma la URL de wa.me con el número de la agencia y el texto codificado", () => {
    expect(whatsappUrl("Hola, quiero")).toBe(`https://wa.me/${AGENCY_WHATSAPP}?text=Hola%2C%20quiero`);
    expect(whatsappUrl("   ")).toBe("https://wa.me/573225249637");
  });

  it("la plantilla de cotización deja los huecos de fecha y personas", () => {
    expect(quoteTemplate("un crucero")).toBe(
      "Hola, quiero un asesor que me indique un crucero para la fecha ____ para la cantidad de _ personas adultas y _ niños, quedo atento a tu cotización.",
    );
  });

  it("el mensaje del asistente omite campos vacíos y usa singular/plural", () => {
    const msg = assistantMessage({ plan: "Personalizado", destination: " ", date: "", adults: 1, children: 2, notes: "" });
    expect(msg).toContain("plan personalizado");
    expect(msg).toContain("1 adulto y 2 niños");
    expect(msg).not.toContain("Destino");
    expect(msg).not.toContain("Fecha");
  });
});

describe("home", () => {
  it("catalogUrl solo incluye los filtros presentes", () => {
    expect(catalogUrl({})).toBe("/explorar");
    expect(catalogUrl({ type: "PASADIA" })).toBe("/explorar?tipo=PASADIA");
    expect(catalogUrl({ region: "quindio", featured: "valle-del-cocora-y-salento" })).toBe(
      "/explorar?region=quindio&destacado=valle-del-cocora-y-salento",
    );
  });

  it("nextIndex es circular en ambos sentidos", () => {
    expect(nextIndex(3, 4)).toBe(0);
    expect(nextIndex(0, 4, -1)).toBe(3);
    expect(nextIndex(0, 0)).toBe(0);
  });

  it("slugify quita tildes y signos", () => {
    expect(slugify("Valle del Cocora y Salento")).toBe("valle-del-cocora-y-salento");
    expect(slugify("Quindío")).toBe("quindio");
  });

  it("el hero tiene 4 diapositivas con 2 tours y región conocida", () => {
    expect(HERO_SLIDES).toHaveLength(4);
    for (const slide of HERO_SLIDES) {
      expect(slide.tours).toHaveLength(2);
      expect(REGION_LABELS[slide.region]).toBe(slide.regionLabel);
    }
  });

  it("cada tarjeta de asesoría tiene mensaje de WhatsApp", () => {
    expect(Object.keys(ADVISOR_CARD_MESSAGES)).toHaveLength(4);
  });
});

describe("i18n", () => {
  it("parseLang cae a español ante valores desconocidos", () => {
    expect(parseLang("fr")).toBe("fr");
    expect(parseLang("de")).toBe("es");
    expect(parseLang(null)).toBe("es");
  });

  it("traduce frases exactas y deja el español sin cambios", () => {
    expect(translatePhrase("Explorar", "en")).toBe("Explore");
    expect(translatePhrase("Explorar", "es")).toBeNull();
    expect(t("Texto sin traducción", "ja")).toBe("Texto sin traducción");
  });

  it("resuelve frases con cifras por patrón", () => {
    expect(translatePhrase("4 días · desde $1.450.000", "en")).toBe("4 days · from $1.450.000");
    expect(translatePhrase("64 tours", "fr")).toBe("64 circuits");
  });

  it("todas las entradas del diccionario tienen las 5 traducciones", () => {
    for (const value of Object.values(DICTIONARY)) {
      expect(Object.keys(value).sort()).toEqual(["en", "fr", "ja", "pt", "zh"]);
    }
  });
});

describe("legal", () => {
  it("expone las 5 anclas del colofón", () => {
    expect(LEGAL_DOCS.map((d) => d.anchor)).toEqual(["terminos", "privacidad", "cancelacion", "retracto", "cookies"]);
  });

  it("busca por ancla con o sin #", () => {
    expect(legalDocByAnchor("#cookies")?.title).toBe("Política de cookies");
    expect(legalDocByAnchor("RETRACTO")?.anchor).toBe("retracto");
    expect(legalDocByAnchor("#otro")).toBeUndefined();
  });
});
