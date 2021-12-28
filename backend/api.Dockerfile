# syntax=docker/dockerfile:1
FROM node:16-alpine  
WORKDIR /app
COPY . .
RUN yarn && yarn patch-package
CMD yarn deploy
