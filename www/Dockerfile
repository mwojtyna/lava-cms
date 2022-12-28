FROM node:18.12.1-slim

WORKDIR /app

RUN apt-get update
RUN apt-get install openssl -y

COPY yarn.lock /app
COPY .yarnrc.yml /app
COPY .yarn /app/.yarn
RUN yarn set version stable

COPY package.json /app
RUN mkdir admin frontend
COPY admin/package.json /app/admin
COPY frontend/package.json /app/frontend

RUN yarn install --immutable

COPY ./ /app
ENV SKIP_ENV_VALIDATION=true
RUN yarn build

CMD [ "yarn", "start" ]
