/** Validación del formulario de contacto (Nosotros y /contacto). Puro y testeable. */

export const CONTACT_LIMITS = { nameMin: 3, nameMax: 80, emailMax: 254, phoneMax: 20, messageMin: 10, messageMax: 1000, throttleMs: 30_000 } as const;

export interface ContactInput {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly message: string;
  readonly consent: boolean;
  readonly honeypot: string;
}

export type ContactErrors = Partial<Record<"name" | "email" | "phone" | "message" | "consent", string>>;

const EMAIL = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i;

/** Solo dígitos, con "+" inicial opcional. */
export const phoneDigits = (phone: string): string => phone.replace(/[^\d]/g, "");

/** Teléfono: Colombia (+57) exige 10 dígitos de celular o fijo; otros países E.164 (8–15 dígitos). */
export function validatePhone(phone: string): string | null {
  const value = phone.trim();
  if (!value || value === "+57") return null;
  if (value.length > CONTACT_LIMITS.phoneMax || !/^\+?[\d\s()-]+$/.test(value)) return "Usa solo números, espacios, guiones o paréntesis.";
  const digits = phoneDigits(value);
  if (value.startsWith("+57") || (!value.startsWith("+") && digits.length === 10)) {
    const local = value.startsWith("+57") ? digits.slice(2) : digits;
    return /^[36]\d{9}$/.test(local) ? null : "Escribe un número colombiano de 10 dígitos (ej. 322 524 9637).";
  }
  return digits.length >= 8 && digits.length <= 15 ? null : "Escribe el número con código de país (8 a 15 dígitos).";
}

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  const name = input.name.replace(/\s+/g, " ").trim();
  if (name.length < CONTACT_LIMITS.nameMin) errors.name = "Escribe tu nombre (mínimo 3 letras).";
  else if (name.length > CONTACT_LIMITS.nameMax) errors.name = "Máximo 80 caracteres.";
  else if (!/^\p{L}[\p{L}\p{M}' .-]*$/u.test(name)) errors.name = "Usa solo letras, espacios, punto, guion o apóstrofo.";
  const email = input.email.trim();
  if (!email) errors.email = "Escribe tu correo.";
  else if (email.length > CONTACT_LIMITS.emailMax || !EMAIL.test(email) || email.includes("..")) errors.email = "Escribe un correo válido, por ejemplo nombre@correo.com.";
  const phone = validatePhone(input.phone);
  if (phone) errors.phone = phone;
  const message = input.message.trim();
  if (message.length < CONTACT_LIMITS.messageMin) errors.message = "Cuéntanos un poco más (mínimo 10 caracteres).";
  else if (message.length > CONTACT_LIMITS.messageMax) errors.message = "Máximo 1.000 caracteres.";
  if (!input.consent) errors.consent = "Debes autorizar el tratamiento de datos para enviar el mensaje.";
  return errors;
}

/** Bots: el campo trampa viene lleno. */
export const isBot = (input: ContactInput): boolean => input.honeypot.trim() !== "";
