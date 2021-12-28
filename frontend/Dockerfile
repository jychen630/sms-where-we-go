FROM node:16-alpine as dependencies
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# This is used in the development environment and the build stage
FROM dependencies as source
WORKDIR /app
COPY public ./public
COPY src ./src
COPY .env.local craco.config.js tsconfig.json ./

FROM source as development
WORKDIR /app
# We mounted the dev version of wwg-api from a volume on this directory
# and use yarn link to create a symbolic link
CMD sh -c 'yarn --cwd /usr/local/lib/wwgclient link && yarn link wwg-api && yarn start'

FROM source as build
WORKDIR /app
RUN yarn build

# In the final build, we only keep
# the /app/build directory from the build stage
FROM node:16-alpine as production
WORKDIR /app
COPY --from=build /app/build ./
RUN yarn global add serve \
    && yarn cache clean
EXPOSE 5000/tcp
CMD serve -s . -p 5000
