#!/usr/bin/env bash
apt-get update && \
apt-get install -y curl apt-transport-https zip && \
curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
apt-get update && \
apt-get -y install nodejs && \
npm --version && \
npm config set registry https://psono.jfrog.io/psono/api/npm/npm/ && \
npm config set @devexpress:registry https://psono.jfrog.io/psono/api/npm/npm/ && \
npm config set @types:registry https://psono.jfrog.io/psono/api/npm/npm/ && \
npm install && \
npm install -g karma-cli && \
npm run build && \
./var/update_version.sh && \
cp LICENSE.md build/LICENSE.md
 
