import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:4321/estados/explorar-cargando", { waitUntil: "load", timeout: 90000 });
await page.waitForTimeout(2000);
const info = await page.evaluate(() => {
  const cards = [...document.querySelectorAll(".bt-card--loading")];
  const g = cards[0]?.parentElement;
  const cs = g && getComputedStyle(g);
  return { n: cards.length, grid: g && [g.className, Math.round(g.getBoundingClientRect().width), cs.display, cs.flexWrap, g.children.length], first: cards[0] && [Math.round(cards[0].getBoundingClientRect().width), Math.round(cards[0].getBoundingClientRect().height)] };
});
console.log(JSON.stringify(info));
await page.screenshot({ path: "tmp-load.png", fullPage: true });
await browser.close();
