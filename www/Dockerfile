FROM node:18.12.1-slim

WORKDIR /app

# Required for prisma
RUN apt-get update
RUN apt-get install openssl -y

# Prepare turborepo
RUN npm install -g pnpm
COPY package.json /app
COPY pnpm-*.yaml /app
COPY .npmrc /app
COPY turbo.json /app

# Prepare workspaces
RUN mkdir admin frontend
COPY admin/package.json /app/admin
COPY frontend/package.json /app/frontend

RUN pnpm install --frozen-lockfile

COPY ./ /app
ENV SKIP_ENV_VALIDATION=true
RUN pnpm build

CMD [ "pnpm", "start" ]
