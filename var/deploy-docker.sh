#!/usr/bin/env bash
apk upgrade --no-cache
apk add --update curl

# Deploy to Docker Hub
docker pull psono-docker.jfrog.io/psono/psono-admin-client:latest
docker tag psono-docker.jfrog.io/psono/psono-admin-client:latest psono/psono-admin-client:latest
docker push psono/psono-admin-client:latest

# Inform production stage about new image
curl -X POST https://hooks.microbadger.com/images/psono/psono-admin-client/mQL9_d3jeUgSgEF1WMmat_rKrv8=
curl -X POST $psono_image_updater_url