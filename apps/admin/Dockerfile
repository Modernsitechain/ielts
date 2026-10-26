# syntax=docker/dockerfile:1
# Image for apps/admin. Build from the repo root:
#   docker build -f apps/admin/Dockerfile .
# Runtime env (APP_ENV, API_URL, …) comes from App Platform; see docs/deployment.md.

ARG NODE_IMAGE=node:24-alpine

FROM ${NODE_IMAGE} AS base
# pnpm version comes from "packageManager" in the root package.json.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /repo

# 1. Keep only apps/admin and the workspace packages it depends on.
FROM base AS pruner
RUN npm install --global turbo@2.11.10
COPY . .
RUN turbo prune @ielts-mock/admin --docker

# 2. Install dependencies (cached while package.json files and the lockfile
#    don't change), then build. next.config.ts sets output: "standalone".
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_ values are inlined into the build, so they must exist now
# (App Platform passes BUILD_TIME env vars as build args).
ARG NEXT_PUBLIC_WORKOS_REDIRECT_URI
ENV NEXT_PUBLIC_WORKOS_REDIRECT_URI=${NEXT_PUBLIC_WORKOS_REDIRECT_URI}
COPY --from=pruner /repo/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /repo/out/full/ .
RUN pnpm exec turbo run build --filter=@ielts-mock/admin

# 3. Runtime: the standalone server plus static assets, non-root user.
FROM ${NODE_IMAGE} AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3001
WORKDIR /app
COPY --from=builder --chown=node:node /repo/apps/admin/.next/standalone ./
COPY --from=builder --chown=node:node /repo/apps/admin/.next/static ./apps/admin/.next/static
USER node
EXPOSE 3001
CMD ["node", "apps/admin/server.js"]
