FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lockb ./
COPY packages/ packages/
COPY services/2-tours/ services/2-tours/
RUN cd services/2-tours && bun install --frozen-lockfile && bun run build

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=public.ecr.aws/awsguru/aws-lambda-web-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter
COPY --from=builder /app/services/2-tours/dist ./
ENV PORT=8080
CMD ["bun", "run", "index.js"]
