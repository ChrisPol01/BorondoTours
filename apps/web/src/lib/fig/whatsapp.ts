/**
 * Enlaces a WhatsApp de la agencia con mensaje prellenado.
 *
 * El número es el canal oficial de asesoría de BorondoTours. Los mensajes dejan huecos (`____`, `_`)
 * para que el viajero complete fecha y número de personas antes de enviar.
 */

/** Número de WhatsApp de la agencia, formato internacional sin "+" (wa.me). */
export const AGENCY_WHATSAPP = "573225249637";

/** Construye la URL de wa.me con el texto codificado. Un texto vacío abre el chat sin mensaje. */
export function whatsappUrl(message: string, phone: string = AGENCY_WHATSAPP): string {
  const base = `https://wa.me/${phone}`;
  const text = message.trim();
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Plantilla de cotización: "Hola, quiero un asesor que me indique <qué> para la fecha ____ …". */
export function quoteTemplate(what: string): string {
  return `Hola, quiero un asesor que me indique ${what} para la fecha ____ para la cantidad de _ personas adultas y _ niños, quedo atento a tu cotización.`;
}

/** Datos que recoge el asistente (chatbot) antes de pasar la conversación a WhatsApp. */
export interface AssistantRequest {
  readonly plan: string;
  readonly destination: string;
  readonly date: string;
  readonly adults: number;
  readonly children: number;
  readonly notes: string;
}

/** Arma el mensaje del asistente. Omite los campos vacíos para que el texto quede limpio. */
export function assistantMessage(req: AssistantRequest): string {
  const lines = [`Hola, quiero cotizar un plan ${req.plan.toLocaleLowerCase("es")} con BorondoTours.`];
  if (req.destination.trim()) lines.push(`Destino: ${req.destination.trim()}.`);
  if (req.date.trim()) lines.push(`Fecha: ${req.date.trim()}.`);
  const adults = Math.max(0, Math.trunc(req.adults));
  const children = Math.max(0, Math.trunc(req.children));
  lines.push(`Viajeros: ${adults} ${adults === 1 ? "adulto" : "adultos"} y ${children} ${children === 1 ? "niño" : "niños"}.`);
  if (req.notes.trim()) lines.push(`Detalles: ${req.notes.trim()}`);
  lines.push("Quedo atento a tu cotización.");
  return lines.join("\n");
}
