import {
  REDESIGN_MANIFEST_SCHEMA_VERSION,
  type IslandRegistry,
  type IslandRegistryEntry,
} from "../../src/lib/redesignManifests";
import { FIXTURE_VERSION } from "./evidence";

function island(entry: IslandRegistryEntry): IslandRegistryEntry {
  return entry;
}

export const ISLAND_REGISTRY: IslandRegistry = {
  schemaVersion: REDESIGN_MANIFEST_SCHEMA_VERSION,
  fixtureVersion: FIXTURE_VERSION,
  entries: [
    island({ name: "HeaderIsland", routes: ["*"], ownedState: ["drawer", "auth trigger", "hero mode"], directive: "client:idle", justification: "Global navigation is not required for LCP.", implementationStatus: "existing", capabilityMode: "enabled" }),
    island({ name: "HomeSearchIsland", routes: ["/"], ownedState: ["destination", "date", "travelers", "validation issues"], directive: "client:idle", justification: "Local validation and native catalog navigation can wait for idle.", implementationStatus: "planned", capabilityMode: "enabled" }),
    island({ name: "AuthGateIsland", routes: ["protected actions"], ownedState: ["dialog", "form", "focus", "protected intent"], directive: "client:idle", justification: "The dialog is mounted for on-demand protected actions.", implementationStatus: "planned", capabilityMode: "contract_dependent" }),
    island({ name: "CatalogController", routes: ["/discovery"], ownedState: ["URL", "filters", "sort", "page", "view", "query"], directive: "client:load", justification: "Primary route interaction must restore canonical URL state immediately.", implementationStatus: "existing", capabilityMode: "contract_dependent" }),
    island({ name: "CatalogMapIsland", routes: ["/discovery"], ownedState: ["map", "markers", "popup", "fallback"], directive: "client:visible", justification: "Mapbox must be absent until the map enters the viewport.", implementationStatus: "planned", capabilityMode: "contract_dependent" }),
    island({ name: "GalleryIsland", routes: ["/tours/[slug]"], ownedState: ["index", "lightbox", "controls"], directive: "client:visible", justification: "Gallery controls hydrate only when visible.", implementationStatus: "planned", capabilityMode: "contract_dependent" }),
    island({ name: "BookingCalendarIsland", routes: ["/tours/[slug]"], ownedState: ["month", "date", "availability", "instance price", "messages"], directive: "client:visible", justification: "Complex below-the-fold widget isolated from static tour content.", implementationStatus: "planned", capabilityMode: "contract_dependent" }),
    island({ name: "PublicContentFilterIsland", routes: ["/blog"], ownedState: ["query", "category", "sort", "URL"], directive: "client:visible", justification: "Only mounted when an approved content source exists.", implementationStatus: "planned", capabilityMode: "visual_only" }),
    island({ name: "ContactFormIsland", routes: ["/contact"], ownedState: ["fields", "validation", "submission"], directive: "client:visible", justification: "Submission requires an approved endpoint and consent contract.", implementationStatus: "planned", capabilityMode: "visual_only" }),
    island({ name: "OfficeMapIsland", routes: ["/contact"], ownedState: ["map", "fallback"], directive: "client:visible", justification: "Heavy map dependency remains deferred and has a textual fallback.", implementationStatus: "planned", capabilityMode: "visual_only" }),
    island({ name: "AccountShellIsland", routes: ["/mi-cuenta", "/mis-reservas*", "/checkout", "/perfil", "/coins", "/favoritos", "/mensajes"], ownedState: ["session bootstrap", "identity", "logout", "private cache gate"], directive: "client:load", justification: "Blocks all private data until client session validation.", implementationStatus: "planned", capabilityMode: "contract_dependent" }),
    island({ name: "DashboardIsland", routes: ["/mi-cuenta"], ownedState: ["next booking", "approved dashboard modules"], directive: "client:load", justification: "Nested under the account gate for private data.", implementationStatus: "planned", capabilityMode: "contract_dependent" }),
    island({ name: "LifecycleView", routes: ["/mis-reservas"], ownedState: ["category", "year", "destination", "pagination"], directive: "client:load", justification: "Primary private route navigation and data.", implementationStatus: "planned", capabilityMode: "contract_dependent" }),
    island({ name: "BookingDetailActionsIsland", routes: ["/mis-reservas/[reference]"], ownedState: ["voucher", "cancellation dialog", "OTP", "support"], directive: "client:load", justification: "Protected effects stay disabled until contracts are complete.", implementationStatus: "planned", capabilityMode: "contract_dependent" }),
    island({ name: "MeetingMapIsland", routes: ["/mis-reservas/[reference]"], ownedState: ["meeting map", "fallback"], directive: "client:visible", justification: "Private map code is deferred until visible.", implementationStatus: "planned", capabilityMode: "contract_dependent" }),
    island({ name: "BookingWizardIsland", routes: ["/checkout"], ownedState: ["step", "passengers", "add-ons", "Coins", "payment state"], directive: "client:load", justification: "Coherent protected transactional flow.", implementationStatus: "planned", capabilityMode: "contract_dependent" }),
    island({ name: "ProfileControlsIsland", routes: ["/perfil"], ownedState: ["forms", "consent", "upload", "OTP", "sessions"], directive: "client:load", justification: "Sensitive controls remain behind session and capability gates.", implementationStatus: "planned", capabilityMode: "contract_dependent" }),
    island({ name: "CoinsHistoryIsland", routes: ["/coins"], ownedState: ["filters", "cursor", "remote state"], directive: "client:load", justification: "Private filterable ledger projection.", implementationStatus: "planned", capabilityMode: "contract_dependent" }),
    island({ name: "FavoritesIsland", routes: ["/favoritos"], ownedState: ["favorites", "filters", "optimistic state"], directive: "client:load", justification: "Mutation requires reversible approved contract behavior.", implementationStatus: "planned", capabilityMode: "contract_dependent" }),
    island({ name: "MessagingIsland", routes: ["/mensajes"], ownedState: ["inbox", "selection", "composer", "connection"], directive: "client:load", justification: "Messaging effects remain visual-only until history, event and authorization contracts exist.", implementationStatus: "planned", capabilityMode: "visual_only" }),
  ],
};
