PARENT_PATH=$(cd "$(dirname "{BASH_SOURCE[0]}")"; pwd -P)
cd $PARENT_PATH

sh setup.sh
cd frontend
yarn start &
(
    cd ../backend
    yarn deploy
) && fg
wait
