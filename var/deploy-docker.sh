#!/usr/bin/env bash
apk add --update curl

# Deploy to Docker Hub
docker pull psono-docker.jfrog.io/psono/psono-admin-client:latest
docker tag psono-docker.jfrog.io/psono/psono-admin-client:latest psono/psono-admin-client:latest
docker push psono/psono-admin-client:latest

# Inform production stage about new image
# curl -X POST https://hooks.microbadger.com/images/psono/psono-admin-client/jMnJgDVZTpT4TUX-RlxTKa38Nc4=
# curl -X POST $psono_image_updater_url