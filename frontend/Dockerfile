FROM node:16-alpine as setup
WORKDIR /app
COPY . .
RUN yarn

FROM setup as build
WORKDIR /app
RUN yarn build

# In the final build, we only keep
# the /app/build directory from the build stage
FROM node:16-alpine as app
WORKDIR /app
COPY --from=build /app/build ./
RUN yarn global add serve
EXPOSE 5000/tcp
CMD serve -s build -p 5000
