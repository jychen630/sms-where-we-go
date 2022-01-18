docker compose down
docker volume rm sms-where-we-go_pgdata-dev
docker compose build
docker compose run api-dev yarn knex migrate:latest
docker compose run db-dev sh -c "cat /opt/backup-2021-12-29_01.sql | psql development wwgadmin -h db-dev" 