FROM node:18.12.1-slim

WORKDIR /workspaces/www

RUN apt-get update
RUN apt-get install openssl -y
RUN apt-get install git -y

RUN npm install -g pnpm
