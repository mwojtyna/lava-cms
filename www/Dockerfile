FROM node:18.14.2-slim as builder
WORKDIR /app

# Setup system
RUN apt-get update
RUN apt-get install openssl -y
RUN npm install -g pnpm

# Install dependencies
COPY ./ /app
RUN pnpm install --frozen-lockfile
RUN cd api && pnpm prisma generate
RUN pnpm build

FROM node:18.14.2-slim as runner
WORKDIR /app

# Setup system
RUN apt-get update
RUN apt-get install openssl -y
RUN npm install -g pnpm

# Install dependencies
COPY ./ /app
COPY --from=builder /app/admin/.next /app/admin/.next
COPY --from=builder /app/frontend/dist /app/frontend/dist

RUN pnpm install --frozen-lockfile --prod
RUN cd api && pnpx prisma generate

CMD [ "pnpm", "start" ]
