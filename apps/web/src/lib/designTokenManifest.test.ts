import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DERIVED_TOKEN_PROVENANCE } from "./designTokenManifest";

const tokensCss = readFileSync(new URL("../styles/tokens.css", import.meta.url), "utf8");
const globalCss = readFileSync(new URL("../styles/global.css", import.meta.url), "utf8");
const packageJson = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

describe("Ave Azul design-system foundations", () => {
  it("declares every canonical color once and builds gradients from primitives", () => {
    for (const color of ["103b66", "2364aa", "00b7c7", "79c142", "f3e8d1", "fdb813", "f9fbfc", "101010"]) {
      expect(tokensCss.match(new RegExp(`#${color}\\b`, "gi"))).toHaveLength(1);
    }
    expect(tokensCss).toContain("linear-gradient(135deg, var(--brand-turquesa-laguna), var(--brand-verde-frailejon))");
    expect(tokensCss).toContain("linear-gradient(135deg, var(--brand-azul-profundo), var(--brand-turquesa-laguna))");
  });

  it("keeps complete, unique provenance for every documented derivative", () => {
    const names = DERIVED_TOKEN_PROVENANCE.map(({ name }) => name);
    const required = [...tokensCss.matchAll(/^\s+(--(?:derived|layout|shape|border|elevation|glass|logo|icon|motion)-[a-z0-9-]+):/gm)].map((match) => match[1]);
    required.push("--semantic-border-subtle");
    expect(new Set(names).size).toBe(names.length);
    expect([...names].sort()).toEqual([...required].sort());
    for (const entry of DERIVED_TOKEN_PROVENANCE) {
      expect(tokensCss).toContain(`${entry.name}:`);
      expect(entry.anchors.length).toBeGreaterThan(0);
      expect(entry.allowedUse).not.toBe("");
      expect(entry.wcagEvidence).not.toBe("");
    }
  });

  it("provides opaque glass fallback, intrinsic logo sizing, and reduced motion at 100ms", () => {
    expect(globalCss).toMatch(/@supports not \(backdrop-filter: blur\(1px\)\)[\s\S]*var\(--glass-fallback\)/);
    expect(globalCss).toContain("block-size: auto");
    expect(globalCss).toMatch(/prefers-reduced-motion: reduce[\s\S]*var\(--motion-duration-reduced\)/);
    expect(tokensCss).toContain("--motion-duration-reduced: 100ms");
    expect(tokensCss).toContain("--semantic-text-on-action: var(--brand-negro-volcanico)");
  });

  it("excludes GSAP and Three.js from production and development dependencies", () => {
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    expect(Object.keys(dependencies).some((name) => /(^|\/)gsap$|(^|\/)three$|react-three/i.test(name))).toBe(false);
  });
});
