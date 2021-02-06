#!/usr/bin/env bash
apk upgrade --no-cache
apk add --update curl

# Deploy to Docker Hub
docker pull psono-docker.jfrog.io/psono/psono-admin-client:latest
docker tag psono-docker.jfrog.io/psono/psono-admin-client:latest psono/psono-admin-client:latest
docker push psono/psono-admin-client:latest

# Inform production stage about new image
curl -X POST https://hooks.microbadger.com/images/psono/psono-admin-client/mQL9_d3jeUgSgEF1WMmat_rKrv8=

echo "Trigger psono combo rebuild"
curl -X POST -F token=$PSONO_COMBO_TRIGGER_TOKEN -F ref=master https://gitlab.com/api/v4/projects/16086547/trigger/pipeline
curl -X POST -F token=$PSONO_COMBO_EE_TRIGGER_TOKEN -F ref=master https://gitlab.com/api/v4/projects/16127995/trigger/pipeline
