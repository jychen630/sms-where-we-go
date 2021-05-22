PARENT_PATH=$(cd "$(dirname "{BASH_SOURCE[0]}")"; pwd -P)
cd $PARENT_PATH

if ! command yarn -v
then
    echo "Yarn installation not found, trying to install yarn with npm..."
    npm install --global yarn --force
    if [ $? -eq 0 ];
    then
        echo "Successfully installed yarn. Continuing..."
    else
        echo "You may try to rerun the script as an administrator"
        echo "or install yarn before setting up the project..."
        exit 1
    fi
fi

echo 'Setting up packages for frontend...'
cd frontend
yarn -i
echo 'Setting up packages for backend...'
cd ../backend
yarn -i
