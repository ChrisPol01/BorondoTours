/**
 * Formulario de contacto real (Nosotros y /contacto): campos con tipo, límites y validación,
 * consentimiento obligatorio, anti-spam (campo trampa + 30 s entre envíos), envío simulado,
 * aviso "¡Mensaje enviado!" accesible y limpieza del formulario. Sin backend: no se guarda nada.
 */
import { CONTACT_LIMITS, isBot, validateContact, type ContactErrors } from "../contact";
import { getStage, h, markHandled, textOf } from "./dom";
import { translateTree } from "./i18n-dom";
import { growWithContent } from "./layout";
import { createPanel } from "./panel";
import { button } from "./ui-kit";

type Key = "name" | "email" | "phone" | "message" | "motive";

const LABELS: readonly [RegExp, Key][] = [
  [/^Nombre completo$/, "name"],
  [/^Correo electrónico$/, "email"],
  [/^Teléfono/, "phone"],
  [/^Mensaje$/, "message"],
  [/^Motivo$/, "motive"],
];

const MOTIVES = ["Quiero información de un tour", "Tengo una reserva", "Quiero ser operador", "Prensa o alianzas", "Otro"];

function control(key: Key, placeholder: string): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  const base = { class: "bt-contact-input", id: `bt-contact-${key}`, name: key, "aria-describedby": `bt-contact-${key}-err` };
  switch (key) {
    case "name": return h("input", { ...base, type: "text", autocomplete: "name", maxlength: String(CONTACT_LIMITS.nameMax), required: "", placeholder });
    case "email": return h("input", { ...base, type: "email", autocomplete: "email", inputmode: "email", maxlength: String(CONTACT_LIMITS.emailMax), required: "", placeholder: placeholder || "tu@correo.com" });
    case "phone": return h("input", { ...base, type: "tel", autocomplete: "tel", inputmode: "tel", maxlength: String(CONTACT_LIMITS.phoneMax), placeholder: "+57 322 524 9637", value: "+57 " });
    case "message": return h("textarea", { ...base, maxlength: String(CONTACT_LIMITS.messageMax), required: "", rows: "4", placeholder });
    case "motive": {
      const select = h("select", base, MOTIVES.map((m) => h("option", { value: m }, [m])));
      return select;
    }
  }
}

function initForm(stage: HTMLElement, submit: HTMLElement): void {
  const form = submit.parentElement;
  if (!form) return;
  const fields = new Map<Key, { input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement; error: HTMLElement }>();
  for (const label of form.querySelectorAll<HTMLElement>("span")) {
    const key = LABELS.find(([re]) => re.test(textOf(label)))?.[1];
    const box = label.nextElementSibling as HTMLElement | null;
    if (!key || !box || fields.has(key)) continue;
    const input = control(key, textOf(box));
    const error = h("span", { id: `bt-contact-${key}-err`, class: "bt-auth-error", "aria-live": "polite" });
    box.replaceChildren(input);
    box.classList.add("bt-contact-box");
    box.style.height = "auto";
    box.style.padding = "0";
    label.setAttribute("id", `bt-contact-${key}-label`);
    input.setAttribute("aria-labelledby", `bt-contact-${key}-label`);
    box.after(error);
    fields.set(key, { input, error });
    if (key === "phone") input.addEventListener("input", () => { input.value = input.value.replace(/[^\d+\s()-]/g, ""); });
    if (key === "name") input.addEventListener("input", () => { input.value = input.value.replace(/[^\p{L}\p{M}' .-]/gu, ""); });
    if (key === "message") {
      const counter = h("span", { class: "bt-contact-counter", "aria-live": "polite" }, [`0 / ${CONTACT_LIMITS.messageMax}`]);
      error.after(counter);
      input.addEventListener("input", () => { counter.textContent = `${input.value.length} / ${CONTACT_LIMITS.messageMax}`; });
    }
  }

  // Consentimiento: la casilla del diseño se vuelve un checkbox real.
  const consentText = [...form.querySelectorAll<HTMLElement>("span")].find((s) => /^(Autorizo|Acepto) el tratamiento/.test(textOf(s)));
  const consentRow = consentText?.parentElement;
  const consent = h("input", { type: "checkbox", id: "bt-contact-consent", class: "bt-contact-check", "aria-describedby": "bt-contact-consent-err" });
  const consentError = h("span", { id: "bt-contact-consent-err", class: "bt-auth-error", "aria-live": "polite" });
  if (consentRow && consentText) {
    const box = [...consentRow.children].find((c) => c !== consentText);
    box?.replaceWith(consent);
    const label = h("label", { for: "bt-contact-consent", class: "bt-contact-consent-label" });
    consentText.replaceWith(label);
    label.append(consentText);
    consentRow.after(consentError);
  }
  const trap = h("input", { type: "text", name: "website", tabindex: "-1", autocomplete: "off", class: "bt-sr-only", "aria-hidden": "true" });
  form.append(trap);

  const sent = createPanel({ id: "bt-contact-sent", title: "¡Mensaje enviado!", subtitle: "Gracias por escribirnos. Una persona del equipo te responde en menos de 1 día hábil, de lunes a sábado.", narrow: true });
  const ok = button({ label: "Entendido" });
  ok.addEventListener("click", () => sent.close());
  sent.body.append(ok);

  let lastSent = 0;
  const label = submit.querySelector("span") ?? submit;
  markHandled(submit);
  submit.setAttribute("type", "button");
  submit.addEventListener("click", () => {
    const val = (k: Key): string => fields.get(k)?.input.value ?? "";
    const input = { name: val("name"), email: val("email"), phone: val("phone"), message: val("message"), consent: consent.checked, honeypot: trap.value };
    const errors: ContactErrors = validateContact(input);
    for (const [key, f] of fields) {
      const msg = errors[key as keyof ContactErrors] ?? "";
      f.error.textContent = msg;
      f.input.setAttribute("aria-invalid", msg ? "true" : "false");
      translateTree(f.error);
    }
    consentError.textContent = errors.consent ?? "";
    translateTree(consentError);
    const first = Object.keys(errors)[0] as Key | "consent" | undefined;
    if (first) { (first === "consent" ? consent : fields.get(first)?.input)?.focus(); return; }
    if (isBot(input)) return;
    if (Date.now() - lastSent < CONTACT_LIMITS.throttleMs) {
      consentError.textContent = "Ya recibimos tu mensaje. Espera unos segundos para enviar otro.";
      translateTree(consentError);
      return;
    }
    const original = label.textContent ?? "";
    label.textContent = "Enviando…";
    submit.setAttribute("aria-busy", "true");
    submit.setAttribute("aria-disabled", "true");
    window.setTimeout(() => {
      lastSent = Date.now();
      label.textContent = original;
      submit.removeAttribute("aria-busy");
      submit.removeAttribute("aria-disabled");
      for (const [key, f] of fields) f.input.value = key === "phone" ? "+57 " : key === "motive" ? MOTIVES[0] ?? "" : "";
      consent.checked = false;
      form.querySelectorAll(".bt-contact-counter").forEach((c) => { c.textContent = `0 / ${CONTACT_LIMITS.messageMax}`; });
      sent.open(fields.get("name")?.input as HTMLElement);
    }, 900);
  });
  // El formulario y su tarjeta tenían alto fijo: crecen con los campos reales y empujan lo de abajo.
  growWithContent(stage, form);
}

export function initContact(): void {
  const stage = getStage();
  const path = location.pathname.replace(/\/$/, "");
  if (!stage || (path !== "/nosotros" && path !== "/contacto")) return;
  for (const btn of stage.querySelectorAll<HTMLElement>("button, a")) {
    if (textOf(btn) === "Enviar mensaje") initForm(stage, btn);
  }
}
