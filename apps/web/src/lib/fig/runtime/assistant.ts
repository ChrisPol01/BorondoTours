/**
 * Asistente "¿Te ayudamos?": formulario guiado que arma el mensaje y abre WhatsApp con la agencia.
 * No es un chatbot con IA: recoge plan, destino, fecha y viajeros y entrega la conversación a un asesor.
 */
import { assistantMessage, whatsappUrl } from "../whatsapp";
import { h } from "./dom";
import { createPanel, type Panel } from "./panel";

export const ASSISTANT_PLANS = ["Pasadía", "Pasanoche", "Excursión", "Personalizado", "Internacional", "Crucero"] as const;
export type AssistantPlan = (typeof ASSISTANT_PLANS)[number];

let panel: Panel | null = null;
let planSelect: HTMLSelectElement | null = null;

function field(label: string, control: HTMLElement): HTMLLabelElement {
  return h("label", { class: "bt-field" }, [label, control]);
}

function build(): Panel {
  const p = createPanel({
    id: "bt-assistant",
    title: "Asistente BorondoTours",
    subtitle: "Cuéntanos tu plan y un asesor te responde por WhatsApp.",
    narrow: true,
  });

  planSelect = h("select", { name: "plan", required: true }, ASSISTANT_PLANS.map((plan) => h("option", { value: plan }, [plan])));
  const destination = h("input", { name: "destination", type: "text", placeholder: "Ej.: Eje Cafetero", autocomplete: "off", maxlength: "80" });
  const today = new Date().toISOString().slice(0, 10);
  const date = h("input", { name: "date", type: "date", min: today });
  const adults = h("input", { name: "adults", type: "number", min: "1", max: "50", value: "2", inputmode: "numeric", required: true });
  const children = h("input", { name: "children", type: "number", min: "0", max: "50", value: "0", inputmode: "numeric" });
  const notes = h("textarea", { name: "notes", maxlength: "500" });
  const submit = h("button", { type: "submit", class: "bt-cta", "data-bt-handled": true }, ["Enviar por WhatsApp"]);

  const form = h("form", { class: "bt-form", novalidate: false }, [
    field("Tipo de plan", planSelect),
    field("Destino", destination),
    h("div", { class: "bt-row" }, [field("Fecha aproximada", date), field("Adultos", adults)]),
    h("div", { class: "bt-row" }, [field("Niños", children), h("span")]),
    field("Detalles (opcional)", notes),
    submit,
    h("p", { class: "bt-hint" }, ["Se abrirá WhatsApp con tu mensaje listo para enviar."]),
  ]);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const message = assistantMessage({
      plan: planSelect?.value ?? "Personalizado",
      destination: destination.value,
      date: date.value,
      adults: Number(adults.value) || 1,
      children: Number(children.value) || 0,
      notes: notes.value,
    });
    window.open(whatsappUrl(message), "_blank", "noopener");
    p.close();
  });

  p.body.append(form);
  return p;
}

/** Abre el asistente, opcionalmente con el tipo de plan preseleccionado. */
export function openAssistant(plan?: AssistantPlan, trigger?: HTMLElement | null): void {
  panel ??= build();
  if (plan && planSelect) planSelect.value = plan;
  panel.open(trigger);
}
