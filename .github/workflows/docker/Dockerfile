FROM node:18.13.0-slim
WORKDIR /app

# Setup system
RUN apt-get update
RUN apt-get install openssl -y
RUN npm install -g pnpm
ENV CI=true

# Install dependencies
COPY ./ /app
RUN pnpm install --frozen-lockfile
RUN cd admin && pnpm playwright install-deps
RUN cd api && pnpm prisma generate && pnpm prisma db push
RUN pnpm build

CMD [ "tail", "-F", "/dev/null" ]
