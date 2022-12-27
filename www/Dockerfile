FROM node:18.12.1-slim

WORKDIR /app

RUN apt-get update
RUN apt-get install openssl -y

COPY package.json /app
COPY pnpm-* /app
COPY turbo.json /app

RUN mkdir admin frontend
COPY admin/package.json /app/admin
COPY frontend/package.json /app/frontend

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY ./ /app
ENV SKIP_ENV_VALIDATION=true
RUN pnpm build

CMD [ "pnpm", "start" ]
