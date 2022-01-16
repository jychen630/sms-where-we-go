FROM node:16-alpine as dependencies
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# This is used in the development environment and the build stage
FROM dependencies as source
WORKDIR /app
COPY public ./public
COPY src ./src
COPY craco.config.js tsconfig.json docker-entrypoint.sh ./

FROM source as development
WORKDIR /app
# We mounted the dev version of wwg-api from a volume on this directory
# and use yarn link to create a symbolic link
ENV WEB_ENV=development
CMD [ "./docker-entrypoint.sh" ]

FROM source as build
WORKDIR /app
ARG API_HOST="http:\/\/localhost:8080\/v1"
RUN sed -i "s/BASE: '.*'/BASE: '${API_HOST}'/" node_modules/wwg-api/build/core/OpenAPI.js
RUN yarn build

# In the final build, we only keep
# the /app/build directory from the build stage
FROM node:16-alpine as production
WORKDIR /app
COPY docker-entrypoint.sh ./
COPY --from=build /app/build ./
RUN yarn global add serve \
    && yarn cache clean
EXPOSE 5000/tcp
ENV WEB_ENV=production
CMD [ "./docker-entrypoint.sh" ]
