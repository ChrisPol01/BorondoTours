/**
 * Acceso de DEMOSTRACIÓN (sin backend): reemplaza el diálogo estático de Figma por uno funcional
 * en /iniciar-sesion, /crear-cuenta, /verificar-codigo y /recuperar-contrasena. Guarda la sesión
 * de prueba en el navegador, protege las rutas privadas, exige sesión al pagar y muestra el
 * nombre del usuario en navbar y sidebar. Lógica pura en ../auth.ts.
 */
import {
  accountExists, AUTH_LIMITS, AUTH_PATHS, AUTH_STORAGE, authenticate, authUrl, createChallenge, createSession,
  DEMO_ACCOUNT, DEMO_GOOGLE_ACCOUNT, firstNameOf, hashPassword, initialsOf, isCheckoutContext, isLocked,
  isPrivatePath, isSessionValid, isStrongPassword, maskEmail, memberSince, minutesLeft, normalizeEmail,
  normalizeName, otpFromBytes, passwordChecks, registerFailure, safeNext, saltFromBytes, upsertUser,
  validateEmail, validateName, verifyOtp, type AttemptRecord, type AuthMode, type DemoSession, type DemoUser,
  type OtpChallenge,
} from "../auth";
import { focusables, getStage, h, markHandled, textOf } from "./dom";
import { translateTree } from "./i18n-dom";
import { pageRoot } from "./layout";

/* ---------------- Storage ---------------- */

function read<T>(store: Storage, key: string): T | undefined {
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}
function write(store: Storage, key: string, value: unknown): void {
  try { store.setItem(key, JSON.stringify(value)); } catch { /* sin storage */ }
}
function drop(store: Storage, key: string): void {
  try { store.removeItem(key); } catch { /* sin storage */ }
}

export function getSession(): DemoSession | null {
  const now = Date.now();
  for (const store of [sessionStorage, localStorage]) {
    const s = read<DemoSession>(store, AUTH_STORAGE.session);
    if (isSessionValid(s, now)) return s;
  }
  return null;
}

function saveSession(session: DemoSession): void {
  drop(sessionStorage, AUTH_STORAGE.session);
  drop(localStorage, AUTH_STORAGE.session);
  write(session.expiresAt ? localStorage : sessionStorage, AUTH_STORAGE.session, session);
}

export function signOut(): void {
  drop(sessionStorage, AUTH_STORAGE.session);
  drop(localStorage, AUTH_STORAGE.session);
  location.assign("/");
}

const users = (): DemoUser[] => read<DemoUser[]>(localStorage, AUTH_STORAGE.users) ?? [];
const attempts = (): Record<string, AttemptRecord> => read(localStorage, AUTH_STORAGE.attempts) ?? {};

function newCode(): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return otpFromBytes(bytes);
}
function newSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return saltFromBytes(bytes);
}

/* ---------------- Formulario ---------------- */

interface Field {
  readonly wrap: HTMLLabelElement;
  readonly input: HTMLInputElement;
  readonly error: HTMLSpanElement;
}

let fieldId = 0;
function field(label: string, attrs: Record<string, string>): Field {
  const id = `bt-auth-f${++fieldId}`;
  const error = h("span", { id: `${id}-err`, class: "bt-auth-error", "aria-live": "polite" });
  const input = h("input", { id, ...attrs, "aria-describedby": `${id}-err` });
  const wrap = h("label", { class: "bt-field", for: id }, [h("span", {}, [label]), input, error]);
  return { wrap, input, error };
}
function setError(f: Field, message: string): void {
  f.error.textContent = message;
  f.input.setAttribute("aria-invalid", message ? "true" : "false");
  translateTree(f.error);
}

const EMAIL_MSG = { required: "Escribe tu correo.", "too-long": "El correo es demasiado largo.", invalid: "Escribe un correo válido, por ejemplo nombre@correo.com." } as const;
const NAME_MSG = { required: "Escribe tu nombre completo.", "too-short": "Mínimo 3 caracteres.", "too-long": "Máximo 80 caracteres.", invalid: "Usa solo letras, espacios, punto, guion o apóstrofo." } as const;

function emailField(): Field {
  return field("Correo electrónico", { type: "email", name: "email", autocomplete: "email", inputmode: "email", maxlength: String(AUTH_LIMITS.emailMax), required: "", placeholder: "tucorreo@ejemplo.com" });
}
function passwordField(label: string, autocomplete: string): Field {
  const f = field(label, { type: "password", name: "password", autocomplete, minlength: String(AUTH_LIMITS.passwordMin), maxlength: String(AUTH_LIMITS.passwordMax), required: "" });
  const toggle = h("button", { type: "button", class: "bt-auth-toggle", "aria-label": "Mostrar contraseña", "aria-pressed": "false" }, ["Mostrar"]);
  markHandled(toggle);
  toggle.addEventListener("click", () => {
    const show = f.input.type === "password";
    f.input.type = show ? "text" : "password";
    toggle.textContent = show ? "Ocultar" : "Mostrar";
    toggle.setAttribute("aria-pressed", String(show));
    translateTree(toggle);
  });
  f.input.after(toggle);
  return f;
}

function button(label: string, kind: "primary" | "ghost" | "link" = "primary", type: "submit" | "button" = "submit"): HTMLButtonElement {
  const b = h("button", { type, class: `bt-auth-btn bt-auth-btn--${kind}` }, [label]);
  markHandled(b);
  return b;
}

async function busy(btn: HTMLButtonElement, task: () => Promise<void>): Promise<void> {
  const label = btn.textContent ?? "";
  btn.disabled = true;
  btn.setAttribute("aria-busy", "true");
  btn.textContent = "Procesando…";
  translateTree(btn);
  await new Promise((r) => setTimeout(r, 500));
  try { await task(); } finally {
    btn.disabled = false;
    btn.removeAttribute("aria-busy");
    btn.textContent = label;
    translateTree(btn);
  }
}

/* ---------------- Diálogo ---------------- */

interface Ctx {
  readonly next: string | null;
  readonly checkout: boolean;
  readonly body: HTMLDivElement;
  readonly title: HTMLHeadingElement;
  readonly sub: HTMLParagraphElement;
  readonly notice: HTMLDivElement;
}

function go(ctx: Ctx, mode: AuthMode): void {
  history.replaceState(null, "", authUrl(mode, ctx.next));
  render(ctx, mode);
}

function finish(ctx: Ctx, session: DemoSession, fallback: string): void {
  saveSession(session);
  // Solo se respeta "next" cuando es una ruta privada legitima del flujo (p. ej. checkout);
  // si viene del Home o de una ruta publica, el viajero va a su portal (fallback).
  const next = safeNext(ctx.next);
  const dest = next && isPrivatePath(next.replace(/[?#].*$/, "")) ? next : fallback;
  location.assign(dest);
}

function notice(ctx: Ctx, message: string, tone: "info" | "error" | "demo" = "info"): void {
  ctx.notice.className = `bt-auth-notice bt-auth-notice--${tone}`;
  ctx.notice.hidden = !message;
  ctx.notice.textContent = message;
  translateTree(ctx.notice);
}

function heading(ctx: Ctx, title: string, sub: string): void {
  ctx.title.textContent = title;
  ctx.sub.textContent = sub;
}

function renderLogin(ctx: Ctx): HTMLFormElement {
  heading(ctx, ctx.checkout ? "Inicia sesión para pagar" : "Inicia sesión", ctx.checkout ? "Guardamos tu tour y fecha. Sigues justo donde ibas." : "Accede a tus reservas, favoritos y mensajes.");
  const email = emailField();
  const pass = passwordField("Contraseña", "current-password");
  const remember = h("input", { type: "checkbox", id: "bt-auth-remember" });
  const forgot = button("¿Olvidaste tu contraseña?", "link", "button");
  forgot.addEventListener("click", () => go(ctx, "recover"));
  const submit = button("Iniciar sesión");
  const google = button("Continuar con Google", "ghost", "button");
  const toRegister = button("¿No tienes cuenta? Crear cuenta", "link", "button");
  toRegister.addEventListener("click", () => go(ctx, "register"));
  google.addEventListener("click", () => {
    const u = users().find((x) => x.email === DEMO_GOOGLE_ACCOUNT.email);
    finish(ctx, createSession(u ?? { ...DEMO_GOOGLE_ACCOUNT, createdAt: new Date().toISOString() }, false, Date.now()), "/mis-reservas");
  });
  const form = h("form", { class: "bt-form", novalidate: true }, [
    google,
    h("div", { class: "bt-auth-sep" }, [h("span", {}, ["o con tu correo"])]),
    email.wrap,
    pass.wrap,
    h("div", { class: "bt-auth-row" }, [h("label", { class: "bt-auth-check", for: "bt-auth-remember" }, [remember, h("span", {}, ["Mantener sesión"])]), forgot]),
    submit,
    toRegister,
  ]);
  notice(ctx, `Modo demostración: usa ${DEMO_ACCOUNT.email} / ${DEMO_ACCOUNT.password} o crea una cuenta.`, "demo");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const eErr = validateEmail(email.input.value);
    setError(email, eErr ? EMAIL_MSG[eErr] : "");
    setError(pass, pass.input.value ? "" : "Escribe tu contraseña.");
    if (eErr || !pass.input.value) return;
    void busy(submit, async () => {
      const key = normalizeEmail(email.input.value);
      const all = attempts();
      const now = Date.now();
      if (isLocked(all[key], now)) {
        notice(ctx, `Cuenta bloqueada por intentos fallidos. Intenta de nuevo en ${minutesLeft(all[key], now)} min.`, "error");
        return;
      }
      const user = await authenticate(users(), key, pass.input.value);
      if (!user) {
        all[key] = registerFailure(all[key], now);
        write(localStorage, AUTH_STORAGE.attempts, all);
        // Mensaje genérico (no revela si el correo existe).
        notice(ctx, isLocked(all[key], now) ? "Demasiados intentos. Tu acceso queda bloqueado 15 minutos." : "Credenciales incorrectas. Revisa tu correo y contraseña.", "error");
        pass.input.value = "";
        pass.input.focus();
        return;
      }
      delete all[key];
      write(localStorage, AUTH_STORAGE.attempts, all);
      finish(ctx, createSession(user, remember.checked, now), "/mis-reservas");
    });
  });
  return form;
}

function renderRegister(ctx: Ctx): HTMLFormElement {
  heading(ctx, ctx.checkout ? "Crea tu cuenta para pagar" : "Crea tu cuenta", "Te enviaremos un código de 6 dígitos para verificar tu correo.");
  const name = field("Nombre completo", { type: "text", name: "name", autocomplete: "name", maxlength: String(AUTH_LIMITS.nameMax), required: "" });
  const email = emailField();
  const pass = passwordField("Contraseña", "new-password");
  const rules = h("ul", { class: "bt-auth-rules", "aria-live": "polite" });
  const paint = (): void => {
    const c = passwordChecks(pass.input.value);
    rules.replaceChildren(...[["Mínimo 8 caracteres", c.length], ["Una mayúscula", c.upper], ["Un número", c.number]].map(([t, ok]) => h("li", { "data-ok": String(ok) }, [String(t)])));
    translateTree(rules);
  };
  pass.input.addEventListener("input", paint);
  paint();
  pass.wrap.append(rules);
  const consent = h("input", { type: "checkbox", id: "bt-auth-consent", required: true });
  const consentError = h("span", { class: "bt-auth-error", "aria-live": "polite" });
  const submit = button("Crear cuenta");
  const toLogin = button("¿Ya tienes cuenta? Inicia sesión", "link", "button");
  toLogin.addEventListener("click", () => go(ctx, "login"));
  const form = h("form", { class: "bt-form", novalidate: true }, [
    name.wrap, email.wrap, pass.wrap,
    h("label", { class: "bt-auth-check", for: "bt-auth-consent" }, [consent, h("span", {}, ["Autorizo el tratamiento de mis datos personales según la Política de Privacidad (Ley 1581 de 2012) y acepto los Términos."])]),
    consentError, submit, toLogin,
  ]);
  notice(ctx, "", "info");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const nErr = validateName(name.input.value);
    const eErr = validateEmail(email.input.value);
    setError(name, nErr ? NAME_MSG[nErr] : "");
    setError(email, eErr ? EMAIL_MSG[eErr] : "");
    setError(pass, isStrongPassword(pass.input.value) ? "" : "La contraseña no cumple los requisitos.");
    consentError.textContent = consent.checked ? "" : "Debes aceptar para crear la cuenta.";
    translateTree(consentError);
    if (nErr || eErr || !isStrongPassword(pass.input.value) || !consent.checked) return;
    void busy(submit, async () => {
      const key = normalizeEmail(email.input.value);
      if (accountExists(users(), key)) {
        setError(email, "Ya existe una cuenta con este correo. Inicia sesión o recupera tu contraseña.");
        return;
      }
      const salt = newSalt();
      const challenge = createChallenge({ purpose: "register", email: key, name: normalizeName(name.input.value), salt, hash: await hashPassword(pass.input.value, salt) }, newCode(), Date.now());
      write(sessionStorage, AUTH_STORAGE.challenge, challenge);
      go(ctx, "otp");
    });
  });
  return form;
}

function renderOtp(ctx: Ctx): HTMLFormElement {
  let challenge = read<OtpChallenge>(sessionStorage, AUTH_STORAGE.challenge);
  if (!challenge) {
    window.setTimeout(() => go(ctx, "register"));
    return h("form");
  }
  const purpose = challenge.purpose;
  heading(ctx, "Revisa tu correo", `Enviamos un código de 6 dígitos a ${maskEmail(challenge.email)}. Vence en 10 minutos.`);
  const code = field("Código de verificación", { type: "text", name: "code", inputmode: "numeric", autocomplete: "one-time-code", pattern: "\\d{6}", maxlength: "6", required: "" });
  code.input.classList.add("bt-auth-code");
  code.input.addEventListener("input", () => { code.input.value = code.input.value.replace(/\D/g, "").slice(0, 6); });
  const extra: Field[] = [];
  const pass = purpose === "reset" ? passwordField("Nueva contraseña", "new-password") : null;
  if (pass) extra.push(pass);
  const submit = button(purpose === "reset" ? "Guardar contraseña" : "Verificar");
  const resend = button("Reenviar código", "ghost", "button");
  const tick = (): void => {
    const left = Math.ceil(((challenge?.resendAt ?? 0) - Date.now()) / 1000);
    resend.disabled = left > 0;
    resend.textContent = left > 0 ? `Reenviar en 00:${String(left).padStart(2, "0")}` : "Reenviar código";
  };
  const timer = window.setInterval(tick, 1000);
  tick();
  resend.addEventListener("click", () => {
    if (!challenge) return;
    challenge = createChallenge({ ...challenge }, newCode(), Date.now());
    write(sessionStorage, AUTH_STORAGE.challenge, challenge);
    notice(ctx, `Modo demostración: tu nuevo código es ${challenge.code}.`, "demo");
    tick();
  });
  const back = button("Volver", "link", "button");
  back.addEventListener("click", () => { window.clearInterval(timer); go(ctx, purpose === "reset" ? "recover" : "register"); });
  notice(ctx, `Modo demostración: tu código es ${challenge.code}. En producción llega a tu correo.`, "demo");
  const form = h("form", { class: "bt-form", novalidate: true }, [code.wrap, ...extra.map((f) => f.wrap), submit, resend, back]);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!challenge) return;
    if (pass && !isStrongPassword(pass.input.value)) { setError(pass, "Mínimo 8 caracteres, una mayúscula y un número."); return; }
    const result = verifyOtp(challenge, code.input.value, Date.now());
    if (!result.ok) {
      challenge = result.challenge ?? undefined;
      if (challenge) write(sessionStorage, AUTH_STORAGE.challenge, challenge);
      else drop(sessionStorage, AUTH_STORAGE.challenge);
      const msg = { format: "Escribe los 6 dígitos.", invalid: `Código incorrecto. Te quedan ${challenge?.attemptsLeft ?? 0} intentos.`, expired: "El código venció. Solicita uno nuevo.", exhausted: "Agotaste los intentos. Solicita un código nuevo." }[result.reason];
      setError(code, msg);
      if (!challenge) { window.clearInterval(timer); window.setTimeout(() => go(ctx, purpose === "reset" ? "recover" : "register"), 1600); }
      return;
    }
    const verified = challenge;
    void busy(submit, async () => {
      window.clearInterval(timer);
      drop(sessionStorage, AUTH_STORAGE.challenge);
      const createdAt = new Date().toISOString();
      if (verified.purpose === "register") {
        const user: DemoUser = { email: verified.email, name: verified.name ?? "", salt: verified.salt ?? "", hash: verified.hash ?? "", createdAt };
        write(localStorage, AUTH_STORAGE.users, upsertUser(users(), user));
        finish(ctx, createSession(user, false, Date.now()), "/bienvenida");
        return;
      }
      const salt = newSalt();
      const existing = users().find((u) => u.email === verified.email);
      const user: DemoUser = { email: verified.email, name: existing?.name ?? (verified.email === DEMO_ACCOUNT.email ? DEMO_ACCOUNT.name : verified.email.split("@")[0] ?? ""), salt, hash: await hashPassword(pass?.input.value ?? "", salt), createdAt: existing?.createdAt ?? createdAt };
      write(localStorage, AUTH_STORAGE.users, upsertUser(users(), user));
      notice(ctx, "Contraseña actualizada. Ya puedes iniciar sesión.", "info");
      go(ctx, "login");
    });
  });
  return form;
}

function renderRecover(ctx: Ctx): HTMLFormElement {
  heading(ctx, "Recupera tu acceso", "Escribe el correo con el que te registraste. Te enviaremos un código de 6 dígitos para crear una contraseña nueva.");
  const email = emailField();
  const submit = button("Enviar código");
  const back = button("Volver a iniciar sesión", "link", "button");
  back.addEventListener("click", () => go(ctx, "login"));
  notice(ctx, "Por seguridad, siempre verás este mensaje aunque el correo no esté registrado.", "info");
  const form = h("form", { class: "bt-form", novalidate: true }, [email.wrap, submit, back]);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const eErr = validateEmail(email.input.value);
    setError(email, eErr ? EMAIL_MSG[eErr] : "");
    if (eErr) return;
    void busy(submit, async () => {
      const key = normalizeEmail(email.input.value);
      if (!accountExists(users(), key)) {
        // Misma respuesta que si existiera (evita enumeración de cuentas).
        notice(ctx, "Si el correo está registrado, recibirás un código en unos minutos.", "info");
        return;
      }
      write(sessionStorage, AUTH_STORAGE.challenge, createChallenge({ purpose: "reset", email: key }, newCode(), Date.now()));
      go(ctx, "otp");
    });
  });
  return form;
}

function render(ctx: Ctx, mode: AuthMode): void {
  const form = mode === "register" ? renderRegister(ctx) : mode === "otp" ? renderOtp(ctx) : mode === "recover" || mode === "reset" ? renderRecover(ctx) : renderLogin(ctx);
  ctx.body.replaceChildren(form);
  translateTree(ctx.title.parentElement ?? ctx.body);
  window.requestAnimationFrame(() => form.querySelector<HTMLInputElement>("input")?.focus());
}

const MODE_BY_PATH: Readonly<Record<string, AuthMode>> = {
  [AUTH_PATHS.login]: "login",
  [AUTH_PATHS.register]: "register",
  [AUTH_PATHS.otp]: "otp",
  [AUTH_PATHS.recover]: "recover",
};

function mountDialog(stage: HTMLElement, mode: AuthMode): void {
  const params = new URLSearchParams(location.search);
  const next = safeNext(params.get("next"));
  const checkout = isCheckoutContext(next);
  const root = pageRoot(stage);
  if (root) {
    const kids = [...root.children] as HTMLElement[];
    // Con contexto de pago se deja ver el checkout detrás; si no, solo el fondo de la página.
    const keep = checkout && /iniciar|crear|verificar-codigo/.test(location.pathname) ? kids.slice(0, -2) : kids.slice(0, 1);
    for (const k of kids) if (!keep.includes(k) && !/© 2026/.test(textOf(k))) k.style.visibility = "hidden";
  }
  const title = h("h1", { id: "bt-auth-title", class: "bt-panel-title" });
  const sub = h("p", { class: "bt-panel-sub" });
  const noticeBox = h("div", { class: "bt-auth-notice", role: "status", hidden: true });
  const body = h("div", {});
  const close = h("a", { href: next ?? "/", class: "bt-icon-btn bt-close", "aria-label": "Cerrar" }, ["×"]);
  markHandled(close);
  const dialog = h("div", { class: "bt-auth-dialog bt-glass", role: "dialog", "aria-modal": "true", "aria-labelledby": "bt-auth-title" }, [
    h("div", { class: "bt-panel-head" }, [h("div", {}, [title, sub]), close]),
    noticeBox,
    body,
  ]);
  const overlay = h("div", { class: "bt-auth-overlay" }, [dialog]);
  stage.append(overlay);
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { location.assign(next ?? "/"); return; }
    if (event.key !== "Tab") return;
    const items = focusables(dialog);
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  render({ next, checkout, body, title, sub, notice: noticeBox }, mode);
}

/* ---------------- Sesión en la interfaz ---------------- */

function replaceTexts(stage: HTMLElement, session: DemoSession): void {
  const first = firstNameOf(session.name);
  const map: [RegExp, string][] = [
    [/^Andrés Morales$/, session.name],
    [/^Bienvenido, Andrés$/, `Bienvenido, ${first}`],
    [/^Tú \(Andrés\)$/, `Tú (${first})`],
    [/^AM$/, initialsOf(session.name)],
    [/^andres\.morales@correo\.com · Miembro desde .+$/, `${session.email} · Miembro desde ${memberSince(session.createdAt)}`],
    [/^andres\.morales@correo\.com$/, session.email],
  ];
  const walker = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const value = (n.nodeValue ?? "").trim();
    for (const [re, out] of map) if (re.test(value)) { n.nodeValue = out; break; }
  }
}

function setupSignOut(stage: HTMLElement): void {
  for (const el of stage.querySelectorAll<HTMLElement>("a, button, span, div")) {
    if (textOf(el) !== "Cerrar sesión" || el.querySelector("a,button")) continue;
    const target = el.closest<HTMLElement>("a,button") ?? el;
    if (target.dataset.btSignout) continue;
    target.dataset.btSignout = "1";
    markHandled(target);
    if (target.tagName !== "A" && target.tagName !== "BUTTON") { target.setAttribute("role", "button"); target.tabIndex = 0; }
    target.style.cursor = "pointer";
    target.addEventListener("click", (event) => { event.preventDefault(); signOut(); });
    target.addEventListener("keydown", (event) => { if (event.key === "Enter") signOut(); });
  }
}

function setupNavAccount(stage: HTMLElement, session: DemoSession | null): void {
  for (const link of stage.querySelectorAll<HTMLAnchorElement>('a[href="/iniciar-sesion"]')) {
    if (link.closest(".bt-auth-overlay")) continue;
    const label = [...link.querySelectorAll("span")].find((s) => textOf(s) === "Iniciar sesión");
    if (!label) continue;
    if (session) {
      link.href = "/mis-reservas";
      link.classList.add("bt-account");
      label.textContent = firstNameOf(session.name) || "Mi cuenta";
      label.setAttribute("data-bt-no-i18n", "");
      link.setAttribute("aria-label", `Mi cuenta (${session.name})`);
    } else {
      link.href = authUrl("login", location.pathname + location.search);
    }
    markHandled(link);
  }
}

/** El logo del viajero (enlaces al Home) navega con ?home=1 para poder ver el Home teniendo sesión. */
function markHomeLinks(stage: HTMLElement): void {
  for (const link of stage.querySelectorAll<HTMLAnchorElement>('a[href="/"], a[href="/?home=1"]')) {
    if (link.closest(".bt-auth-overlay")) continue;
    link.href = "/?home=1";
  }
}

/** Botones "Pagar…" exigen sesión (Auth Gate al pagar, Spec-A RF-A10). */
function setupPayGate(stage: HTMLElement): void {
  for (const link of stage.querySelectorAll<HTMLAnchorElement>('a[href="/checkout/procesando"]')) {
    markHandled(link);
    link.addEventListener("click", (event) => {
      if (getSession()) return;
      event.preventDefault();
      location.assign(authUrl("login", "/checkout/procesando"));
    });
  }
}

export function initAuth(): void {
  const stage = getStage();
  if (!stage) return;
  const path = location.pathname.replace(/\/$/, "") || "/";
  const session = getSession();
  // Con sesion activa el Home no se muestra: se va al portal del viajero. La unica forma de ver el
  // Home logueado es pulsar el logo del viajero, que navega con ?home=1 (flag explicito).
  if (path === "/" && session && new URLSearchParams(location.search).get("home") !== "1") {
    location.replace("/mis-reservas");
    return;
  }
  if (isPrivatePath(path) && !session) {
    location.replace(authUrl("login", path + location.search));
    return;
  }
  const mode = MODE_BY_PATH[path];
  if (mode) {
    if (session && mode === "login") { location.replace(safeNext(new URLSearchParams(location.search).get("next")) ?? "/mis-reservas"); return; }
    mountDialog(stage, mode);
    return;
  }
  if (session) { replaceTexts(stage, session); markHomeLinks(stage); }
  setupSignOut(stage);
  setupNavAccount(stage, session);
  setupPayGate(stage);
}
