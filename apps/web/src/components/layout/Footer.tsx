/**
 * Footer — Pie de página completo del Portal B2C (R7).
 *
 * Estructura fiel al mockup etapa 1:
 *   1. Trust badges en fondo Arena (beige) con iconos verdes
 *   2. Footer principal (fondo Azul Profundo):
 *      - Col 1: Logo + slogan corto + redes sociales
 *      - Col 2: Destinos (links)
 *      - Col 3: Experiencias (links)
 *      - Col 4: Información (links)
 *      - Col 5: Contacto
 *   3. Copyright izq + "Hecho con ❤️ en Colombia" derecha
 *
 * TypeScript strict, sin `any`.
 */

import { Leaf, Camera, Shield, Users, MapPin, Phone, Mail, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { translate } from "../../lib/i18n/index";

// ─────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────

interface TrustBadge {
  readonly title: string;
  readonly text: string;
  readonly Icon: LucideIcon;
}

// ─────────────────────────────────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────────────────────────────────

const TRUST_BADGES: readonly TrustBadge[] = [
  { title: "Turismo Responsable", text: "Cuidamos los lugares que visitas.", Icon: Leaf },
  { title: "Experiencias Únicas", text: "Diseñamos viajes auténticos y memorables.", Icon: Camera },
  { title: "Seguridad Garantizada", text: "Tu tranquilidad es nuestra prioridad.", Icon: Shield },
  { title: "Atención Personalizada", text: "Estamos contigo en cada paso del viaje.", Icon: Users },
] as const;

const DESTINOS_LINKS = [
  { label: "Eje Cafetero", href: "/destinos?region=eje_cafetero" },
  { label: "Caribe", href: "/destinos?region=costa_caribe" },
  { label: "Amazonas", href: "/destinos?region=amazonia" },
  { label: "Andes", href: "/destinos?region=andes" },
  { label: "Pacífico", href: "/destinos?region=pacifico" },
];

const EXPERIENCIAS_LINKS = [
  { label: "Aventura", href: "/experiencias?cat=aventura" },
  { label: "Cultura", href: "/experiencias?cat=cultura" },
  { label: "Naturaleza", href: "/experiencias?cat=naturaleza" },
  { label: "Bienestar", href: "/experiencias?cat=bienestar" },
  { label: "Gastronomía", href: "/experiencias?cat=gastronomia" },
];

const INFO_LINKS = [
  { label: "Quiénes somos", href: "/nosotros" },
  { label: "Preguntas frecuentes", href: "/faq" },
  { label: "Términos y condiciones", href: "/terminos" },
  { label: "Políticas de privacidad", href: "/privacidad" },
  { label: "Blog", href: "/blog" },
];

// ─────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────

export function Footer(): React.JSX.Element {
  return (
    <footer role="contentinfo">
      {/* ─── Trust Badges — Fondo Arena (beige) ─── */}
      <div className="bg-arena py-10">
        <div className="mx-auto max-w-public px-page-gutter">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_BADGES.map((badge) => (
              <TrustBadgeItem key={badge.title} badge={badge} />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Footer principal — Fondo Azul Profundo ─── */}
      <div className="bg-azul-profundo text-blanco-niebla">
        <div className="mx-auto max-w-public px-page-gutter py-12">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
            {/* Col 1: Logo + slogan + redes */}
            <div className="lg:col-span-1">
              <img
                src="/logo-horizontal.svg"
                alt="Borondo Tours"
                className="mb-3 h-12 w-auto"
              />
              <p className="mt-2 text-sm leading-relaxed opacity-80">
                Explora donde nace la naturaleza.
              </p>
              {/* Redes sociales */}
              <div className="mt-4 flex items-center gap-3">
                <SocialIcon href="https://instagram.com/borondotours" label="Instagram">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                  </svg>
                </SocialIcon>
                <SocialIcon href="https://facebook.com/borondotours" label="Facebook">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </SocialIcon>
                <SocialIcon href="https://youtube.com/@borondotours" label="YouTube">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white" />
                  </svg>
                </SocialIcon>
                <SocialIcon href="https://tiktok.com/@borondotours" label="TikTok">
                  <TikTokIcon />
                </SocialIcon>
              </div>
            </div>

            {/* Col 2: Destinos */}
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider">
                Destinos
              </h3>
              <ul className="space-y-2">
                {DESTINOS_LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm opacity-70 transition-opacity hover:opacity-100">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Experiencias */}
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider">
                Experiencias
              </h3>
              <ul className="space-y-2">
                {EXPERIENCIAS_LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm opacity-70 transition-opacity hover:opacity-100">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Información */}
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider">
                Información
              </h3>
              <ul className="space-y-2">
                {INFO_LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm opacity-70 transition-opacity hover:opacity-100">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 5: Contacto */}
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider">
                Contacto
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm opacity-70">
                  <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span>+57 300 123 4567</span>
                </li>
                <li className="flex items-center gap-2 text-sm opacity-70">
                  <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span>hola@borondotours.com</span>
                </li>
                <li className="flex items-center gap-2 text-sm opacity-70">
                  <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span>Medellín, Colombia</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ─── Copyright + Hecho con ❤️ ─── */}
        <div className="border-t border-blanco-niebla/10">
          <div className="mx-auto max-w-public px-page-gutter py-5">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-xs opacity-60">
                © Borondo Tours. Todos los derechos reservados.
              </p>
              <p className="flex items-center gap-1 text-xs">
                <span className="opacity-60">Hecho con</span>
                <Heart className="h-3 w-3 fill-dorado text-dorado" aria-label="amor" />
                <span className="opacity-60">en Colombia</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Sub-componentes
// ─────────────────────────────────────────────────────────────────────────

function TrustBadgeItem({ badge }: { readonly badge: TrustBadge }): React.JSX.Element {
  const { title, text, Icon } = badge;

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-verde">
        <Icon
          className="h-5 w-5 text-verde"
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </div>
      <div>
        <h3 className="font-heading text-sm font-bold text-negro-volcanico">
          {title}
        </h3>
        <p className="text-xs text-negro-volcanico/60">
          {text}
        </p>
      </div>
    </div>
  );
}

interface SocialIconProps {
  readonly href: string;
  readonly label: string;
  readonly children: React.ReactNode;
}

function SocialIcon({ href, label, children }: SocialIconProps): React.JSX.Element {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-dorado/50 text-dorado transition-colors hover:border-dorado hover:text-dorado"
    >
      {children}
    </a>
  );
}

/** TikTok icon (no disponible en Lucide) */
function TikTokIcon(): React.JSX.Element {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .56.04.82.1V9.03a6.35 6.35 0 0 0-.82-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52V7.12a4.84 4.84 0 0 1-1.01-.43z" />
    </svg>
  );
}

export default Footer;
