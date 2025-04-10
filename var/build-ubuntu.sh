#!/usr/bin/env bash
apt-get update && \
apt-get install -y ca-certificates curl gnupg apt-transport-https zip && \
mkdir -p /etc/apt/keyrings && \
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
apt-get update && \
apt-get -y install nodejs && \
npm --version && \
npm config set registry https://psono.jfrog.io/psono/api/npm/npm/ && \
npm config set @devexpress:registry https://psono.jfrog.io/psono/api/npm/npm/ && \
npm config set @types:registry https://psono.jfrog.io/psono/api/npm/npm/ && \
npm ci && \
npm install -g karma-cli && \
INLINE_RUNTIME_CHUNK=false npm run build && \
./var/update_version.sh && \
cp LICENSE.md build/LICENSE.md
 
