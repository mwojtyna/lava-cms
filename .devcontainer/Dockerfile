FROM node:18.12.1-slim

WORKDIR /workspaces/www

RUN apt-get update
RUN apt-get install sudo -y
RUN apt-get install openssl -y
RUN apt-get install git netcat -y
RUN ln -sf /usr/share/zoneinfo/Europe/Warsaw /etc/localtime

RUN npm install -g pnpm
RUN npm install -g npm-upgrade
RUN npm install -g git-open
