#!/bin/sh

set -e

export REACT_APP_MAPBOX_TOKEN=$(tr -d '\r' < /run/secrets/mapbox_token)

if [ $WEB_ENV = development ]
then 
    yarn --cwd /usr/local/lib/wwgclient link && yarn link wwg-api
    exec yarn start
elif [ $WEB_ENV = production ]
then 
    exec serve -s . -l tcp://0.0.0.0:5000
else  
    echo "Error: WEB_ENV is invalid" && exit 1
fi
