import type { SourceEvidence } from "../../src/lib/redesignManifests";

export const FIXTURE_VERSION = "2026-08-01";

export const REDESIGN_REQUIREMENTS_EVIDENCE: SourceEvidence = {
  document: ".kiro/specs/b2c-pixel-perfect-redesign/requirements.md",
  references: ["R1", "R5", "R24", "R29", "R31"],
  note: "Gobierna secuencia, trazabilidad, aprobación, regresión e hidratación mínima.",
};

export const REDESIGN_DESIGN_EVIDENCE: SourceEvidence = {
  document: ".kiro/specs/b2c-pixel-perfect-redesign/design.md",
  references: ["Estrategia secuencial", "Island Registry", "Contract readiness matrix"],
  note: "Define rutas, blast radius y gaps contractuales; no autoriza endpoints nuevos.",
};

export const SPEC_A_EVIDENCE: SourceEvidence = {
  document: ".obsidian/docs/01-Specs/Spec-A-Discovery.md",
  references: ["RF-A01", "RF-A03", "RF-A04–RF-A12"],
  note: "Baseline funcional de Home y Discovery; endpoints históricos requieren contratos Zod vigentes antes de habilitar efectos.",
};

export const SPEC_B_EVIDENCE: SourceEvidence = {
  document: ".obsidian/docs/01-Specs/Spec-B-Tour-Detail.md",
  references: ["RF-B01–RF-B09"],
  note: "Baseline funcional de Tour Detail; waitlist, reviews y respuestas remotas siguen contract-dependent.",
};

export const ADR_011_EVIDENCE: SourceEvidence = {
  document: ".obsidian/docs/02-ADRs/ADR-011-Arquitectura-Consolidada.md",
  references: ["SW7", "INF8", "INF16"],
  note: "Contratos Zod compartidos y frontend estático S3/CloudFront; ADR-005 y ADR-008 están superados.",
};
