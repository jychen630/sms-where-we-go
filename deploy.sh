PARENT_PATH=$(cd "$(dirname "{BASH_SOURCE[0]}")"; pwd -P)
cd $PARENT_PATH

cd frontend
yarn start &
(
    cd ../backend
    yarn generate
    yarn deploy
) && fg
wait
