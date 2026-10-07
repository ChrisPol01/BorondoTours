/**
 * Centro legal de /nosotros: ancla, resumen y texto completo de cada documento.
 *
 * Marco de referencia (Colombia): Ley 300 de 1996 y Decreto 1074 de 2015 (prestadores de servicios
 * turísticos), Decreto 2438 de 2010 (responsabilidad de agencias), Ley 1480 de 2011 (Estatuto del
 * Consumidor: retracto art. 47, reversión del pago art. 51 y Decreto 587 de 2016), Ley 1581 de 2012
 * y Decreto 1377 de 2013 (datos personales), Leyes 679 de 2001 y 1336 de 2009 (ESCNNA),
 * Ley 2300 de 2023 (contacto comercial) y la política de cancelación de BorondoTours (ADR-007).
 *
 * ⚠️ Textos de trabajo para la demostración: deben revisarse con asesoría legal antes de publicarse.
 * Las anclas coinciden con las de otros/infra/fig2astro/postprocess.mjs.
 */

export interface LegalSection {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

export interface LegalDoc {
  readonly anchor: string;
  /** Título tal como aparece en el diseño (se usa para ubicar el bloque). */
  readonly title: string;
  readonly summary: string;
  readonly sections: readonly LegalSection[];
}

export const LEGAL_UPDATED = "29 de septiembre de 2026";

export const LEGAL_COMPANY = {
  name: "BorondoTours S.A.S.",
  nit: "902.083.08-7",
  rnt: "294364",
  city: "Cali, Valle del Cauca, Colombia",
  email: "contacto@borondotours.com",
  privacyEmail: "proteccion.datos@borondotours.com",
  hours: "lunes a sábado, de 8:00 a. m. a 5:00 p. m.",
} as const;

const C = LEGAL_COMPANY;

export const LEGAL_DOCS: readonly LegalDoc[] = [
  {
    anchor: "terminos",
    title: "Términos y condiciones",
    summary:
      "Las reglas para reservar con BorondoTours: quién presta cada servicio, cómo se paga, qué te pedimos y hasta dónde responde cada parte.",
    sections: [
      {
        heading: "1. Quiénes somos",
        paragraphs: [
          `${C.name} (NIT ${C.nit}, RNT ${C.rnt}, domicilio en ${C.city}) opera la plataforma borondotours.com como agencia de viajes. Mostramos, vendemos y gestionamos tours que ejecutan operadores turísticos locales con su propio Registro Nacional de Turismo.`,
          "Al crear una cuenta o hacer una reserva aceptas estos términos, la Política de tratamiento de datos, la Política de cancelación y la Política de cookies. Si no estás de acuerdo, no uses la plataforma.",
        ],
      },
      {
        heading: "2. Cómo funciona la reserva",
        paragraphs: [
          "La reserva queda confirmada solo cuando la pasarela de pagos aprueba el pago y te enviamos el correo de confirmación con tu código. Mientras el pago está pendiente, el cupo se aparta por un tiempo limitado y se libera si el pago no se completa.",
          "El precio se fija en el momento de crear la reserva y se muestra en pesos colombianos con impuestos incluidos. El costo del medio de pago se informa antes de confirmar.",
          "Algunos tours admiten abono. El saldo debe pagarse antes de la fecha límite que se indica en el checkout y en el correo. Si el saldo no se paga a tiempo, la reserva se cancela y el abono no se reembolsa, porque el cupo quedó bloqueado para ti.",
        ],
      },
      {
        heading: "3. Lo que te pedimos",
        paragraphs: [
          "Dar datos reales y completos de cada viajero, incluido un documento de identidad válido. Los extranjeros no residentes que pidan la exención de IVA deben cargar su pasaporte.",
          "Revisar los requisitos de cada tour (edad, estatura, condición física, vacunas, equipo) y llegar a tiempo al punto de encuentro. Si no llegas, aplica la regla de no presentación de la Política de cancelación.",
          "Seguir las instrucciones del guía, respetar a las comunidades, la fauna y la flora, y cumplir las normas de los parques y reservas. El guía puede excluir del tour, sin reembolso, a quien ponga en riesgo al grupo o incumpla estas normas.",
          "Informar condiciones médicas relevantes. Esta información es opcional, pero sin ella el operador no puede adaptar el servicio.",
        ],
      },
      {
        heading: "4. Responsabilidades",
        paragraphs: [
          "BorondoTours responde por la información que publica, por la gestión de tu reserva y de tus pagos, y por la atención durante todo el proceso, en los términos del Decreto 2438 de 2010 y del Estatuto del Consumidor.",
          "El operador turístico responde por la ejecución del tour: transporte, guianza, alimentación, seguridad y seguros propios de la actividad. Cuando un operador incumple, te ayudamos a reclamar y, si corresponde, a reprogramar o recibir el reembolso.",
          "Ninguna de las partes responde por hechos de fuerza mayor o caso fortuito, como clima extremo, cierres de vías, decisiones de autoridades o desastres naturales. En esos casos el tour puede reprogramarse o cancelarse según la Política de cancelación.",
          "Nada en estos términos limita los derechos que la ley colombiana te reconoce como consumidor.",
        ],
      },
      {
        heading: "5. Uso de la plataforma",
        paragraphs: [
          "Tu cuenta es personal. Cuida tu contraseña y avísanos si sospechas que alguien más la usa. Podemos suspender cuentas que se usen para fraude, suplantación, reventa no autorizada o abuso del servicio.",
          "Las fotos, textos, marcas y el diseño de la plataforma pertenecen a BorondoTours o a sus aliados. No puedes copiarlos ni usarlos con fines comerciales sin autorización.",
          "Las reseñas solo pueden escribirlas viajeros con un tour completado. Retiramos contenido falso, ofensivo o que no tenga relación con la experiencia.",
        ],
      },
      {
        heading: "6. Protección de niñas, niños y adolescentes",
        paragraphs: [
          "BorondoTours rechaza la explotación y el abuso sexual de niñas, niños y adolescentes. En cumplimiento de las Leyes 679 de 2001 y 1336 de 2009, advertimos que estas conductas son delitos en Colombia y se denuncian ante las autoridades. Los menores de edad viajan acompañados por su representante legal o con la autorización que exija la ley.",
        ],
      },
      {
        heading: "7. Quejas, ley aplicable y cambios",
        paragraphs: [
          `Puedes enviar peticiones, quejas o reclamos a ${C.email}. Respondemos dentro de los 15 días hábiles que fija la ley. También puedes acudir a la Superintendencia de Industria y Comercio.`,
          "Estos términos se rigen por las leyes de Colombia. Si cambian, publicamos la nueva versión con su fecha. Las reservas ya confirmadas se rigen por los términos vigentes al momento de la compra.",
        ],
      },
    ],
  },
  {
    anchor: "privacidad",
    title: "Política de tratamiento de datos",
    summary:
      "Tratamos tus datos según la Ley 1581 de 2012 solo para gestionar tus reservas. Consúltalos, corrígelos o pide eliminarlos en proteccion.datos@borondotours.com.",
    sections: [
      {
        heading: "1. Responsable del tratamiento",
        paragraphs: [
          `${C.name}, NIT ${C.nit}, ${C.city}. Correo para temas de datos personales: ${C.privacyEmail}. Esta política cumple la Ley 1581 de 2012 y el Decreto 1377 de 2013.`,
        ],
      },
      {
        heading: "2. Qué datos tratamos",
        paragraphs: [
          "Datos de identificación y contacto: nombre, documento, correo, teléfono, ciudad y contacto de emergencia.",
          "Datos de la reserva y del pago: tours, fechas, viajeros, montos y referencias de la transacción. No guardamos los números de tu tarjeta: los procesa la pasarela de pagos.",
          "Datos sensibles, solo si los entregas y con autorización separada: condiciones médicas para adaptar el tour y la foto del pasaporte para la exención de IVA. No es obligatorio entregarlos.",
          "Datos técnicos: dirección IP, tipo de navegador y cookies, según la Política de cookies.",
        ],
      },
      {
        heading: "3. Para qué los usamos",
        paragraphs: [
          "Gestionar tus reservas, pagos, facturas, cambios y cancelaciones; compartir con el operador del tour los datos que necesita para prestarlo (manifiesto de pasajeros); atenderte y enviarte avisos del servicio; cumplir obligaciones legales, tributarias y de turismo; prevenir fraude; y, solo si lo autorizas, enviarte ofertas.",
        ],
      },
      {
        heading: "4. Con quién los compartimos",
        paragraphs: [
          "Con el operador que ejecuta tu tour, con la pasarela de pagos, con nuestros proveedores de tecnología y correo (que actúan como encargados y deben proteger tus datos) y con autoridades cuando la ley lo exija. Algunos proveedores alojan datos fuera de Colombia, con niveles de protección adecuados.",
          "No vendemos tus datos.",
        ],
      },
      {
        heading: "5. Cuánto tiempo los guardamos",
        paragraphs: [
          "Mientras tengas cuenta activa. Los datos de reservas y pagos, y la foto del pasaporte, se conservan 5 años por obligación tributaria. Las condiciones médicas se borran 30 días después del tour. Los registros técnicos se guardan 90 días.",
          "Cuando pides la eliminación, anonimizamos tus datos y conservamos solo lo que la ley nos obliga a guardar.",
        ],
      },
      {
        heading: "6. Tus derechos y cómo ejercerlos",
        paragraphs: [
          "Puedes conocer, actualizar, rectificar y pedir la supresión de tus datos, revocar la autorización, pedir prueba de ella y saber cómo los usamos. Escríbenos a " +
            C.privacyEmail +
            " con tu nombre, documento y la solicitud.",
          "Respondemos las consultas en máximo 10 días hábiles y los reclamos en máximo 15 días hábiles, prorrogables según la ley. Si no quedas conforme, puedes acudir a la Superintendencia de Industria y Comercio.",
        ],
      },
      {
        heading: "7. Comunicaciones comerciales",
        paragraphs: [
          "Solo te enviamos ofertas si lo autorizas, y puedes darte de baja en cualquier momento. Respetamos la Ley 2300 de 2023: no te contactamos por teléfono o mensajería con fines comerciales fuera de los días y horarios que ella permite.",
        ],
      },
    ],
  },
  {
    anchor: "cancelacion",
    title: "Política de cancelación",
    summary:
      "Con 10 días o más reprogramas sin costo o se retiene el 40 %. De 5 a 9 días se retiene el 60 %. Con menos de 5 días o si no llegas, se retiene el 100 %.",
    sections: [
      {
        heading: "1. Si cancelas tú",
        paragraphs: [
          "10 días o más antes del tour: puedes reprogramar sin costo (hasta 2 veces, sujeto a cupo). Si prefieres cancelar, se retiene el 40 % y el 60 % queda como saldo a favor en tu cuenta.",
          "De 5 a 9 días antes: se retiene el 60 % y el 40 % queda como saldo a favor.",
          "Menos de 5 días antes o no presentarte: se retiene el 100 %.",
          "El saldo a favor se usa en cualquier tour de la plataforma. No se reembolsa al medio de pago, salvo en los casos de la sección 4.",
        ],
      },
      {
        heading: "2. Fuerza mayor del viajero",
        paragraphs: [
          "Si no puedes viajar por una razón de salud o una calamidad familiar de primer grado, y lo demuestras con un soporte (por ejemplo, certificado médico o de la EPS), la retención baja al 10 % con 10 días o más y al 30 % de 5 a 9 días. Con menos de 5 días revisamos tu caso.",
        ],
      },
      {
        heading: "3. Si cancela el operador o hay fuerza mayor",
        paragraphs: [
          "Si el operador cancela o el tour no puede hacerse por clima, cierres de vías u orden de autoridad, te ofrecemos primero otra fecha. Si no te sirve, recibes el 100 % de lo pagado.",
        ],
      },
      {
        heading: "4. Cuándo se devuelve el dinero al medio de pago",
        paragraphs: [
          "Cuando ejerces el derecho de retracto, cuando el operador cancela y no aceptas otra fecha, cuando procede la reversión del pago o cuando lo ordena una autoridad. El reembolso se hace al mismo medio de pago.",
        ],
      },
      {
        heading: "5. Abonos y reprogramaciones",
        paragraphs: [
          "Si pagaste un abono y no pagas el saldo antes de la fecha límite, la reserva se cancela y el abono no se reembolsa. Si reprogramas a una fecha más cara, pagas la diferencia; si es más barata, la diferencia no se devuelve.",
          "Algunos operadores tienen condiciones especiales. Si aplican, las ves antes de pagar y prevalecen sobre esta política general.",
        ],
      },
    ],
  },
  {
    anchor: "retracto",
    title: "Derecho de retracto",
    summary:
      "Puedes retractarte dentro de los 5 días hábiles siguientes a tu compra (Ley 1480 de 2011) si el servicio no ha empezado. Devolvemos el valor al mismo medio de pago.",
    sections: [
      {
        heading: "1. Retracto",
        paragraphs: [
          "Como compraste a distancia, el artículo 47 de la Ley 1480 de 2011 te permite retractarte dentro de los 5 días hábiles siguientes a la compra, siempre que el servicio no haya empezado a prestarse y salvo las excepciones de la ley.",
          `Para ejercerlo, escribe a ${C.email} o usa el chat de soporte con tu código de reserva. Devolvemos el dinero al mismo medio de pago en un plazo máximo de 30 días calendario.`,
        ],
      },
      {
        heading: "2. Reversión del pago",
        paragraphs: [
          "Si pagaste con un medio electrónico y fuiste víctima de fraude, la operación no fue solicitada, el servicio no se prestó o no corresponde a lo comprado, puedes pedir la reversión del pago (artículo 51 de la Ley 1480 y Decreto 587 de 2016).",
          "Debes avisarnos y avisar a tu banco dentro de los 5 días hábiles siguientes a saber del problema. Revisamos el caso con la pasarela de pagos.",
        ],
      },
      {
        heading: "3. Qué no cubre",
        paragraphs: [
          "El retracto no aplica a tours que ya empezaron ni a los casos excluidos por la ley. En esos casos rige la Política de cancelación.",
        ],
      },
    ],
  },
  {
    anchor: "cookies",
    title: "Política de cookies",
    summary:
      "Usamos cookies necesarias para que el sitio funcione y, solo si las aceptas, de analítica para mejorarlo. Cambia tu elección cuando quieras en el aviso de cookies.",
    sections: [
      {
        heading: "1. Qué son",
        paragraphs: [
          "Las cookies y tecnologías similares son pequeños archivos que el sitio guarda en tu navegador para recordar información entre visitas.",
        ],
      },
      {
        heading: "2. Cuáles usamos",
        paragraphs: [
          "Necesarias: mantienen tu sesión, el carrito, el idioma, el tema y la seguridad. Sin ellas el sitio no funciona y no requieren tu autorización.",
          "Analítica: nos dicen qué páginas se visitan y dónde hay errores, con datos agregados. Solo se activan si las aceptas.",
          "No usamos cookies publicitarias de terceros para seguirte en otros sitios.",
        ],
      },
      {
        heading: "3. Cómo gestionarlas",
        paragraphs: [
          "Cambia tu elección cuando quieras desde el aviso de cookies o desde la configuración de tu navegador. Si bloqueas las necesarias, algunas funciones dejarán de operar.",
          `Si tienes preguntas, escribe a ${C.privacyEmail}.`,
        ],
      },
    ],
  },
];

/** Busca el documento por el ancla de la URL (sin "#"). */
export function legalDocByAnchor(anchor: string): LegalDoc | undefined {
  const key = anchor.replace(/^#/, "").trim().toLowerCase();
  return LEGAL_DOCS.find((doc) => doc.anchor === key);
}
