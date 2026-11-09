#!/usr/bin/env bash
set -e

upload_if_exists() {
    if [ -f "$1" ]; then
        gcloud storage cp "$1" "$2"
    fi
}

apt-get update && \
apt-get install -y lsb-release curl gnupg && \
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] http://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && \
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg  add - && \
apt-get update -y && apt-get install google-cloud-cli -y && \
echo "$GOOGLE_APPLICATION_CREDENTIALS" > "/root/key.json" && \
gcloud auth activate-service-account --key-file=/root/key.json

upload_if_exists webclient.zip "gs://get.psono.com/psono/psono-admin-client/nightly/adminclient.zip"
upload_if_exists sbom.json "gs://get.psono.com/psono/psono-admin-client/nightly/sbom.json"
