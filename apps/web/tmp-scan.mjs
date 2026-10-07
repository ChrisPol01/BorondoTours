import { chromium } from "@playwright/test";
const pages = ["/favoritos","/estados/favoritos-vacio"]; const _x = ["/favoritos", "/destinos", "/experiencias", "/estados/explorar-sugerencias", "/estados/home-promociones", "/explorar/mapa", "/blog/articulo", "/estados/favoritos-vacio"];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => localStorage.setItem("borondo.demo.session", JSON.stringify({ email: "demo@borondo.co", name: "Demo Viajero", createdAt: new Date().toISOString(), issuedAt: new Date().toISOString(), expiresAt: new Date(Date.now()+864e5).toISOString() })));
for (const p of pages) {
  await page.goto("http://localhost:4321" + p, { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(1800);
  const info = await page.evaluate(() => {
    const out = [];
    for (const h3 of document.querySelectorAll(".fig-stage h3")) {
      let n = h3.parentElement;
      for (let d = 0; n && d < 6; d++, n = n.parentElement) {
        const hasMedia = n.querySelector("img") || [...n.querySelectorAll("div")].some((x) => getComputedStyle(x).backgroundImage.includes("/fig/"));
        if (hasMedia) break;
      }
      const r = n?.getBoundingClientRect();
      out.push({ t: h3.textContent.trim().slice(0, 40), cls: n?.className?.toString().slice(0, 30), w: r && Math.round(r.width), h: r && Math.round(r.height), y: r && Math.round(r.top + scrollY) });
    }
    return out;
  });
  console.log(p, JSON.stringify(info));
  await page.screenshot({ path: "tmp-scan-" + p.replace(/\//g, "_") + ".png", fullPage: true });
}
await browser.close();
