PARENT_PATH=$(cd "$(dirname "{BASH_SOURCE[0]}")"; pwd -P)
cd $PARENT_PATH

if ! command yarn -v
then
    echo "[setup] Yarn installation not found, trying to install yarn with npm..."
    npm install --global yarn --force
    if [ $? -eq 0 ];
    then
        echo "[setup] Successfully installed yarn. Continuing..."
    else
        echo "[error] You may try to rerun the script as an administrator"
        echo "[error] or install yarn before setting up the project..."
        exit 1
    fi
fi

echo "[setup] Setting up packages for frontend..."
cd frontend
yarn -i
echo "[setup] Setting up packages for backend..."
cd ../backend
yarn -i
echo "[setup] Applying patches..."
yarn patch-package

cd ../
echo "[setup] Setting up environment variables..."
PG_USER=postgres
WWG_USER=wwgadmin
DB_NAME=wwg_base
SEARCH_PATH=wwg,public
BACKEND_ENV=backend/.env
export PGPASSFILE=~/.pgpass
PASSWORD="ThePasswordHere"
echo "*:*:$DB_NAME:$WWG_USER:$PASSWORD" > $PGPASSFILE
echo SECRET=MySecretHere$'\n'PGHOST=localhost$'\n'PGUSER=$WWG_USER$'\n'PGPASSWORD=$PASSWORD$'\n'PGDBNAME=$DB_NAME > $BACKEND_ENV
if ! pg_isready -U "$PG_USER" -q
then
    echo "[error] PostgreSQL is not running!"
    echo "[error] Please check your installation and start the service"
    exit 1
fi

echo "[setup] Setting up PostgreSQL..."
echo "----BEGIN POSTGRESQL----"
psql -v ON_ERROR_STOP=1 -h localhost -U $PG_USER -q -e << EOF
SET CLIENT_ENCODING TO utf8;
DO \$\$
BEGIN
    CREATE USER $WWG_USER;
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE '$WWG_USER already exists';
END \$\$;
ALTER ROLE $WWG_USER PASSWORD '$PASSWORD';
ALTER ROLE $WWG_USER SET search_path TO $SEARCH_PATH;
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $WWG_USER;
EOF
if [ $? -eq 0 ];
then
    echo "[setup] Successfully set up the role and the database."
else
    echo "[error] Some error has occurred during the process of initializing the role and the database..."
    exit 1
fi
echo "----END POSTGRESQL----"

echo "[setup] Credentials for $WWG_USER are stored to $PGPASSFILE."
echo "[setup] Initializing the schema."
echo "----BEGIN POSTGRESQL----"
psql -v ON_ERROR_STOP=1 -f ./init.sql -U $WWG_USER -h localhost -q -e $DB_NAME
if [ $? -eq 0 ];
then
    echo "[setup] Successfully set up PostgreSQL."
else
    echo "[Error] Some error has occurred during the process of initializing the schema..."
    exit 1
fi
echo "----END POSTGRESQL----"

cd backend
echo "[setup] Running yarn load to prepare the types and test data..."
yarn load

echo "[setup] All done with envrionment setup."
echo '[setup] Please use sh "deploy.sh" to deploy the website.'
