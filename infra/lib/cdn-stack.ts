// CDN: S3 + CloudFront para las 3 apps frontend (web, erp, b2b)
// Cada app se despliega a un path prefix o subdomain:
//   borondotours.com       → apps/web (B2C público)
//   erp.borondotours.com   → apps/erp
//   b2b.borondotours.com   → apps/b2b

// TODO: implementar con CDK CloudFrontDistribution + S3 Origins + OAC

export {};
