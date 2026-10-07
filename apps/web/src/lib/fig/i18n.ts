/**
 * Traducción de las vistas generadas desde Figma (español → en, fr, zh, ja, pt).
 *
 * Las páginas de fig2astro no tienen claves i18n: el texto llega en español desde el diseño.
 * Por eso se traduce por texto fuente: el diccionario usa como clave la frase exacta en español y
 * exige las cinco traducciones (si falta una, TypeScript no compila). Las frases con cifras
 * ("4 días · desde $1.450.000", "64 tours") se resuelven con patrones.
 *
 * Alcance: navegación, Home, colofón, menús, vitrinas y asistente (aquí), y Blog, catálogo,
 * acceso, contacto y centro legal (i18n-content.ts). Los textos legales completos quedan en
 * español, que es la versión que rige.
 */
import { CONTENT_DICTIONARY, CONTENT_PATTERNS } from "./i18n-content";

export const LANGUAGES = [
  { code: "es", label: "Español", short: "ES" },
  { code: "en", label: "English", short: "EN" },
  { code: "fr", label: "Français", short: "FR" },
  { code: "zh", label: "中文", short: "ZH" },
  { code: "ja", label: "日本語", short: "JA" },
  { code: "pt", label: "Português", short: "PT" },
] as const;

export type Lang = (typeof LANGUAGES)[number]["code"];
type Target = Exclude<Lang, "es">;
type Translations = Readonly<Record<Target, string>>;

export const DEFAULT_LANG: Lang = "es";
export const LANG_STORAGE_KEY = "borondo.lang";

/** Etiqueta BCP 47 para el atributo `lang` de <html>. */
export const HTML_LANG: Readonly<Record<Lang, string>> = {
  es: "es-CO",
  en: "en",
  fr: "fr",
  zh: "zh-Hans",
  ja: "ja",
  pt: "pt-BR",
};

export function parseLang(value: unknown): Lang {
  return typeof value === "string" && LANGUAGES.some((l) => l.code === value) ? (value as Lang) : DEFAULT_LANG;
}

const tr = (en: string, fr: string, zh: string, ja: string, pt: string): Translations => ({ en, fr, zh, ja, pt });

/** Frase en español (normalizada: un espacio, sin bordes) → traducciones. */
export const DICTIONARY: Readonly<Record<string, Translations>> = {
  // Navegación y controles
  "Explorar": tr("Explore", "Explorer", "探索", "探す", "Explorar"),
  "Blog": tr("Blog", "Blog", "博客", "ブログ", "Blog"),
  "Nosotros": tr("About us", "À propos", "关于我们", "私たちについて", "Sobre nós"),
  "Iniciar sesión": tr("Log in", "Se connecter", "登录", "ログイン", "Entrar"),
  "Cambiar idioma": tr("Change language", "Changer de langue", "切换语言", "言語を変更", "Mudar idioma"),
  "Cambiar tema": tr("Change theme", "Changer de thème", "切换主题", "テーマを変更", "Mudar tema"),
  "Colorido": tr("Colorful", "Coloré", "多彩", "カラフル", "Colorido"),
  "Claro": tr("Light", "Clair", "浅色", "ライト", "Claro"),
  "Oscuro": tr("Dark", "Sombre", "深色", "ダーク", "Escuro"),
  "Sistema": tr("System", "Système", "跟随系统", "システム", "Sistema"),
  "Ir al inicio": tr("Go to home page", "Aller à l'accueil", "返回首页", "ホームへ", "Ir para o início"),
  "Ir al contenido principal": tr("Skip to main content", "Aller au contenu principal", "跳到主要内容", "メインコンテンツへ移動", "Ir para o conteúdo principal"),
  "Pasadía": tr("Day trip", "Excursion d'une journée", "一日游", "日帰りツアー", "Passeio de um dia"),
  "Pasanoche": tr("Overnight trip", "Séjour d'une nuit", "过夜游", "1泊ツアー", "Pernoite"),
  "Excursión": tr("Multi-day tour", "Circuit de plusieurs jours", "多日游", "周遊ツアー", "Excursão"),
  "Personalizados": tr("Custom trips", "Sur mesure", "定制旅行", "オーダーメイド", "Personalizados"),
  "Vas y vuelves el mismo día": tr("Back the same day", "Aller-retour dans la journée", "当天往返", "その日のうちに帰着", "Ida e volta no mesmo dia"),
  "Una noche fuera de casa": tr("One night away", "Une nuit sur place", "在外住一晚", "1泊して楽しむ", "Uma noite fora de casa"),
  "Varios días con alojamiento": tr("Several days with lodging", "Plusieurs jours avec hébergement", "含住宿的多日行程", "宿泊付きの数日間", "Vários dias com hospedagem"),
  "Cuéntale al asistente lo que buscas": tr("Tell the assistant what you're looking for", "Dites à l'assistant ce que vous cherchez", "告诉助手你想要什么", "アシスタントに希望を伝える", "Conte ao assistente o que você procura"),
  "Tipos de tour": tr("Tour types", "Types de circuit", "行程类型", "ツアーの種類", "Tipos de passeio"),

  // Hero
  "Promociones": tr("Deals", "Promotions", "优惠", "プロモーション", "Promoções"),
  "Más vendidos": tr("Best sellers", "Meilleures ventes", "热销", "人気ランキング", "Mais vendidos"),
  "Ver todos": tr("See all", "Voir tout", "查看全部", "すべて見る", "Ver todos"),
  "EXPLORA DONDE NACE LA NATURALEZA": tr("EXPLORE WHERE NATURE IS BORN", "EXPLOREZ LÀ OÙ NAÎT LA NATURE", "探索自然诞生之地", "自然が生まれる場所へ", "EXPLORE ONDE NASCE A NATUREZA"),
  "Viajes que transforman tu manera de ver el mundo.": tr("Trips that change the way you see the world.", "Des voyages qui changent votre regard sur le monde.", "改变你看世界方式的旅程。", "世界の見方が変わる旅。", "Viagens que transformam sua maneira de ver o mundo."),
  "Explora paisajes únicos, vive experiencias auténticas y conecta con la naturaleza.": tr("Explore unique landscapes, enjoy authentic experiences and connect with nature.", "Explorez des paysages uniques, vivez des expériences authentiques et reconnectez-vous à la nature.", "探索独特的风景，体验真实的旅程，与自然相连。", "唯一無二の景色を巡り、本物の体験をして、自然とつながろう。", "Explore paisagens únicas, viva experiências autênticas e conecte-se com a natureza."),
  "Destino": tr("Destination", "Destination", "目的地", "目的地", "Destino"),
  "¿A dónde quieres ir?": tr("Where do you want to go?", "Où voulez-vous aller ?", "你想去哪里？", "どこへ行きたいですか？", "Para onde você quer ir?"),
  "Fechas": tr("Dates", "Dates", "日期", "日程", "Datas"),
  "Fecha de viaje": tr("Travel date", "Date du voyage", "出行日期", "旅行日", "Data da viagem"),
  "Viajeros": tr("Travelers", "Voyageurs", "旅客", "旅行者", "Viajantes"),
  "2 viajeros": tr("2 travelers", "2 voyageurs", "2 位旅客", "旅行者 2 名", "2 viajantes"),
  "Buscar aventura": tr("Find an adventure", "Trouver une aventure", "寻找冒险", "冒険を探す", "Buscar aventura"),
  "Pronto podrás pedirlo en tus palabras: \"un plan de naturaleza para 4 en diciembre\"": tr(
    "Soon you'll be able to ask in your own words: \"a nature trip for 4 in December\"",
    "Bientôt, vous pourrez le demander avec vos mots : « une escapade nature pour 4 en décembre »",
    "很快你就可以用自己的话来提问：“十二月 4 人的自然之旅”",
    "まもなく自分の言葉で頼めるようになります：「12月に4人で自然を楽しむプラン」",
    "Em breve você poderá pedir com suas palavras: \"um passeio na natureza para 4 em dezembro\"",
  ),
  "Mar de los siete colores": tr("Sea of seven colors", "La mer aux sept couleurs", "七色之海", "七色の海", "Mar de sete cores"),
  "Ciudad amurallada": tr("Walled city", "Ville fortifiée", "城墙古城", "城壁の街", "Cidade amuralhada"),
  "Eje Cafetero": tr("Coffee Region", "Région du café", "咖啡产区", "コーヒー地帯", "Eixo Cafeeiro"),
  "Centro histórico": tr("Historic center", "Centre historique", "历史中心", "歴史地区", "Centro histórico"),
  "Ruta del café": tr("Coffee route", "Route du café", "咖啡之路", "コーヒールート", "Rota do café"),
  "Diapositiva": tr("Slide", "Diapositive", "幻灯片", "スライド", "Slide"),

  // Experiencias
  "EXPLORA COLOMBIA": tr("EXPLORE COLOMBIA", "EXPLOREZ LA COLOMBIE", "探索哥伦比亚", "コロンビアを探検", "EXPLORE A COLÔMBIA"),
  "¿Qué quieres vivir?": tr("What do you want to experience?", "Que voulez-vous vivre ?", "你想体验什么？", "どんな体験をしたいですか？", "O que você quer viver?"),
  "Elige una experiencia y te mostramos los tours que la hacen realidad.": tr("Pick an experience and we'll show you the tours that make it happen.", "Choisissez une expérience et nous vous montrons les circuits qui la rendent possible.", "选择一种体验，我们为你展示实现它的行程。", "体験を選ぶと、それを叶えるツアーをご紹介します。", "Escolha uma experiência e mostramos os passeios que a tornam realidade."),
  "Ver todo el catálogo": tr("See the full catalog", "Voir tout le catalogue", "查看完整目录", "カタログをすべて見る", "Ver todo o catálogo"),
  "Sol y Playa": tr("Sun & Beach", "Soleil et plage", "阳光与海滩", "太陽とビーチ", "Sol e Praia"),
  "Naturaleza": tr("Nature", "Nature", "自然", "自然", "Natureza"),
  "Aventura": tr("Adventure", "Aventure", "冒险", "アドベンチャー", "Aventura"),
  "Cultura e Historia": tr("Culture & History", "Culture et histoire", "文化与历史", "文化と歴史", "Cultura e História"),
  "Ciudad y Noche": tr("City & Nightlife", "Ville et vie nocturne", "城市与夜生活", "街とナイトライフ", "Cidade e Noite"),
  "Recreación": tr("Recreation", "Loisirs", "休闲娱乐", "レクリエーション", "Recreação"),
  "Relax y Bienestar": tr("Relax & Wellness", "Détente et bien-être", "放松与健康", "リラックスとウェルネス", "Relax e Bem-estar"),
  "Gastronomía y Café": tr("Food & Coffee", "Gastronomie et café", "美食与咖啡", "グルメとコーヒー", "Gastronomia e Café"),
  "Gastronomía": tr("Food", "Gastronomie", "美食", "グルメ", "Gastronomia"),

  // Más allá de Colombia
  "MÁS ALLÁ DE COLOMBIA": tr("BEYOND COLOMBIA", "AU-DELÀ DE LA COLOMBIE", "哥伦比亚之外", "コロンビアの外へ", "ALÉM DA COLÔMBIA"),
  "Diseñamos el viaje que tienes en mente": tr("We design the trip you have in mind", "Nous concevons le voyage que vous imaginez", "我们为你打造心中的旅程", "思い描く旅をかたちにします", "Criamos a viagem que você tem em mente"),
  "Cuéntanos qué sueñas y un asesor arma tu plan: vuelos, hoteles y experiencias.": tr("Tell us your dream and an advisor builds your plan: flights, hotels and experiences.", "Dites-nous de quoi vous rêvez et un conseiller compose votre voyage : vols, hôtels et expériences.", "告诉我们你的梦想，顾问为你规划：机票、酒店和体验。", "夢を聞かせてください。アドバイザーが航空券・ホテル・体験までプランを組みます。", "Conte o que você sonha e um consultor monta seu plano: voos, hotéis e experiências."),
  "Viajes internacionales": tr("International trips", "Voyages internationaux", "国际旅行", "海外旅行", "Viagens internacionais"),
  "Europa, Suramérica y más": tr("Europe, South America and more", "Europe, Amérique du Sud et plus", "欧洲、南美洲等", "ヨーロッパ、南米など", "Europa, América do Sul e mais"),
  "Cotiza con un asesor": tr("Get a quote from an advisor", "Demandez un devis à un conseiller", "向顾问询价", "アドバイザーに見積もり依頼", "Peça um orçamento a um consultor"),
  "Parques de Orlando": tr("Orlando theme parks", "Parcs d'Orlando", "奥兰多主题乐园", "オーランドのテーマパーク", "Parques de Orlando"),
  "Planes en familia con todo resuelto": tr("Family plans with everything sorted", "Séjours en famille clés en main", "一站式家庭出游方案", "家族旅行をまるごとお任せ", "Planos em família com tudo resolvido"),
  "Cruceros": tr("Cruises", "Croisières", "邮轮", "クルーズ", "Cruzeiros"),
  "Caribe y Mediterráneo": tr("Caribbean and Mediterranean", "Caraïbes et Méditerranée", "加勒比海与地中海", "カリブ海と地中海", "Caribe e Mediterrâneo"),
  "Viajes personalizados": tr("Custom trips", "Voyages sur mesure", "定制旅行", "オーダーメイド旅行", "Viagens personalizadas"),
  "Tu fecha, tu ritmo, tu presupuesto": tr("Your dates, your pace, your budget", "Vos dates, votre rythme, votre budget", "你的日期、你的节奏、你的预算", "あなたの日程、ペース、予算で", "Sua data, seu ritmo, seu orçamento"),

  // Pagos y confianza
  "Paga como prefieras, con total seguridad": tr("Pay your way, fully secure", "Payez comme vous voulez, en toute sécurité", "随心支付，安全无忧", "お好きな方法で、安心してお支払い", "Pague como preferir, com total segurança"),
  "Pagos procesados por pasarelas autorizadas en Colombia.": tr("Payments processed by authorized gateways in Colombia.", "Paiements traités par des passerelles agréées en Colombie.", "由哥伦比亚授权支付网关处理。", "コロンビアの認可決済ゲートウェイで処理されます。", "Pagamentos processados por gateways autorizados na Colômbia."),
  "Turismo responsable": tr("Responsible tourism", "Tourisme responsable", "负责任旅游", "責任ある観光", "Turismo responsável"),
  "Cuidamos los lugares que visitas.": tr("We care for the places you visit.", "Nous prenons soin des lieux que vous visitez.", "我们守护你造访的每一处。", "訪れる場所を大切に守ります。", "Cuidamos dos lugares que você visita."),
  "Experiencias únicas": tr("Unique experiences", "Expériences uniques", "独特体验", "特別な体験", "Experiências únicas"),
  "Diseñamos viajes auténticos y memorables.": tr("We design authentic, memorable trips.", "Nous concevons des voyages authentiques et mémorables.", "我们打造真实难忘的旅程。", "本物で心に残る旅をつくります。", "Criamos viagens autênticas e memoráveis."),
  "Seguridad y confianza": tr("Safety and trust", "Sécurité et confiance", "安全与信赖", "安全と信頼", "Segurança e confiança"),
  "Tu tranquilidad es nuestra prioridad.": tr("Your peace of mind is our priority.", "Votre tranquillité est notre priorité.", "你的安心是我们的首要任务。", "あなたの安心が最優先です。", "Sua tranquilidade é nossa prioridade."),
  "Atención personalizada": tr("Personal support", "Accompagnement personnalisé", "贴心服务", "きめ細かなサポート", "Atendimento personalizado"),
  "Estamos contigo en cada paso del viaje.": tr("We're with you every step of the way.", "Nous sommes à vos côtés à chaque étape.", "旅途的每一步我们都陪着你。", "旅のすべての段階で寄り添います。", "Estamos com você em cada etapa da viagem."),

  // Colofón
  "Términos": tr("Terms", "Conditions", "条款", "利用規約", "Termos"),
  "Privacidad": tr("Privacy", "Confidentialité", "隐私", "プライバシー", "Privacidade"),
  "Cancelación": tr("Cancellation", "Annulation", "取消政策", "キャンセル", "Cancelamento"),
  "Retracto": tr("Right of withdrawal", "Droit de rétractation", "撤销权", "撤回権", "Direito de arrependimento"),
  "Cookies": tr("Cookies", "Cookies", "Cookie", "クッキー", "Cookies"),

  // Vitrinas (Promociones / Más vendidos)
  "Precios especiales por tiempo limitado": tr("Special prices for a limited time", "Prix spéciaux pour une durée limitée", "限时特价", "期間限定の特別価格", "Preços especiais por tempo limitado"),
  "Los tours que más eligen nuestros viajeros": tr("The tours our travelers choose most", "Les circuits préférés de nos voyageurs", "旅客最常选择的行程", "旅行者に一番選ばれているツアー", "Os passeios que nossos viajantes mais escolhem"),
  "Cerrar": tr("Close", "Fermer", "关闭", "閉じる", "Fechar"),
  "Anterior": tr("Previous", "Précédent", "上一个", "前へ", "Anterior"),
  "Siguiente": tr("Next", "Suivant", "下一个", "次へ", "Próximo"),
  "Ver tour": tr("See tour", "Voir le circuit", "查看行程", "ツアーを見る", "Ver passeio"),
  "Desde": tr("From", "À partir de", "起价", "最安", "A partir de"),
  "por persona": tr("per person", "par personne", "每人", "1人あたり", "por pessoa"),
  "Disponible": tr("Available", "Disponible", "可预订", "予約可能", "Disponível"),
  "Quedan pocos": tr("Few spots left", "Dernières places", "名额不多", "残りわずか", "Restam poucas vagas"),
  "Ver catálogo completo": tr("See full catalog", "Voir tout le catalogue", "查看完整目录", "カタログをすべて見る", "Ver catálogo completo"),

  // Asistente
  "¿Te ayudamos?": tr("Need help?", "Besoin d'aide ?", "需要帮助吗？", "お手伝いしましょうか？", "Precisa de ajuda?"),
  "Asistente BorondoTours": tr("BorondoTours assistant", "Assistant BorondoTours", "BorondoTours 助手", "BorondoTours アシスタント", "Assistente BorondoTours"),
  "Cuéntanos tu plan y un asesor te responde por WhatsApp.": tr("Tell us your plan and an advisor will reply on WhatsApp.", "Parlez-nous de votre projet et un conseiller vous répond sur WhatsApp.", "告诉我们你的计划，顾问会通过 WhatsApp 回复你。", "プランを教えてください。アドバイザーが WhatsApp で返信します。", "Conte seu plano e um consultor responde pelo WhatsApp."),
  "Tipo de plan": tr("Type of trip", "Type de voyage", "行程类型", "プランの種類", "Tipo de plano"),
  "Internacional": tr("International", "International", "国际", "海外", "Internacional"),
  "Crucero": tr("Cruise", "Croisière", "邮轮", "クルーズ", "Cruzeiro"),
  "Personalizado": tr("Custom", "Sur mesure", "定制", "オーダーメイド", "Personalizado"),
  "Ej.: Eje Cafetero": tr("E.g. Coffee Region", "Ex. : région du café", "例如：咖啡产区", "例：コーヒー地帯", "Ex.: Eixo Cafeeiro"),
  "Fecha aproximada": tr("Approximate date", "Date approximative", "大致日期", "おおよその日程", "Data aproximada"),
  "Adultos": tr("Adults", "Adultes", "成人", "大人", "Adultos"),
  "Niños": tr("Children", "Enfants", "儿童", "子ども", "Crianças"),
  "Detalles (opcional)": tr("Details (optional)", "Détails (facultatif)", "详情（选填）", "詳細（任意）", "Detalhes (opcional)"),
  "Enviar por WhatsApp": tr("Send via WhatsApp", "Envoyer sur WhatsApp", "通过 WhatsApp 发送", "WhatsApp で送信", "Enviar pelo WhatsApp"),
  "Se abrirá WhatsApp con tu mensaje listo para enviar.": tr("WhatsApp will open with your message ready to send.", "WhatsApp s'ouvrira avec votre message prêt à envoyer.", "将打开 WhatsApp，消息已准备好发送。", "メッセージ入りで WhatsApp が開きます。", "O WhatsApp abrirá com sua mensagem pronta para enviar."),
  "Abrir asistente": tr("Open assistant", "Ouvrir l'assistant", "打开助手", "アシスタントを開く", "Abrir assistente"),
};

type Rule = readonly [RegExp, Readonly<Record<Target, string>>];

/** Fragmentos con cifras. Se aplican en orden sobre frases que no están en el diccionario. */
const PATTERNS: readonly Rule[] = [
  [/^(\d+) tours$/, { en: "$1 tours", fr: "$1 circuits", zh: "$1 条行程", ja: "$1 件のツアー", pt: "$1 passeios" }],
  [/\bMedio día\b/g, { en: "Half day", fr: "Demi-journée", zh: "半日", ja: "半日", pt: "Meio dia" }],
  [/\bPasadía\b/g, { en: "Day trip", fr: "Journée", zh: "一日游", ja: "日帰り", pt: "Passeio de um dia" }],
  [/\b(\d+) días\b/g, { en: "$1 days", fr: "$1 jours", zh: "$1 天", ja: "$1日間", pt: "$1 dias" }],
  [/\b1 día\b/g, { en: "1 day", fr: "1 jour", zh: "1 天", ja: "1日", pt: "1 dia" }],
  [/desde (\$[\d.]+)/g, { en: "from $1", fr: "à partir de $1", zh: "$1 起", ja: "$1〜", pt: "a partir de $1" }],
];

const normalize = (text: string): string => text.replace(/\s+/g, " ").trim();

/** Traduce una frase. Devuelve null si no hay traducción (se deja el español). */
export function translatePhrase(source: string, lang: Lang): string | null {
  if (lang === "es") return null;
  const key = normalize(source);
  if (!key) return null;
  const exact = DICTIONARY[key] ?? CONTENT_DICTIONARY[key];
  if (exact) return exact[lang];
  // Frases completas con partes variables: `$tN` traduce el grupo (listas "A y B" incluidas).
  for (const [pattern, map] of CONTENT_PATTERNS) {
    const match = pattern.exec(key);
    if (!match) continue;
    return map[lang].replace(/\$(t?)(\d)/g, (_, translate: string, index: string) => {
      const group = match[Number(index)] ?? "";
      if (!translate) return group;
      const and = { en: " and ", fr: " et ", zh: "和", ja: "と", pt: " e " }[lang];
      return group
        .split(" y ")
        .map((part) => translatePhrase(part, lang) ?? part)
        .join(and);
    });
  }
  let out = key;
  let hit = false;
  for (const [pattern, map] of PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(out)) {
      pattern.lastIndex = 0;
      out = out.replace(pattern, map[lang]);
      hit = true;
    }
  }
  return hit ? out : null;
}

/** Traduce o devuelve el español original. Para textos que arma el runtime. */
export function t(source: string, lang: Lang): string {
  return translatePhrase(source, lang) ?? source;
}
