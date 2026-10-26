# syntax=docker/dockerfile:1
# Image for apps/web. Build from the repo root:
#   docker build -f apps/web/Dockerfile .
# Runtime env (APP_ENV, API_URL, …) comes from App Platform; see docs/deployment.md.

ARG NODE_IMAGE=node:24-alpine

FROM ${NODE_IMAGE} AS base
# pnpm version comes from "packageManager" in the root package.json.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /repo

# 1. Keep only apps/web and the workspace packages it depends on.
FROM base AS pruner
RUN npm install --global turbo@2.11.10
COPY . .
RUN turbo prune @ielts-mock/web --docker

# 2. Install dependencies (cached while package.json files and the lockfile
#    don't change), then build. next.config.ts sets output: "standalone".
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=pruner /repo/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /repo/out/full/ .
RUN pnpm exec turbo run build --filter=@ielts-mock/web

# 3. Runtime: the standalone server plus static assets, non-root user.
FROM ${NODE_IMAGE} AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
WORKDIR /app
COPY --from=builder --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
