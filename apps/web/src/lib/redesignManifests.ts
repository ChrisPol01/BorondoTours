export const REDESIGN_MANIFEST_SCHEMA_VERSION = "1.0.0" as const;

export type MockupSheet =
  | "1"
  | "2"
  | "2-1"
  | "3"
  | "4"
  | "5"
  | "6"
  | "20"
  | "21"
  | "21-1"
  | "21-2"
  | "22"
  | "23"
  | "24"
  | "25";

export type StageId = `stage-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15}`;
export type StageStatus = "not_started" | "in_progress" | "awaiting_approval" | "approved";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type CapabilityMode = "enabled" | "visual_only" | "contract_dependent";
export type HydrationDirective = "client:idle" | "client:load" | "client:visible";

export interface SourceEvidence {
  document: string;
  references: readonly string[];
  note: string;
}

export interface ApprovedDifference {
  id: string;
  description: string;
  approvedBy: string;
  approvedAt: string;
  evidence: string;
}
export type StageGateCheck =
  | "visual"
  | "functional"
  | "accessibility"
  | "keyboard"
  | "build"
  | "regression";
export type GateCheckStatus = "not_run" | "passed" | "failed";

export interface StageGate {
  checks: Readonly<Record<StageGateCheck, GateCheckStatus>>;
  approval: {
    status: ApprovalStatus;
    approvedBy?: string;
    approvedAt?: string;
    evidence?: string;
  };
}

export interface StageManifest {
  schemaVersion: typeof REDESIGN_MANIFEST_SCHEMA_VERSION;
  fixtureVersion: string;
  id: StageId;
  order: number;
  sheet: MockupSheet;
  routes: readonly string[];
  status: StageStatus;
  dependsOn: StageId | null;
  sharedDependencies: readonly string[];
  componentsUsed: readonly string[];
  componentsModified: readonly string[];
  baselineIds: readonly string[];
  approvedDifferences: readonly ApprovedDifference[];
  evidence: readonly SourceEvidence[];
  gate: StageGate;
}

interface AnchorRect {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export type VisualAnchor =
  | { name: string; selector: string; status: "pending_measurement" }
  | ({ name: string; selector: string; status: "approved" } & AnchorRect);

export interface VisualBaselineManifest {
  schemaVersion: typeof REDESIGN_MANIFEST_SCHEMA_VERSION;
  fixtureVersion: string;
  id: string;
  stageId: StageId;
  route: string;
  viewport: { width: 375 | 1440; height: 812 | 900 };
  fixture: string;
  locale: "es";
  clock: string;
  mockupSource: string;
  approvedImage: string | null;
  approval: ApprovalStatus;
  anchors: readonly VisualAnchor[];
  approvedDifferences: readonly ApprovedDifference[];
}
export interface RegressionTestReference {
  id: string;
  status: "implemented" | "planned";
  path?: string;
}

export interface BehavioralRegressionEntry {
  id: string;
  route: string;
  capability: string;
  input: string;
  userAction: string;
  observableResult: string;
  dataContract: string;
  capabilityMode: CapabilityMode;
  evidence: readonly SourceEvidence[];
  regressionTest: RegressionTestReference;
}

export interface BehavioralRegressionMatrix {
  schemaVersion: typeof REDESIGN_MANIFEST_SCHEMA_VERSION;
  fixtureVersion: string;
  entries: readonly BehavioralRegressionEntry[];
}

export interface EvaluationEntry {
  id: string;
  sheet: MockupSheet;
  control: string;
  requiredContract: string;
  personalData: readonly string[];
  documentaryPhase: string;
  approval: ApprovalStatus;
  owner: string;
  capabilityMode: Exclude<CapabilityMode, "enabled">;
  evidence: readonly SourceEvidence[];
}

export interface ContractReadiness {
  capability: string;
  requirementApproved: boolean;
  requestSchemaApproved: boolean;
  responseSchemaApproved: boolean;
  authorizationDefined: boolean;
  errorCodesDefined: boolean;
  effectOwnerDefined: boolean;
  evidence: readonly SourceEvidence[];
}

export interface IslandRegistryEntry {
  name: string;
  routes: readonly string[];
  ownedState: readonly string[];
  directive: HydrationDirective;
  justification: string;
  implementationStatus: "existing" | "planned";
  capabilityMode: CapabilityMode;
}

export interface IslandRegistry {
  schemaVersion: typeof REDESIGN_MANIFEST_SCHEMA_VERSION;
  fixtureVersion: string;
  entries: readonly IslandRegistryEntry[];
}
export interface StageStartEligibility {
  allowed: boolean;
  reason: "ready" | "unknown_stage" | "already_started" | "previous_gate_not_approved";
  blockingStageId?: StageId;
}

const GATE_CHECKS: readonly StageGateCheck[] = [
  "visual",
  "functional",
  "accessibility",
  "keyboard",
  "build",
  "regression",
];

export function isStageGateApproved(stage: StageManifest): boolean {
  return (
    stage.status === "approved" &&
    stage.gate.approval.status === "approved" &&
    GATE_CHECKS.every((check) => stage.gate.checks[check] === "passed")
  );
}

export function getStageStartEligibility(
  manifests: readonly StageManifest[],
  stageId: StageId,
): StageStartEligibility {
  const target = manifests.find((manifest) => manifest.id === stageId);
  if (!target) return { allowed: false, reason: "unknown_stage" };
  if (target.status !== "not_started") {
    return { allowed: false, reason: "already_started" };
  }

  const priorStages = manifests
    .filter((manifest) => manifest.order < target.order)
    .sort((left, right) => left.order - right.order);
  const blockingStage = priorStages.find((stage) => !isStageGateApproved(stage));
  if (blockingStage) {
    return {
      allowed: false,
      reason: "previous_gate_not_approved",
      blockingStageId: blockingStage.id,
    };
  }

  return { allowed: true, reason: "ready" };
}

export function startStage(
  manifests: readonly StageManifest[],
  stageId: StageId,
): readonly StageManifest[] {
  const eligibility = getStageStartEligibility(manifests, stageId);
  if (!eligibility.allowed) {
    throw new Error(`Cannot start ${stageId}: ${eligibility.reason}`);
  }

  return manifests.map((manifest) =>
    manifest.id === stageId ? { ...manifest, status: "in_progress" } : manifest,
  );
}
