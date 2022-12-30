FROM node:18.12.1-slim

WORKDIR /app

# Setup system
RUN apt-get update
RUN apt-get install openssl -y

# Prepare turborepo
RUN npm install -g pnpm
COPY package.json /app
COPY pnpm-*.yaml /app
COPY .npmrc /app
COPY turbo.json /app

# Prepare workspaces
RUN mkdir admin frontend api
COPY admin/package.json /app/admin
COPY frontend/package.json /app/frontend
COPY api/package.json /app/api

RUN pnpm install --frozen-lockfile

COPY ./ /app
ENV SKIP_ENV_VALIDATION=true
RUN pnpm build

CMD [ "pnpm", "start" ]
