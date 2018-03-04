#!/usr/bin/env bash
apt-get update && \
apt-get install -y curl apt-transport-https zip && \
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
apt-get update && \
apt-get -y install nodejs yarn && \
yarn --version && \
yarn config set registry https://psono.jfrog.io/psono/api/npm/npm/ && \
yarn config set @devexpress:registry https://psono.jfrog.io/psono/api/npm/npm/ && \
yarn config set @types:registry https://psono.jfrog.io/psono/api/npm/npm/ && \
yarn install && \
yarn global add karma-cli -g && \
yarn build && \
./var/update_version.sh && \
cp LICENSE.md build/LICENSE.md
 
