import type { EvaluationEntry, MockupSheet, SourceEvidence } from "../../src/lib/redesignManifests";
import {
  REDESIGN_DESIGN_EVIDENCE,
  REDESIGN_REQUIREMENTS_EVIDENCE,
  SPEC_A_EVIDENCE,
  SPEC_B_EVIDENCE,
} from "./evidence";

interface EvaluationSeed {
  id: string;
  sheet: MockupSheet;
  control: string;
  requiredContract: string;
  personalData?: readonly string[];
  owner?: string;
  evidence?: readonly SourceEvidence[];
}

function pending(seed: EvaluationSeed): EvaluationEntry {
  return {
    ...seed,
    personalData: seed.personalData ?? [],
    documentaryPhase: "pending-functional-requirements-and-contract",
    approval: "pending",
    owner: seed.owner ?? "Product",
    capabilityMode: "visual_only",
    evidence: seed.evidence ?? [REDESIGN_REQUIREMENTS_EVIDENCE, REDESIGN_DESIGN_EVIDENCE],
  };
}

export const EVALUATION_INVENTORY: readonly EvaluationEntry[] = [
  pending({ id: "planner", sheet: "1", control: "Planifica tu viaje", requiredContract: "Planner requirements and recommendation contract", evidence: [SPEC_A_EVIDENCE, REDESIGN_REQUIREMENTS_EVIDENCE] }),
  pending({ id: "destination-recommendations", sheet: "3", control: "Recomendador de destinos", requiredContract: "Recommendation input/output contract" }),
  pending({ id: "newsletter", sheet: "5", control: "Suscripción newsletter", requiredContract: "Consent and subscription contract", personalData: ["email"], owner: "Product + Legal" }),
  pending({ id: "editorial-cms", sheet: "5", control: "CMS editorial y búsqueda remota", requiredContract: "Published content and search contract" }),
  pending({ id: "contact-form", sheet: "6", control: "Formulario de contacto persistente", requiredContract: "Contact consent and submission contract", personalData: ["name", "email", "phone", "message"], owner: "Product + Legal" }),
  pending({ id: "office-map", sheet: "6", control: "Mapa interactivo de oficina", requiredContract: "Approved public coordinates and map configuration" }),
  pending({ id: "dashboard-countdown", sheet: "20", control: "Countdown dinámico", requiredContract: "Dashboard aggregate contract" }),
  pending({ id: "dashboard-activity", sheet: "20", control: "Feed de actividad", requiredContract: "Activity feed contract", personalData: ["account activity"] }),
  pending({ id: "dashboard-recommendations", sheet: "20", control: "Recomendaciones personalizadas", requiredContract: "Authorized recommendation contract", personalData: ["travel preferences"] }),
  pending({ id: "live-itinerary", sheet: "21", control: "Itinerario en vivo", requiredContract: "Live itinerary state contract", personalData: ["booking association"] }),
  pending({ id: "group-location", sheet: "21", control: "Ubicación del grupo", requiredContract: "Location authorization and retention contract", personalData: ["precise location"], owner: "Product + Security + Legal" }),
  pending({ id: "emergency-button", sheet: "21", control: "Botón de emergencia", requiredContract: "Emergency workflow and authorization contract", personalData: ["identity", "location", "emergency details"], owner: "Product + Security + Legal" }),
  pending({ id: "early-guide-contact", sheet: "21", control: "Contacto anticipado con guía", requiredContract: "Guide contact-window contract", personalData: ["contact details"], owner: "Product + Security" }),
  pending({ id: "traveler-documents", sheet: "21-1", control: "Gestión de documentos de viajeros", requiredContract: "Document upload and retention contract", personalData: ["identity documents"], owner: "Product + Security + Legal" }),
  pending({ id: "partial-payments", sheet: "21-1", control: "Pagos parciales", requiredContract: "Payment schedule and state contract", personalData: ["payment status"], owner: "Product + Finance" }),
  pending({ id: "split-fare", sheet: "21-2", control: "Split Fare", requiredContract: "Split Fare requirements, quote and payment contract", personalData: ["participant contact", "payment status"], owner: "Product + Finance + Legal" }),
  pending({ id: "payment-states", sheet: "21-2", control: "Estados de pago", requiredContract: "Payment-state and confirmation contract", personalData: ["payment status"], owner: "Product + Finance", evidence: [SPEC_B_EVIDENCE, REDESIGN_REQUIREMENTS_EVIDENCE, REDESIGN_DESIGN_EVIDENCE] }),
  pending({ id: "allergies", sheet: "22", control: "Alergias", requiredContract: "Sensitive health-data consent and profile contract", personalData: ["health data"], owner: "Product + Security + Legal" }),
  pending({ id: "medical-conditions", sheet: "22", control: "Condiciones médicas", requiredContract: "Sensitive health-data consent and profile contract", personalData: ["health data"], owner: "Product + Security + Legal" }),
  pending({ id: "dietary-preferences", sheet: "22", control: "Preferencias alimentarias", requiredContract: "Preference consent and profile contract", personalData: ["dietary preference"], owner: "Product + Legal" }),
  pending({ id: "active-sessions", sheet: "22", control: "Sesiones activas", requiredContract: "Session list and revocation contract", personalData: ["device", "IP address"], owner: "Product + Security" }),
  pending({ id: "two-factor", sheet: "22", control: "Autenticación en dos pasos", requiredContract: "OTP enrollment and verification contract", personalData: ["phone or email"], owner: "Product + Security" }),
  pending({ id: "multichannel-preferences", sheet: "22", control: "Preferencias multicanal", requiredContract: "Notification consent and preferences contract", personalData: ["contact channels"], owner: "Product + Legal" }),
  pending({ id: "future-coin-earnings", sheet: "23", control: "Formas futuras de ganar Coins", requiredContract: "Loyalty earning rules and ledger contract", owner: "Product + Finance" }),
  pending({ id: "future-level-benefits", sheet: "23", control: "Beneficios de nivel futuros", requiredContract: "Loyalty level configuration contract", owner: "Product + Finance" }),
  pending({ id: "favorite-collections", sheet: "24", control: "Colecciones de favoritos", requiredContract: "Collection persistence and versioning contract", personalData: ["travel preferences"] }),
  pending({ id: "favorite-sharing", sheet: "24", control: "Compartir favoritos", requiredContract: "Share authorization and revocation contract", personalData: ["travel preferences"], owner: "Product + Security" }),
  pending({ id: "messaging-presence", sheet: "25", control: "Presencia", requiredContract: "Presence event and authorization contract", personalData: ["online status"] }),
  pending({ id: "persistent-messaging", sheet: "25", control: "Mensajería persistente", requiredContract: "Inbox, history, retention and WebSocket event contracts", personalData: ["message content"], owner: "Product + Security + Legal" }),
  pending({ id: "messaging-groups", sheet: "25", control: "Grupos", requiredContract: "Membership and authorization contract", personalData: ["identity", "message content"], owner: "Product + Security" }),
  pending({ id: "messaging-files", sheet: "25", control: "Archivos adjuntos", requiredContract: "Attachment upload, scanning and retention contract", personalData: ["file content"], owner: "Product + Security + Legal" }),
  pending({ id: "messaging-mute", sheet: "25", control: "Silenciar conversación", requiredContract: "Conversation preference contract", personalData: ["account preference"] }),
  pending({ id: "messaging-report", sheet: "25", control: "Reportar conversación", requiredContract: "Moderation and evidence-retention workflow", personalData: ["message content", "identity"], owner: "Product + Security + Legal" }),
];
