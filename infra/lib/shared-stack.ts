// Infra compartida: VPC, RDS + RDS Proxy, DynamoDB, Secrets Manager
// Todos los servicios se conectan a estos recursos

// TODO: implementar con CDK
// - VPC (subnets privadas + VPC Endpoints para S3, DynamoDB, Secrets, SQS)
// - RDS PostgreSQL t4g.micro (Single-AZ) + PostGIS + pg_trgm
// - RDS Proxy (connection pooling para Lambda)
// - DynamoDB tables: BorondoChat, BorondoConnections, Counters
// - Secrets Manager: DB_URL, ONEPAY_SECRET, JWT_SECRET, SES credentials
// - Route 53 + ACM

export {};
