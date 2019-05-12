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
npm ci && \
npm install -g karma-cli && \
INLINE_RUNTIME_CHUNK=false PUBLIC_URL=http://example.com/portal npm run build && \
./var/update_version.sh && \
cp LICENSE.md build/LICENSE.md
 
