FROM node:20.1.0-slim as builder
WORKDIR /app

# Setup system
RUN apt-get update
RUN apt-get install openssl -y
RUN apt-get install unzip -y
RUN apt-get install curl -y
RUN npm install -g pnpm

# Install dependencies
COPY ./ /app
RUN pnpm install --frozen-lockfile
RUN scripts/deno_install.sh
RUN cd api && pnpm prisma generate
RUN pnpm build

FROM node:20.1.0-slim as runner
WORKDIR /app

# Setup system
RUN apt-get update
RUN apt-get install openssl -y
RUN npm install -g pnpm

# Install dependencies
COPY ./ /app
COPY --from=builder /app/admin/.next /app/admin/.next
COPY --from=builder /app/frontend/dist /app/frontend/dist
COPY --from=builder /app/frontend/bin/deno /app/frontend/bin/deno

RUN pnpm install --frozen-lockfile --prod
RUN cd api && pnpx prisma generate

CMD [ "pnpm", "start" ]
