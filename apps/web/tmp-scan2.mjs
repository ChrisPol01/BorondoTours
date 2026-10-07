import { chromium } from "@playwright/test";
const pages = ["/favoritos", "/destinos", "/experiencias", "/estados/explorar-sugerencias", "/estados/home-promociones", "/blog/articulo"];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => localStorage.setItem("borondo.demo.session", JSON.stringify({ email: "demo@borondo.co", name: "Demo Viajero", createdAt: new Date().toISOString(), issuedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 864e5).toISOString() })));
for (const p of pages) {
  await page.goto("http://localhost:4321" + p, { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(1800);
  const info = await page.evaluate(() => {
    const desc = (e) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return `${e.tagName}.${e.className.toString().slice(0, 28)} ${Math.round(r.width)}x${Math.round(r.height)}@${Math.round(r.top + scrollY)} ${cs.display}/${cs.flexDirection}/${cs.flexWrap} ov:${cs.overflow} kids:${e.children.length}`; };
    const cards = [...document.querySelectorAll(".bt-tourcard")];
    const parents = [...new Set(cards.map((c) => c.parentElement))];
    return {
      heads: [...document.querySelectorAll(".fig-stage h1, .fig-stage h2")].map((h) => h.tagName + ":" + h.textContent.trim().slice(0, 50)),
      cards: cards.length,
      parents: parents.map((p) => [desc(p), desc(p.parentElement), desc(p.parentElement.parentElement)]),
      root: desc(document.querySelector(".fig-stage").firstElementChild),
    };
  });
  console.log(p, JSON.stringify(info, null, 1));
}
await browser.close();
