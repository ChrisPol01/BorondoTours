import {
  REDESIGN_MANIFEST_SCHEMA_VERSION,
  type MockupSheet,
  type SourceEvidence,
  type StageGate,
  type StageId,
  type StageManifest,
} from "../../src/lib/redesignManifests";
import {
  FIXTURE_VERSION,
  REDESIGN_DESIGN_EVIDENCE,
  REDESIGN_REQUIREMENTS_EVIDENCE,
  SPEC_A_EVIDENCE,
  SPEC_B_EVIDENCE,
} from "./evidence";

const PENDING_GATE: StageGate = {
  checks: {
    visual: "not_run",
    functional: "not_run",
    accessibility: "not_run",
    keyboard: "not_run",
    build: "not_run",
    regression: "not_run",
  },
  approval: { status: "pending" },
};

export function baselineId(stageId: StageId, route: string, width: 375 | 1440): string {
  const routeKey = route === "/" ? "home" : route.replaceAll(/[^a-z]+/gi, "-").replaceAll(/^-|-$/g, "");
  return `${stageId}-${routeKey}-${width}`;
}

interface StageSeed {
  id: StageId;
  order: number;
  sheet: MockupSheet;
  routes: readonly string[];
  dependsOn: StageId | null;
  sharedDependencies: readonly string[];
  componentsUsed: readonly string[];
  evidence?: readonly SourceEvidence[];
}
function makeStage(seed: StageSeed): StageManifest {
  return {
    schemaVersion: REDESIGN_MANIFEST_SCHEMA_VERSION,
    fixtureVersion: FIXTURE_VERSION,
    ...seed,
    status: "not_started",
    componentsModified: [],
    baselineIds: seed.routes.flatMap((route) => [
      baselineId(seed.id, route, 375),
      baselineId(seed.id, route, 1440),
    ]),
    approvedDifferences: [],
    evidence: seed.evidence ?? [REDESIGN_REQUIREMENTS_EVIDENCE, REDESIGN_DESIGN_EVIDENCE],
    gate: PENDING_GATE,
  };
}

const PUBLIC_SHELL = ["PublicLayout", "HeaderIsland", "Footer"] as const;
const ACCOUNT_SHELL = ["AccountLayout", "AccountShellIsland"] as const;

export const STAGE_MANIFESTS: readonly StageManifest[] = [
  makeStage({
    id: "stage-1", order: 1, sheet: "1", routes: ["/"], dependsOn: null,
    sharedDependencies: ["design-tokens", "PublicLayout", "HeaderIsland", "Footer", "CanonicalTourCard"],
    componentsUsed: [...PUBLIC_SHELL, "HomeSearchIsland", "CanonicalTourCard"],
    evidence: [REDESIGN_REQUIREMENTS_EVIDENCE, REDESIGN_DESIGN_EVIDENCE, SPEC_A_EVIDENCE],
  }),
  makeStage({
    id: "stage-2", order: 2, sheet: "2", routes: ["/discovery"], dependsOn: "stage-1",
    sharedDependencies: ["design-tokens", "PublicLayout", "CanonicalTourCard", "catalog-url-state"],
    componentsUsed: [...PUBLIC_SHELL, "CatalogController", "CatalogMapIsland", "CanonicalTourCard"],
    evidence: [REDESIGN_REQUIREMENTS_EVIDENCE, REDESIGN_DESIGN_EVIDENCE, SPEC_A_EVIDENCE],
  }),
  makeStage({
    id: "stage-3", order: 3, sheet: "2-1", routes: ["/tours/[slug]"], dependsOn: "stage-2",
    sharedDependencies: ["design-tokens", "PublicLayout", "CanonicalTourCard", "SafeHtmlRenderer"],
    componentsUsed: [...PUBLIC_SHELL, "GalleryIsland", "BookingCalendarIsland", "CanonicalTourCard"],
    evidence: [REDESIGN_REQUIREMENTS_EVIDENCE, REDESIGN_DESIGN_EVIDENCE, SPEC_B_EVIDENCE],
  }),
  makeStage({
    id: "stage-4", order: 4, sheet: "3", routes: ["/destinations"], dependsOn: "stage-3",
    sharedDependencies: ["design-tokens", "PublicLayout", "discovery-native-links"],
    componentsUsed: [...PUBLIC_SHELL],
  }),
  makeStage({
    id: "stage-5", order: 5, sheet: "4", routes: ["/experiences"], dependsOn: "stage-4",
    sharedDependencies: ["design-tokens", "PublicLayout", "discovery-native-links"],
    componentsUsed: [...PUBLIC_SHELL],
  }),
  makeStage({
    id: "stage-6", order: 6, sheet: "5", routes: ["/blog", "/blog/[slug]"], dependsOn: "stage-5",
    sharedDependencies: ["design-tokens", "PublicLayout", "SafeHtmlRenderer", "SeoDescriptor"],
    componentsUsed: [...PUBLIC_SHELL, "PublicContentFilterIsland"],
  }),
  makeStage({
    id: "stage-7", order: 7, sheet: "6", routes: ["/about", "/contact"], dependsOn: "stage-6",
    sharedDependencies: ["design-tokens", "PublicLayout", "safe-public-config"],
    componentsUsed: [...PUBLIC_SHELL, "ContactFormIsland", "OfficeMapIsland"],
  }),
  makeStage({
    id: "stage-8", order: 8, sheet: "20", routes: ["/mi-cuenta"], dependsOn: "stage-7",
    sharedDependencies: ["design-tokens", "AccountLayout", "session-gate", "CanonicalTourCard"],
    componentsUsed: [...ACCOUNT_SHELL, "DashboardIsland", "CanonicalTourCard"],
  }),
  makeStage({
    id: "stage-9", order: 9, sheet: "21", routes: ["/mis-reservas"], dependsOn: "stage-8",
    sharedDependencies: ["design-tokens", "AccountLayout", "session-gate", "lifecycle-policy"],
    componentsUsed: [...ACCOUNT_SHELL, "LifecycleView"],
  }),
  makeStage({
    id: "stage-10", order: 10, sheet: "21-1", routes: ["/mis-reservas/[reference]"], dependsOn: "stage-9",
    sharedDependencies: ["design-tokens", "AccountLayout", "session-gate"],
    componentsUsed: [...ACCOUNT_SHELL, "BookingDetailActionsIsland", "MeetingMapIsland"],
  }),
  makeStage({
    id: "stage-11", order: 11, sheet: "21-2", routes: ["/checkout"], dependsOn: "stage-10",
    sharedDependencies: ["design-tokens", "AccountLayout", "session-gate", "protected-intent", "quote-oracle"],
    componentsUsed: [...ACCOUNT_SHELL, "BookingWizardIsland"],
  }),
  makeStage({
    id: "stage-12", order: 12, sheet: "22", routes: ["/perfil"], dependsOn: "stage-11",
    sharedDependencies: ["design-tokens", "AccountLayout", "session-gate", "sensitive-data-redaction"],
    componentsUsed: [...ACCOUNT_SHELL, "ProfileControlsIsland"],
  }),
  makeStage({
    id: "stage-13", order: 13, sheet: "23", routes: ["/coins"], dependsOn: "stage-12",
    sharedDependencies: ["design-tokens", "AccountLayout", "session-gate", "loyalty-contracts"],
    componentsUsed: [...ACCOUNT_SHELL, "CoinsHistoryIsland"],
  }),
  makeStage({
    id: "stage-14", order: 14, sheet: "24", routes: ["/favoritos"], dependsOn: "stage-13",
    sharedDependencies: ["design-tokens", "AccountLayout", "session-gate", "CanonicalTourCard"],
    componentsUsed: [...ACCOUNT_SHELL, "FavoritesIsland", "CanonicalTourCard"],
  }),
  makeStage({
    id: "stage-15", order: 15, sheet: "25", routes: ["/mensajes"], dependsOn: "stage-14",
    sharedDependencies: ["design-tokens", "AccountLayout", "session-gate", "messaging-contracts"],
    componentsUsed: [...ACCOUNT_SHELL, "MessagingIsland"],
  }),
];
