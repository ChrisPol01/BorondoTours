// API Gateway: punto único de entrada, enruta a cada servicio Lambda por path
// Rutas:
//   /api/v1/auth/*       → Lambda 1-core
//   /api/v1/users/*      → Lambda 1-core
//   /api/v1/tours/*      → Lambda 2-tours
//   /api/v1/bookings/*   → Lambda 3-bookings
//   /api/v1/payments/*   → Lambda 4-payments
//   /api/v1/webhooks/*   → Lambda 4-payments
//   /api/v1/operators/*  → Lambda 5-operators
//   /api/v1/ads/*        → Lambda 9-ads
//   WebSocket API        → Lambda 7-chat

// TODO: implementar con CDK HttpApi + routes + Lambda integrations

export {};
