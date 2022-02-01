FROM node:16-alpine

WORKDIR /app

ADD package.json yarn.lock ./

RUN yarn install

ADD . .

EXPOSE 25

CMD ["yarn", "start"]
