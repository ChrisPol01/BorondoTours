import { describe, expect, it } from "vitest";
import {
  getStageStartEligibility,
  isStageGateApproved,
  startStage,
  type MockupSheet,
  type StageId,
  type StageManifest,
} from "./redesignManifests";
import {
  BEHAVIORAL_REGRESSION_MATRIX,
  CONTRACT_READINESS,
  EVALUATION_INVENTORY,
  ISLAND_REGISTRY,
  STAGE_MANIFESTS,
  VISUAL_BASELINE_MANIFESTS,
} from "../../tests/fixtures";

function approved(stage: StageManifest): StageManifest {
  return {
    ...stage,
    status: "approved",
    gate: {
      checks: {
        visual: "passed",
        functional: "passed",
        accessibility: "passed",
        keyboard: "passed",
        build: "passed",
        regression: "passed",
      },
      approval: {
        status: "approved",
        approvedBy: "fixture-approver",
        approvedAt: "2026-08-01T16:00:00.000Z",
        evidence: "fixture://approval",
      },
    },
  };
}

describe("stage gate", () => {
  it("allows stage 1 to start and preserves the input manifests", () => {
    const result = startStage(STAGE_MANIFESTS, "stage-1");
    expect(result[0]?.status).toBe("in_progress");
    expect(STAGE_MANIFESTS[0]?.status).toBe("not_started");
  });

  it("blocks a later stage while any prior gate is not approved", () => {
    expect(getStageStartEligibility(STAGE_MANIFESTS, "stage-2")).toEqual({
      allowed: false,
      reason: "previous_gate_not_approved",
      blockingStageId: "stage-1",
    });
    expect(() => startStage(STAGE_MANIFESTS, "stage-2")).toThrow(
      "Cannot start stage-2: previous_gate_not_approved",
    );
  });
  it("starts the next stage only after every prior gate is fully approved", () => {
    const manifests = STAGE_MANIFESTS.map((stage) =>
      stage.id === "stage-1" || stage.id === "stage-2" ? approved(stage) : stage,
    );
    expect(getStageStartEligibility(manifests, "stage-3")).toEqual({
      allowed: true,
      reason: "ready",
    });
    expect(startStage(manifests, "stage-3")[2]?.status).toBe("in_progress");
  });

  it("does not treat approval metadata as sufficient when a gate check failed", () => {
    const stage = approved(STAGE_MANIFESTS[0]!);
    const incomplete: StageManifest = {
      ...stage,
      gate: {
        ...stage.gate,
        checks: { ...stage.gate.checks, regression: "failed" },
      },
    };
    expect(isStageGateApproved(incomplete)).toBe(false);
    expect(getStageStartEligibility([incomplete, STAGE_MANIFESTS[1]!], "stage-2").allowed).toBe(false);
  });

  it("rejects unknown or already-started stages", () => {
    expect(getStageStartEligibility(STAGE_MANIFESTS, "stage-99" as StageId).reason).toBe("unknown_stage");
    const started = startStage(STAGE_MANIFESTS, "stage-1");
    expect(getStageStartEligibility(started, "stage-1").reason).toBe("already_started");
  });
});

describe("versioned redesign fixtures", () => {
  it("registers the required gated sequence and predecessor dependency", () => {
    expect(STAGE_MANIFESTS.map((stage) => stage.sheet)).toEqual([
      "1", "2", "2-1", "3", "4", "5", "6", "20", "21", "21-1", "21-2", "22", "23", "24", "25",
    ]);
    expect(STAGE_MANIFESTS).toHaveLength(15);
    STAGE_MANIFESTS.forEach((stage, index) => {
      expect(stage.order).toBe(index + 1);
      expect(stage.dependsOn).toBe(index === 0 ? null : STAGE_MANIFESTS[index - 1]?.id);
    });
  });

  it("keeps unmeasured baselines and differences pending instead of fabricating approval", () => {
    const expectedBaselineCount = STAGE_MANIFESTS.reduce((count, stage) => count + stage.routes.length * 2, 0);
    expect(VISUAL_BASELINE_MANIFESTS).toHaveLength(expectedBaselineCount);
    for (const baseline of VISUAL_BASELINE_MANIFESTS) {
      expect(baseline.approval).toBe("pending");
      expect(baseline.approvedImage).toBeNull();
      expect(baseline.approvedDifferences).toEqual([]);
      expect(baseline.anchors.every((anchor) => anchor.status === "pending_measurement")).toBe(true);
    }
  });
  it("covers every staged route in the behavioral regression matrix", () => {
    const registeredRoutes = new Set(BEHAVIORAL_REGRESSION_MATRIX.entries.map((entry) => entry.route));
    for (const stage of STAGE_MANIFESTS) {
      for (const route of stage.routes) expect(registeredRoutes.has(route)).toBe(true);
    }
    for (const entry of BEHAVIORAL_REGRESSION_MATRIX.entries) {
      expect(entry.input.length).toBeGreaterThan(0);
      expect(entry.userAction.length).toBeGreaterThan(0);
      expect(entry.observableResult.length).toBeGreaterThan(0);
      expect(entry.dataContract.length).toBeGreaterThan(0);
      expect(entry.regressionTest.id.length).toBeGreaterThan(0);
    }
  });

  it("records all Requirement 24 sheets as safely gated evaluation entries", () => {
    const sheets = new Set(EVALUATION_INVENTORY.map((entry) => entry.sheet));
    const requiredSheets: readonly MockupSheet[] = [
      "1", "3", "5", "6", "20", "21", "21-1", "21-2", "22", "23", "24", "25",
    ];
    for (const sheet of requiredSheets) {
      expect(sheets.has(sheet)).toBe(true);
    }
    for (const entry of EVALUATION_INVENTORY) {
      expect(entry.approval).toBe("pending");
      expect(entry.capabilityMode).toBe("visual_only");
      expect(entry.requiredContract.length).toBeGreaterThan(0);
      expect(entry.owner.length).toBeGreaterThan(0);
    }
  });

  it("records Spec A/B evidence while leaving incomplete remote contracts disabled", () => {
    const evidenceDocuments = STAGE_MANIFESTS.flatMap((stage) => stage.evidence.map((item) => item.document));
    expect(evidenceDocuments).toContain(".obsidian/docs/01-Specs/Spec-A-Discovery.md");
    expect(evidenceDocuments).toContain(".obsidian/docs/01-Specs/Spec-B-Tour-Detail.md");
    expect(CONTRACT_READINESS.catalogSearch.requestSchemaApproved).toBe(true);
    expect(CONTRACT_READINESS.catalogSearch.responseSchemaApproved).toBe(false);
    expect(CONTRACT_READINESS.tourPageData.responseSchemaApproved).toBe(false);
  });

  it("registers unique islands with only approved hydration directives", () => {
    const names = ISLAND_REGISTRY.entries.map((entry) => entry.name);
    expect(new Set(names).size).toBe(names.length);
    expect(ISLAND_REGISTRY.entries.every((entry) => ["client:idle", "client:load", "client:visible"].includes(entry.directive))).toBe(true);
  });
});
