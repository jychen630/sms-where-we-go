PARENT_PATH=$(cd "$(dirname "{BASH_SOURCE[0]}")"; pwd -P)
cd $PARENT_PATH

echo "[setup] Setting up secret files..."
mkdir -p ../secrets
cd ../secrets
touch amap_token pg_password mapbox_token express_session_secret

echo "[setup] Pulling images"
docker compose pull
