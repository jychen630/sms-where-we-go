set -e

# set up api environmental varible from secret files
echo "Setting up the api secret environmental variables"
export AMAP_SECRET=$(tr -d '\r' < /run/secrets/amap_token)
export EXPRESS_SESSION_SECRET=$(tr -d '\r' < /run/secrets/express_session_secret)
export PGPASSWORD=$(tr -d '\r' < /run/secrets/pg_password)

if [ $API_ENV = development ]
then
    yarn knex migrate:latest
    yarn deploy
elif [ $API_ENV = production ]
then 
    yarn start-prod
else  
    echo "Error: API_ENV is invalid" && exit 1
fi
