import { chromium } from "@playwright/test";
const pages = ["/favoritos", "/destinos", "/experiencias", "/estados/explorar-sugerencias", "/estados/home-promociones", "/blog/articulo"];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => {
  localStorage.setItem("borondo.demo.session", JSON.stringify({ email: "demo@borondo.co", name: "Demo Viajero", createdAt: new Date().toISOString(), issuedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 864e5).toISOString() }));
  if (!localStorage.getItem("borondo.demo.favorites")) localStorage.setItem("borondo.demo.favorites", JSON.stringify(["parque-tayrona-y-playas", "guatape-y-el-penol", "ciudad-perdida", "senderismo-al-paramo"]));
});
const page = await ctx.newPage();
for (const p of pages) {
  await page.goto("http://localhost:4321" + p, { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(2200);
  const info = await page.evaluate(() => {
    const cards = [...document.querySelectorAll("a.bt-vcard")];
    const root = document.querySelector(".fig-stage").firstElementChild;
    return {
      url: location.pathname,
      n: cards.length,
      sizes: [...new Set(cards.map((c) => { const r = c.getBoundingClientRect(); return Math.round(r.width) + "x" + Math.round(r.height); }))],
      tops: [...new Set(cards.map((c) => Math.round(c.getBoundingClientRect().top + scrollY)))],
      rootH: Math.round(root.getBoundingClientRect().height),
      overflowX: document.documentElement.scrollWidth > innerWidth,
    };
  });
  console.log(JSON.stringify(info));
  await page.screenshot({ path: "tmp-s3-" + p.replace(/\//g, "_") + ".png", fullPage: true });
}
await browser.close();
