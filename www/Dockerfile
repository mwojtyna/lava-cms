FROM node:18.13.0-slim

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
CMD [ "pnpm", "start" ]
