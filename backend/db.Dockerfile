FROM postgres:14-alpine
COPY ./db_scripts/* /docker-entrypoint-initdb.d/