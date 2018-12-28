#!/usr/bin/env bash
apt-get update && \
apt-get install -y curl apt-transport-https zip && \
curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
apt-get update && \
apt-get -y install nodejs yarn && \
npm --version && \
yarn config set registry https://psono.jfrog.io/psono/api/npm/npm/ && \
yarn config set @devexpress:registry https://psono.jfrog.io/psono/api/npm/npm/ && \
yarn config set @types:registry https://psono.jfrog.io/psono/api/npm/npm/ && \
yarn install && \
yarn global add karma-cli -g && \
yarn build && \
./var/update_version.sh && \
cp LICENSE.md build/LICENSE.md
 
