import { afterEach, describe, expect, it } from "vitest";

import { DEFAULT_THEME, parseTheme, setTheme, themeStore } from "./theme";

describe("theme", () => {
  afterEach(() => {
    setTheme(DEFAULT_THEME);
    window.localStorage.clear();
  });

  it("parseTheme acepta valores válidos y cae al predeterminado", () => {
    expect(parseTheme("oscuro")).toBe("oscuro");
    expect(parseTheme("rojo")).toBe(DEFAULT_THEME);
    expect(parseTheme(null)).toBe(DEFAULT_THEME);
  });

  it("setTheme aplica data-theme, guarda y actualiza el store", () => {
    setTheme("claro");
    expect(document.documentElement.getAttribute("data-theme")).toBe("claro");
    expect(window.localStorage.getItem("borondo.theme")).toBe("claro");
    expect(themeStore.get()).toBe("claro");
  });

  it("el tema colorido quita el atributo", () => {
    setTheme("oscuro");
    setTheme("colorido");
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });
});
