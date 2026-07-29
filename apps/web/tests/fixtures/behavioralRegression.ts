import {
  REDESIGN_MANIFEST_SCHEMA_VERSION,
  type BehavioralRegressionEntry,
  type BehavioralRegressionMatrix,
  type CapabilityMode,
  type SourceEvidence,
} from "../../src/lib/redesignManifests";
import {
  FIXTURE_VERSION,
  REDESIGN_REQUIREMENTS_EVIDENCE,
  SPEC_A_EVIDENCE,
  SPEC_B_EVIDENCE,
} from "./evidence";

interface RegressionSeed {
  id: string;
  route: string;
  capability: string;
  input: string;
  userAction: string;
  observableResult: string;
  dataContract: string;
  capabilityMode: CapabilityMode;
  testId: string;
  testPath?: string;
  evidence?: readonly SourceEvidence[];
}

function regression(seed: RegressionSeed): BehavioralRegressionEntry {
  return {
    ...seed,
    evidence: seed.evidence ?? [REDESIGN_REQUIREMENTS_EVIDENCE],
    regressionTest: {
      id: seed.testId,
      status: seed.testPath ? "implemented" : "planned",
      path: seed.testPath,
    },
  };
}

export const BEHAVIORAL_REGRESSION_MATRIX: BehavioralRegressionMatrix = {
  schemaVersion: REDESIGN_MANIFEST_SCHEMA_VERSION,
  fixtureVersion: FIXTURE_VERSION,
  entries: [
    regression({ id: "home-search", route: "/", capability: "Home search", input: "destination, date and travelers", userAction: "Submit valid search", observableResult: "Navigate to /discovery with canonical criteria", dataContract: "Native navigation; catalog state contract", capabilityMode: "enabled", testId: "home-search-component", testPath: "src/components/landing/SearchWidget.test.tsx", evidence: [SPEC_A_EVIDENCE, REDESIGN_REQUIREMENTS_EVIDENCE] }),
    regression({ id: "home-planner", route: "/", capability: "Trip planner", input: "No data captured", userAction: "Activate planner CTA", observableResult: "Show explanatory Visual_Only_State without request or success", dataContract: "Missing; Product Approval required", capabilityMode: "visual_only", testId: "home-planner-no-effect" }),
    regression({ id: "catalog-search", route: "/discovery", capability: "Search, filters and ordering", input: "Canonical query parameters", userAction: "Change a catalog criterion", observableResult: "Preserve URL-compatible state and recoverable results", dataContract: "TourSearchSchema request; response schema pending", capabilityMode: "contract_dependent", testId: "discovery-integration", testPath: "src/components/discovery/Discovery.integration.test.tsx", evidence: [SPEC_A_EVIDENCE, REDESIGN_REQUIREMENTS_EVIDENCE] }),
    regression({ id: "catalog-map", route: "/discovery", capability: "List/map projection", input: "Filtered tours with valid coordinates", userAction: "Switch to map", observableResult: "Show matching markers or list fallback without losing filters", dataContract: "Catalog response schema pending", capabilityMode: "contract_dependent", testId: "catalog-map-component", testPath: "src/components/discovery/MapView.test.tsx", evidence: [SPEC_A_EVIDENCE, REDESIGN_REQUIREMENTS_EVIDENCE] }),
    regression({ id: "tour-content", route: "/tours/[slug]", capability: "Published tour detail", input: "Public tour slug", userAction: "Open canonical tour URL", observableResult: "Render approved public tour fields without invented content", dataContract: "Tour page-data response schema pending", capabilityMode: "contract_dependent", testId: "tour-detail-e2e", testPath: "e2e/tour-detail.spec.ts", evidence: [SPEC_B_EVIDENCE, REDESIGN_REQUIREMENTS_EVIDENCE] }),
    regression({ id: "tour-calendar", route: "/tours/[slug]", capability: "Availability and instance price", input: "Offered future date", userAction: "Select a date", observableResult: "Single safe selection and authoritative instance price", dataContract: "Instance availability/price response schema pending", capabilityMode: "contract_dependent", testId: "availability-calendar", testPath: "src/components/detail/AvailabilityCalendar.test.tsx", evidence: [SPEC_B_EVIDENCE, REDESIGN_REQUIREMENTS_EVIDENCE] }),
    regression({ id: "destinations-links", route: "/destinations", capability: "Region discovery links", input: "Published region", userAction: "Activate region", observableResult: "Navigate to /discovery with exactly the region filter", dataContract: "Native canonical URL projection", capabilityMode: "enabled", testId: "destinations-native-links" }),
    regression({ id: "experiences-links", route: "/experiences", capability: "Experience discovery links", input: "Approved category", userAction: "Activate category", observableResult: "Navigate to /discovery with exactly the category filter", dataContract: "Native canonical URL projection", capabilityMode: "enabled", testId: "experiences-native-links" }),
    regression({ id: "blog-publication", route: "/blog", capability: "Published article listing", input: "Approved build snapshot", userAction: "Open blog", observableResult: "Render only approved published content", dataContract: "Published content manifest pending", capabilityMode: "contract_dependent", testId: "blog-publication" }),
    regression({ id: "blog-article", route: "/blog/[slug]", capability: "Published article detail", input: "Published article slug", userAction: "Open article", observableResult: "Render SSG article through SafeHtml when needed", dataContract: "Published content manifest pending", capabilityMode: "contract_dependent", testId: "blog-article" }),
    regression({ id: "about-static", route: "/about", capability: "Company content", input: "Approved static content", userAction: "Open page", observableResult: "Render static Ave Azul composition without hydration", dataContract: "Approved build content", capabilityMode: "enabled", testId: "about-static" }),
    regression({ id: "contact-gates", route: "/contact", capability: "Contact form and office map", input: "No personal data captured while unapproved", userAction: "Inspect or activate controls", observableResult: "Accessible Visual_Only_State and textual map fallback without requests", dataContract: "Contact and map contracts missing", capabilityMode: "visual_only", testId: "contact-no-effect" }),
    regression({ id: "dashboard-session", route: "/mi-cuenta", capability: "Private dashboard", input: "HttpOnly refresh cookie", userAction: "Open route directly", observableResult: "Validate CLIENT session before rendering private data", dataContract: "Session bootstrap and dashboard responses pending", capabilityMode: "contract_dependent", testId: "dashboard-session-gate" }),
    regression({ id: "booking-lifecycle", route: "/mis-reservas", capability: "Booking lifecycle list", input: "Approved booking state and policy", userAction: "Filter lifecycle", observableResult: "Preserve mutually exclusive approved lifecycle categories", dataContract: "Booking list and lifecycle policy contracts pending", capabilityMode: "contract_dependent", testId: "booking-lifecycle" }),
    regression({ id: "booking-detail", route: "/mis-reservas/[reference]", capability: "Authorized booking detail and actions", input: "Opaque authorized reference", userAction: "View detail or request an approved action", observableResult: "Render authorized projection; require OTP before cancellation effect", dataContract: "Detail, voucher and cancellation preview responses pending", capabilityMode: "contract_dependent", testId: "booking-detail-actions" }),
    regression({ id: "checkout", route: "/checkout", capability: "Protected booking wizard", input: "Safe protected intent and valid draft", userAction: "Validate steps and submit through approved effect", observableResult: "Project authoritative quote and never claim unconfirmed payment", dataContract: "Checkout request exists; quote/payment responses pending", capabilityMode: "contract_dependent", testId: "checkout-contract-gate" }),
    regression({ id: "profile", route: "/perfil", capability: "Profile and sensitive controls", input: "Validated draft with separate consent", userAction: "Attempt profile control", observableResult: "No sensitive capture or mutation until contract and approval exist", dataContract: "Profile, consent, upload and session contracts pending", capabilityMode: "visual_only", testId: "profile-no-effect" }),
    regression({ id: "coins", route: "/coins", capability: "Wallet and loyalty history", input: "Authoritative balance, XP and ledger", userAction: "Filter history", observableResult: "Do not alter balance or XP; no frontend financial calculation", dataContract: "Wallet and loyalty response schemas pending", capabilityMode: "contract_dependent", testId: "coins-independent-projection" }),
    regression({ id: "favorites", route: "/favoritos", capability: "Favorites", input: "Authorized favorite version", userAction: "Toggle favorite", observableResult: "Only approved mutation may optimistically commit and rollback", dataContract: "Favorite list/mutation/version contract pending", capabilityMode: "contract_dependent", testId: "favorites-reversible" }),
    regression({ id: "messaging", route: "/mensajes", capability: "Inbox and conversation", input: "No message or file captured while unapproved", userAction: "Operate visual inbox", observableResult: "No read, send, upload or connection effect", dataContract: "Inbox, history, events and attachment contracts pending", capabilityMode: "visual_only", testId: "messaging-no-effect" }),
  ],
};
