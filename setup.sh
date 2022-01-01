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
yarn
echo "[setup] Setting up packages for backend..."
cd ../backend
yarn
echo "[setup] Applying patches..."
yarn patch-package


echo "[setup] Setting up secret files..."
mkdir ../secrets
cd ../secrets
touch amap_token pg_password

cd ../backend
echo "[setup] Running yarn load to prepare the types and test data..."
yarn load

echo "[setup] All done with envrionment setup."
echo '[setup] Please use sh "deploy.sh" to deploy the website.'
