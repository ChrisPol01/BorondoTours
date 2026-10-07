/**
 * Autenticación de DEMOSTRACIÓN para recorrer el B2C como usuario (sin backend).
 *
 * Simula el flujo de Spec-F (registro, verificación por código de 6 dígitos, inicio de sesión,
 * recuperación de contraseña y cierre) guardando cuentas de prueba en el navegador. No es una
 * autenticación real: no hay JWT ni servidor. Cuando exista la API (`/api/v1/auth/*`), este módulo
 * se reemplaza por las llamadas reales y el store de sesión en memoria (`stores/session.ts`).
 *
 * Funciones puras (testeables); el acceso a storage y al DOM vive en runtime/auth.ts.
 */

export const AUTH_STORAGE = {
  users: "borondo.demo.users",
  session: "borondo.demo.session",
  challenge: "borondo.demo.otp",
  attempts: "borondo.demo.attempts",
} as const;

/** Cuenta de prueba publicada en la pantalla de acceso. */
export const DEMO_ACCOUNT = {
  email: "demo@borondotours.com",
  password: "Borondo2026",
  name: "Viajero Demo",
  createdAt: "2026-03-01T15:00:00.000Z",
} as const;

/** Cuenta que usa el botón "Continuar con Google" en la demostración. */
export const DEMO_GOOGLE_ACCOUNT = {
  email: "viajero.google@gmail.com",
  name: "Viajero Google",
} as const;

export const AUTH_LIMITS = {
  nameMin: 3,
  nameMax: 80,
  emailMax: 254,
  emailLocalMax: 64,
  passwordMin: 8,
  passwordMax: 64,
  otpLength: 6,
  otpTtlMs: 10 * 60_000,
  otpAttempts: 3,
  resendMs: 45_000,
  maxLoginAttempts: 5,
  lockMs: 15 * 60_000,
  rememberMs: 30 * 24 * 60 * 60_000,
} as const;

/** Rutas que requieren sesión (portal del viajero y pasos posteriores al pago). */
export const PRIVATE_PATH =
  /^\/(mis-reservas|mis-tours|favoritos|mensajes|notificaciones|perfil|soporte|bienvenida|checkout\/(procesando|confirmacion)|estados\/(favoritos-vacio|mensajes-|mis-reservas-vacio|perfil-menu))/;

export type AuthMode = "login" | "register" | "otp" | "recover" | "reset";

/** Pantalla de cada modo (la URL cambia con el paso para poder compartirla o recargar). */
export const AUTH_PATHS: Readonly<Record<AuthMode, string>> = {
  login: "/iniciar-sesion",
  register: "/crear-cuenta",
  otp: "/verificar-codigo",
  recover: "/recuperar-contrasena",
  reset: "/recuperar-contrasena",
};

export interface DemoUser {
  readonly email: string;
  readonly name: string;
  readonly salt: string;
  readonly hash: string;
  readonly createdAt: string;
}

export interface DemoSession {
  readonly email: string;
  readonly name: string;
  readonly createdAt: string;
  readonly issuedAt: string;
  /** Solo si el usuario marcó "Mantener sesión". */
  readonly expiresAt?: string;
}

export interface OtpChallenge {
  readonly purpose: "register" | "reset";
  readonly email: string;
  readonly code: string;
  readonly expiresAt: number;
  readonly resendAt: number;
  readonly attemptsLeft: number;
  /** Datos de la cuenta en registro (se guarda solo al verificar el código). */
  readonly name?: string;
  readonly salt?: string;
  readonly hash?: string;
}

export interface AttemptRecord {
  readonly count: number;
  readonly lockedUntil?: number;
}

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const normalizeName = (name: string): string => name.replace(/\s+/g, " ").trim();

export function isPrivatePath(path: string): boolean {
  return PRIVATE_PATH.test(path);
}

/** Solo rutas internas ("/algo"): evita redirecciones abiertas a otros dominios. */
export function safeNext(next: string | null | undefined): string | null {
  if (!next) return null;
  const value = next.trim();
  if (value.length > 512 || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  // Sin caracteres de control (evita saltos de línea o nulos en la URL de destino).
  if ([...value].some((ch) => ch.charCodeAt(0) < 0x20)) return null;
  const path = value.split(/[?#]/)[0] ?? "";
  if (Object.values(AUTH_PATHS).includes(path)) return null;
  return value;
}

/** URL de una pantalla de acceso conservando el destino. */
export function authUrl(mode: AuthMode, next?: string | null): string {
  const target = safeNext(next);
  return target ? `${AUTH_PATHS[mode]}?next=${encodeURIComponent(target)}` : AUTH_PATHS[mode];
}

/** El acceso viene del checkout (se mantiene el resumen de la reserva detrás del diálogo). */
export function isCheckoutContext(next: string | null | undefined): boolean {
  const target = safeNext(next);
  return Boolean(target && /^\/(checkout|pago)(\/|$|\?)/.test(target));
}

export type EmailError = "required" | "too-long" | "invalid";

export function validateEmail(email: string): EmailError | null {
  const value = normalizeEmail(email);
  if (!value) return "required";
  if (value.length > AUTH_LIMITS.emailMax) return "too-long";
  const at = value.lastIndexOf("@");
  if (at < 1 || at > AUTH_LIMITS.emailLocalMax) return "invalid";
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(value)) return "invalid";
  if (value.includes("..")) return "invalid";
  return null;
}

export type NameError = "required" | "too-short" | "too-long" | "invalid";

/** Nombre completo: letras (con tildes), espacios, apóstrofo, punto y guion. */
export function validateName(name: string): NameError | null {
  const value = normalizeName(name);
  if (!value) return "required";
  if (value.length < AUTH_LIMITS.nameMin) return "too-short";
  if (value.length > AUTH_LIMITS.nameMax) return "too-long";
  if (!/^\p{L}[\p{L}\p{M}' .-]*$/u.test(value)) return "invalid";
  return null;
}

export interface PasswordChecks {
  readonly length: boolean;
  readonly upper: boolean;
  readonly number: boolean;
}

/** Reglas de Spec-F RF-F02: mínimo 8 caracteres, una mayúscula y un número. */
export function passwordChecks(password: string): PasswordChecks {
  return {
    length: password.length >= AUTH_LIMITS.passwordMin && password.length <= AUTH_LIMITS.passwordMax,
    upper: /\p{Lu}/u.test(password),
    number: /\d/.test(password),
  };
}

export const isStrongPassword = (password: string): boolean => {
  const checks = passwordChecks(password);
  return checks.length && checks.upper && checks.number;
};

export function firstNameOf(name: string): string {
  return normalizeName(name).split(" ")[0] ?? "";
}

export function lastNameOf(name: string): string {
  return normalizeName(name).split(" ").slice(1).join(" ");
}

export function initialsOf(name: string): string {
  const words = normalizeName(name).split(" ").filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return (first + last).toLocaleUpperCase("es-CO") || "BT";
}

/** "andres.morales@correo.com" → "an•••@correo.com". */
export function maskEmail(email: string): string {
  const value = normalizeEmail(email);
  const at = value.lastIndexOf("@");
  if (at < 1) return value;
  return `${value.slice(0, Math.min(2, at))}•••${value.slice(at)}`;
}

/** "marzo de 2026" (fecha de registro en el perfil). */
export function memberSince(iso: string, locale = "es-CO"): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "America/Bogota" }).format(date);
}

/* ---------------- Bloqueo por intentos fallidos (RF-F04) ---------------- */

export function isLocked(record: AttemptRecord | undefined, now: number): boolean {
  return Boolean(record?.lockedUntil && record.lockedUntil > now);
}

export function registerFailure(record: AttemptRecord | undefined, now: number): AttemptRecord {
  const base = record && !(record.lockedUntil && record.lockedUntil <= now) ? record : { count: 0 };
  const count = base.count + 1;
  return count >= AUTH_LIMITS.maxLoginAttempts ? { count, lockedUntil: now + AUTH_LIMITS.lockMs } : { count };
}

export function minutesLeft(record: AttemptRecord | undefined, now: number): number {
  if (!record?.lockedUntil) return 0;
  return Math.max(1, Math.ceil((record.lockedUntil - now) / 60_000));
}

/* ---------------- Código de verificación (RF-F06) ---------------- */

/** Código de 6 dígitos a partir de bytes aleatorios (crypto.getRandomValues en el navegador). */
export function otpFromBytes(bytes: Uint32Array): string {
  const value = (bytes[0] ?? 0) % 1_000_000;
  return String(value).padStart(AUTH_LIMITS.otpLength, "0");
}

export function createChallenge(
  base: Omit<OtpChallenge, "code" | "expiresAt" | "resendAt" | "attemptsLeft">,
  code: string,
  now: number,
): OtpChallenge {
  return { ...base, code, expiresAt: now + AUTH_LIMITS.otpTtlMs, resendAt: now + AUTH_LIMITS.resendMs, attemptsLeft: AUTH_LIMITS.otpAttempts };
}

export type OtpResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "expired" | "exhausted" | "invalid" | "format"; readonly challenge: OtpChallenge | null };

export function verifyOtp(challenge: OtpChallenge, code: string, now: number): OtpResult {
  if (!/^\d{6}$/.test(code)) return { ok: false, reason: "format", challenge };
  if (now > challenge.expiresAt) return { ok: false, reason: "expired", challenge: null };
  if (code === challenge.code) return { ok: true };
  const attemptsLeft = challenge.attemptsLeft - 1;
  if (attemptsLeft <= 0) return { ok: false, reason: "exhausted", challenge: null };
  return { ok: false, reason: "invalid", challenge: { ...challenge, attemptsLeft } };
}

/* ---------------- Contraseñas ---------------- */

const toHex = (buffer: ArrayBuffer | Uint8Array): string =>
  [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");

export function saltFromBytes(bytes: Uint8Array): string {
  return toHex(bytes);
}

/** SHA-256(salt + contraseña). Suficiente para una demo local; el backend real usa bcrypt/argon2. */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  return toHex(await globalThis.crypto.subtle.digest("SHA-256", data));
}

/** Busca la cuenta y valida la contraseña. La cuenta de prueba siempre existe. */
export async function authenticate(users: readonly DemoUser[], email: string, password: string): Promise<DemoUser | null> {
  const value = normalizeEmail(email);
  if (value === DEMO_ACCOUNT.email) {
    const stored = users.find((u) => u.email === value);
    if (!stored) return password === DEMO_ACCOUNT.password ? { email: value, name: DEMO_ACCOUNT.name, salt: "", hash: "", createdAt: DEMO_ACCOUNT.createdAt } : null;
  }
  const user = users.find((u) => u.email === value);
  if (!user) return null;
  return (await hashPassword(password, user.salt)) === user.hash ? user : null;
}

export function accountExists(users: readonly DemoUser[], email: string): boolean {
  const value = normalizeEmail(email);
  return value === DEMO_ACCOUNT.email || users.some((u) => u.email === value);
}

export function createSession(user: Pick<DemoUser, "email" | "name" | "createdAt">, remember: boolean, now: number): DemoSession {
  const issuedAt = new Date(now).toISOString();
  return remember
    ? { email: user.email, name: user.name, createdAt: user.createdAt, issuedAt, expiresAt: new Date(now + AUTH_LIMITS.rememberMs).toISOString() }
    : { email: user.email, name: user.name, createdAt: user.createdAt, issuedAt };
}

export function isSessionValid(session: unknown, now: number): session is DemoSession {
  if (!session || typeof session !== "object") return false;
  const s = session as Partial<DemoSession>;
  if (typeof s.email !== "string" || typeof s.name !== "string") return false;
  if (s.expiresAt && Date.parse(s.expiresAt) < now) return false;
  return true;
}

export function upsertUser(users: readonly DemoUser[], user: DemoUser): DemoUser[] {
  return [...users.filter((u) => u.email !== user.email), user];
}
