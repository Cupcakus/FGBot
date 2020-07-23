FROM node:14-alpine

RUN mkdir -p /app \
    && apk add --no-cache git

WORKDIR /app

COPY package-lock.json /app
COPY package.json /app

RUN /usr/local/bin/npm install

COPY main.js /app

ENV FGBOT_DB_NAME=grognarddb
ENV FGBOT_DISCORD_BOT_TOKEN=set_to_valid_token

ENTRYPOINT ["/usr/local/bin/npm"]
CMD ["start"]
