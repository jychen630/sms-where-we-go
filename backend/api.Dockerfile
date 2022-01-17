FROM node:16-alpine as dependencies
WORKDIR /app
# The followings use separate RUN to help with caching
# Prepare the dependencies
# Install git
RUN apk --no-cache add git
COPY package.json yarn.lock ./
RUN yarn
# Apply patches
COPY patches ./patches
RUN yarn patch-package
# Generate the client package
COPY openapi.yaml ./
RUN yarn generate

FROM node:16-alpine as openapi-build
WORKDIR /app
COPY src/generated/package.json src/generated/yarn.lock ./
RUN yarn
COPY --from=dependencies /app/src/generated ./
COPY src/generated/package.json src/generated/tsconfig.json ./
RUN yarn tsc -b

# This prepares for build and is used as the target for development environment
FROM node:16-alpine as source
WORKDIR /app
COPY src ./src
# Prepare files necessary for development and building
COPY package.json yarn.lock tsconfig.json openapi.yaml knexfile.ts docker-entrypoint.sh ./
COPY migrations ./migrations
COPY seeds ./seeds
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=openapi-build /app/build ./src/generated/build
RUN yarn build
ENV API_ENV=development
CMD [ "./docker-entrypoint.sh" ]

FROM node:16-alpine as production
WORKDIR /app
COPY package.json openapi.yaml docker-entrypoint.sh ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=openapi-build /app/build ./src/generated/build
COPY --from=source /app/build ./build
#CMD yarn start-prod, ./ means execucion,dont write sh
ENV API_ENV=production
CMD [ "./docker-entrypoint.sh" ]