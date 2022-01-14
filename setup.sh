echo "[setup] Setting up secret files..."
mkdir -p secrets
cd secrets
touch amap_token pg_password mapbox_token express_session_secret

echo "[setup] Pulling images"
cd ..
docker-compose pull
