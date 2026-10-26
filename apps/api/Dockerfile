# syntax=docker/dockerfile:1
# Image for apps/api. Build from the repo root:
#   docker build -f apps/api/Dockerfile .
# Runs the API by default; the App Platform pre-deploy job runs
# `node dist/database/migrate.js` with the same image. See docs/deployment.md.

ARG NODE_IMAGE=node:24-alpine

FROM ${NODE_IMAGE} AS base
# pnpm version comes from "packageManager" in the root package.json.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /repo

# 1. Keep only the api and the workspace packages it depends on.
FROM base AS pruner
RUN npm install --global turbo@2.11.10
COPY . .
RUN turbo prune @ielts-mock/api --docker

# 2. Install dependencies (cached while package.json files and the lockfile
#    don't change), then build the api and its packages.
FROM base AS builder
COPY --from=pruner /repo/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /repo/out/full/ .
RUN pnpm exec turbo run build --filter=@ielts-mock/api \
  && pnpm --filter @ielts-mock/api deploy --prod /app

# 3. Runtime: compiled code + production dependencies only, non-root user.
FROM ${NODE_IMAGE} AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder --chown=node:node /app ./
USER node
EXPOSE 4000
CMD ["node", "dist/main"]
