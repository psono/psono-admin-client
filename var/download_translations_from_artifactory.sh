#!/usr/bin/env bash
set -e

# poeditor language codes: https://poeditor.com/docs/languages

apt-get update && \
apt-get install -y curl && \
curl -f -o public/locales/da/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-da.json && \
curl -f -o public/locales/ca/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-ca.json && \
curl -f -o public/locales/sv/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-sv.json && \
curl -f -o public/locales/no/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-no.json && \
curl -f -o public/locales/he/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-he.json && \
curl -f -o public/locales/ar/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-ar.json && \
curl -f -o public/locales/hi/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-hi.json && \
curl -f -o public/locales/hu/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-hu.json && \
curl -f -o public/locales/bn/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-bn.json && \
curl -f -o public/locales/cs/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-cs.json && \
curl -f -o public/locales/de/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-de.json && \
curl -f -o public/locales/en/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-en.json && \
curl -f -o public/locales/es/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-es.json && \
curl -f -o public/locales/fi/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-fi.json && \
curl -f -o public/locales/fr/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-fr.json && \
curl -f -o public/locales/hr/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-hr.json && \
curl -f -o public/locales/it/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-it.json && \
curl -f -o public/locales/ja/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-ja.json && \
curl -f -o public/locales/ko/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-ko.json && \
curl -f -o public/locales/nl/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-nl.json && \
curl -f -o public/locales/pt/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-pt.json && \
curl -f -o public/locales/pt-br/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-pt-br.json && \
curl -f -o public/locales/pl/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-pl.json && \
curl -f -o public/locales/ru/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-ru.json && \
curl -f -o public/locales/sk/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-sk.json && \
curl -f -o public/locales/vi/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-vi.json && \
curl -f -o public/locales/zh-Hant/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-zh-Hant.json && \
curl -f -o public/locales/zh-Hans/translation.json https://psono.jfrog.io/psono/psono/admin-client/languages/locale-zh-Hans.json
