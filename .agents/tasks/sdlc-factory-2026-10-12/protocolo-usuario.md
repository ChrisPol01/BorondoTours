# SDLC Agentic Master Protocol (Especificación para Kiro IDE) — texto original del usuario

Mecanismo Base: El "Context Bus" (Memoria Global)
Ningún agente opera en el vacío. Todos están conectados a un Context Bus (una base de datos vectorial en Kiro). Cada vez que un agente completa una tarea, deposita un Artefacto tipado. Los demás agentes están "suscritos" a los artefactos que les importan.

## FASE 1: Descubrimiento y Normativa (Definición Estricta)

1. Product Manager (PM)
   - Función: Traducir necesidades del negocio en historias de usuario técnicas.
   - Input: Requerimiento del humano.
   - Output: PRD.json (Product Requirements Document estructurado).
   - Estándares: INVEST framework para user stories.
   - KPI: 0% de historias rechazadas por el Arquitecto por ambigüedad.

2. Business Analyst (Analista de Casos Borde)
   - Función: Destruir el "camino feliz" del PM buscando fallos lógicos y estados de error.
   - Input: PRD.json.
   - Output: EdgeCases.yml (Matriz de estados y transiciones).

3. Compliance & Privacy Officer [NUEVO]
   - Función: Auditar el PRD contra leyes de privacidad. Si el PM pide "guardar la IP del usuario", este agente exige que se agregue un mecanismo de anonimización o consentimiento.
   - Input: PRD.json, EdgeCases.yml.
   - Output: Compliance_Requirements.json.
   - Estándares: GDPR, CCPA, SOC 2 Tipo II, ISO 27701.

## FASE 2: Diseño de Contratos (El "Puente de Cristal")
En esta fase se crean los contratos. La programación (Fase 3) está bloqueada hasta que todos los agentes de esta fase firmen con éxito.

4. Solutions Architect
   - Función: Diseñar la topología del sistema.
   - Output: Modelo C4 (como código, formato Mermaid o Structurizr), ArchitectureDecisionRecords (ADR).md.
   - Estándares: AWS/Azure Well-Architected Framework.

5. FinOps & Cloud Cost Optimizer [NUEVO]
   - Función: Calcular el costo proyectado de la arquitectura. Si el Arquitecto sugiere DynamoDB pero es muy caro para el caso de uso, propone PostgreSQL.
   - Output: Cost_Estimate.json.

6. API Contract Manager
   - Función: Diseñar la comunicación FE/BE.
   - Output: openapi.yaml (Swagger estricto).
   - Estándares: REST Maturity Level 2+, OpenAPI 3.1.

7. DBA / Data Modeler
   - Función: Diseñar persistencia y normalización.
   - Output: schema.dbml, scripts de migración (Prisma/Flyway).
   - Estándares: 3NF (Tercera Forma Normal), Indexación óptima.

8. Security Architect
   - Función: Identificar vectores de ataque en el diseño.
   - Output: ThreatModel.json (usando metodología STRIDE).
   - Estándares: OWASP Top 10, NIST Cybersecurity Framework.

9. UI/UX & Accessibility (a11y) Designer
   - Función: Traducir UX a código base y asegurar accesibilidad.
   - Output: DesignTokens.json (colores, espaciados), a11y_rules.json.
   - Estándares: WCAG 2.2 Nivel AA.

## FASE 3: Desarrollo Paralelo e Interconectado
Los desarrolladores no inventan arquitectura; implementan interfaces (TDD - Test Driven Development).

10. Backend Developer
    - Inputs Activos: openapi.yaml (Interfaz a exponer), schema.dbml (Datos a consumir), ThreatModel.json (Validaciones a implementar).
    - Output: Código fuente BE, Pruebas Unitarias (Cobertura >80%).
    - Estándares: SOLID, Clean Architecture, Dependency Injection.

11. Frontend Developer
    - Inputs Activos: openapi.yaml (Mocks para programar sin esperar al BE), DesignTokens.json.
    - Output: Código fuente FE, Componentes aislados (Storybook).
    - Estándares: Component-Driven UI, Mobile-First, DRY.

12. Technical Writer (Documentador) [NUEVO]
    - Función: Lee el código a medida que se escribe y genera la documentación técnica y de usuario.
    - Output: Archivos en carpeta docs/ (Markdown/Docusaurus).
    - Estándares: Docs-as-Code, Diátaxis Framework.

## FASE 4: Puertas de Calidad (Quality Gates Automatizados)
Ningún código se fusiona a la rama principal (main) sin pasar por estos agentes. Si un agente falla, devuelve un reporte estructurado al desarrollador con la línea exacta del error.

13. Peer Reviewer (Analista Estático)
    - Función: Revisa convenciones de código, complejidad ciclomática y "code smells".
    - Output: Aprobación de PR o comentarios en línea.
    - Herramientas: Integración con SonarQube, ESLint/Ruff MCP.

14. Security Auditor (SAST / DAST)
    - Función: Ataca el código buscando credenciales harcodeadas, inyecciones o dependencias vulnerables.
    - Estándares: CVE Databases, Trivy, Snyk.

15. QA Automation Engineer
    - Función: Escribe y ejecuta pruebas End-to-End (E2E) basadas en los Casos Borde de la Fase 1.
    - Output: Reporte de Cypress/Playwright.

## FASE 5: Entrega Continua (Ops)

16. DevOps / SRE (Site Reliability Engineer)
    - Función: Configura los pipelines CI/CD y provisiona la infraestructura como código.
    - Output: Scripts de Terraform/Pulumi, manifiestos de Kubernetes, Dockerfiles.
    - KPI: 0 configuraciones manuales ("ClickOps" prohibido).

17. Release Manager
    - Función: Orquesta el despliegue a producción utilizando estrategias de bajo riesgo.
    - Output: Configuración de Feature Flags, reportes de telemetría inicial (Datadog/NewRelic).
    - Estándares: Canary Releases, Blue/Green Deployment.

## Bucle de Resolución de Conflictos (Proactividad)
Para mantener alta comunicación, se implementa el Protocolo de Renegociación:
Si el Backend Developer (Agente 10) no puede cumplir el contrato API (Agente 6) por limitaciones de base de datos (Agente 7), dispara un evento CONTRACT_DISPUTE. Kiro IDE pausa la codificación y convoca a los Agentes 6, 7 y 10 en un sub-hilo (chat paralelo). Una vez resuelto, el Agente 6 actualiza el openapi.yaml, lo que dispara un evento CONTRACT_UPDATED que notifica proactivamente al Frontend Developer para que ajuste su código.

## Objetivo adicional del usuario (parafraseado del chat)
- Investigar qué repositorios de GitHub sirven para tomar agentes ya creados; si no hay, crearlos en `.kiro/agents`.
- Evaluar `C:\Users\Administrador\affaann\ECC-main\ECC-main\.kiro` (repo tomado para validar si sirve).
- Fábrica de desarrollo eficiente y escalable que cumpla normativas y estándares de cada tema/agente, cubriendo cada capa: aplicación, infraestructura, diseño, base de datos y las demás que se identifiquen.
- Comunicación entre agentes por carpeta (no depender del contexto de cada chat de Kiro): cada agente deposita resultados y continúa en el tiempo; si un agente ya no está, otro lo puede reemplazar.
- Dar a los agentes MCPs, loops, hooks y contexto del proyecto (steerings).
