#!/usr/bin/env bash
# Déploiement production sur le serveur (appelé par GitHub Actions via SSH).
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/opt/eventhub}"
GHCR_OWNER="$(echo "${GHCR_OWNER:?GHCR_OWNER requis}" | tr '[:upper:]' '[:lower:]')"
IMAGE_TAG="${IMAGE_TAG:-latest}"
GHCR_USER="${GHCR_USER:?GHCR_USER requis}"
GHCR_TOKEN="${GHCR_TOKEN:?GHCR_TOKEN requis}"

cd "$DEPLOY_PATH"

echo "==> Login GHCR"
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin

echo "==> Pull images (${GHCR_OWNER}, tag=${IMAGE_TAG})"
export GHCR_OWNER IMAGE_TAG
docker compose -f docker-compose.prod.yml --env-file .env pull

echo "==> Restart stack"
docker compose -f docker-compose.prod.yml --env-file .env up -d --remove-orphans

echo "==> Status"
docker compose -f docker-compose.prod.yml --env-file .env ps

echo "==> Deploy OK"
