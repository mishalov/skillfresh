FROM node:18-alpine
# Installing libvips-dev for sharp Compatibility
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev

WORKDIR /opt/
COPY package.json package-lock.json ./
COPY ./initial-seed.tar.gz /opt/scripts/initial-seed.tar.gz

RUN npm config set fetch-retry-maxtimeout 600000 -g && npm install

WORKDIR /opt/app
COPY . .
ENV PATH /opt/node_modules/.bin:$PATH
RUN chown -R node:node /opt/app
USER node
RUN ["npm", "run", "build"]
RUN npx strapi import -f /opt/scripts/initial-seed.tar.gz --force

EXPOSE 1337
CMD ["npm", "run", "develop"]
