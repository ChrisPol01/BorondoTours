import {
  REDESIGN_MANIFEST_SCHEMA_VERSION,
  type StageId,
  type VisualAnchor,
  type VisualBaselineManifest,
} from "../../src/lib/redesignManifests";
import { FIXTURE_VERSION } from "./evidence";
import { baselineId, STAGE_MANIFESTS } from "./stages";

const MOCKUP_BY_STAGE: Readonly<Record<StageId, string>> = {
  "stage-1": "otros/design/b2c/1-Inicio de pagina web.png",
  "stage-2": "otros/design/b2c/2-Catalogo pagina web.png",
  "stage-3": "otros/design/b2c/2-1-Reserva de tour seleccionado pagina web.png",
  "stage-4": "otros/design/b2c/3-Seleccion de destinos pagina web.png",
  "stage-5": "otros/design/b2c/4-Experiencias pagina web.png",
  "stage-6": "otros/design/b2c/5-Blog pagina web.png",
  "stage-7": "otros/design/b2c/6-Nosotros y contacto pagina web.png",
  "stage-8": "otros/design/b2c/20-Panel usuario pagina web.png",
  "stage-9": "otros/design/b2c/21-Mis tours usuario pagina web.png",
  "stage-10": "otros/design/b2c/21-1-Detalle de reserva de tour usuario pagina web.png",
  "stage-11": "otros/design/b2c/21-2-Proceso de reservas usuario pagina web.png",
  "stage-12": "otros/design/b2c/22-Perfil usuario pagina web.png",
  "stage-13": "otros/design/b2c/23-Borondo Coins usuario pagina web.png",
  "stage-14": "otros/design/b2c/24-Tours favoritos usuario pagina web.png",
  "stage-15": "otros/design/b2c/25-Mensajes usuarios pagina web.png",
};

const ANCHORS_BY_STAGE: Readonly<Record<StageId, readonly VisualAnchor[]>> = {
  "stage-1": [pending("header", "[data-visual-anchor='header']"), pending("hero-heading", "h1"), pending("home-search", "[data-visual-anchor='home-search']")],
  "stage-2": [pending("catalog-heading", "h1"), pending("catalog-controls", "[data-visual-anchor='catalog-controls']"), pending("catalog-grid", "[data-visual-anchor='catalog-grid']")],
  "stage-3": [pending("tour-gallery", "[data-visual-anchor='tour-gallery']"), pending("tour-heading", "h1"), pending("booking-calendar", "[data-visual-anchor='booking-calendar']")],
  "stage-4": routeAnchors("destinations"),
  "stage-5": routeAnchors("experiences"),
  "stage-6": routeAnchors("blog"),
  "stage-7": routeAnchors("company"),
  "stage-8": accountAnchors("dashboard"),
  "stage-9": accountAnchors("lifecycle"),
  "stage-10": accountAnchors("booking-detail"),
  "stage-11": accountAnchors("checkout"),
  "stage-12": accountAnchors("profile"),
  "stage-13": accountAnchors("coins"),
  "stage-14": accountAnchors("favorites"),
  "stage-15": accountAnchors("messaging"),
};
function pending(name: string, selector: string): VisualAnchor {
  return { name, selector, status: "pending_measurement" };
}

function routeAnchors(region: string): readonly VisualAnchor[] {
  return [
    pending("header", "[data-visual-anchor='header']"),
    pending(`${region}-heading`, "h1"),
    pending(`${region}-primary`, `[data-visual-anchor='${region}-primary']`),
  ];
}

function accountAnchors(region: string): readonly VisualAnchor[] {
  return [
    pending("account-navigation", "[data-visual-anchor='account-navigation']"),
    pending(`${region}-heading`, "h1"),
    pending(`${region}-primary`, `[data-visual-anchor='${region}-primary']`),
  ];
}

function fixtureName(stageId: StageId, route: string): string {
  const routeKey = route === "/" ? "home" : route.replaceAll(/[^a-z]+/gi, "-").replaceAll(/^-|-$/g, "");
  return `b2c-redesign/${stageId}/${routeKey}`;
}

export const VISUAL_BASELINE_MANIFESTS: readonly VisualBaselineManifest[] =
  STAGE_MANIFESTS.flatMap((stage) =>
    stage.routes.flatMap((route) =>
      ([
        { width: 375 as const, height: 812 as const },
        { width: 1440 as const, height: 900 as const },
      ]).map((viewport) => ({
        schemaVersion: REDESIGN_MANIFEST_SCHEMA_VERSION,
        fixtureVersion: FIXTURE_VERSION,
        id: baselineId(stage.id, route, viewport.width),
        stageId: stage.id,
        route,
        viewport,
        fixture: fixtureName(stage.id, route),
        locale: "es" as const,
        clock: "2026-08-01T15:00:00.000Z",
        mockupSource: MOCKUP_BY_STAGE[stage.id],
        approvedImage: null,
        approval: "pending" as const,
        anchors: ANCHORS_BY_STAGE[stage.id],
        approvedDifferences: [],
      })),
    ),
  );
