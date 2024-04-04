#!/usr/bin/env bash
apk upgrade --no-cache
apk add --update curl skopeo

# Deploy to Docker Hub
skopeo copy --all docker://$CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG docker://docker.io/psono/psono-admin-client:latest

export docker_version_tag=$(echo $CI_COMMIT_TAG | awk  '{ string=substr($0, 2, 100); print string; }' )
skopeo copy --all docker://$CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG docker://docker.io/psono/psono-admin-client:$docker_version_tag

echo "Trigger psono combo rebuild"
curl -X POST -F token=$PSONO_COMBO_TRIGGER_TOKEN -F ref=master https://gitlab.com/api/v4/projects/16086547/trigger/pipeline
curl -X POST -F token=$PSONO_COMBO_EE_TRIGGER_TOKEN -F ref=master https://gitlab.com/api/v4/projects/16127995/trigger/pipeline
