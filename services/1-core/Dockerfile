FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lockb ./
COPY packages/ packages/
COPY services/1-core/ services/1-core/
RUN cd services/1-core && bun install --frozen-lockfile && bun run build

FROM oven/bun:1-slim
WORKDIR /app
# Lambda Web Adapter (LWA) — proxea HTTP a Bun en puerto 8080
COPY --from=public.ecr.aws/awsguru/aws-lambda-web-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter
COPY --from=builder /app/services/1-core/dist ./
ENV PORT=8080
CMD ["bun", "run", "index.js"]
